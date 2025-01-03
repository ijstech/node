#!/usr/bin/env node

/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

import codeGen, {IUserDefinedOptions} from './codeGen';
import flattenSolidityFile from './flatten';

const SolcjsPath = path.resolve(__dirname, 'solcjs');
if (!fs.existsSync(SolcjsPath))
    fs.mkdirSync(SolcjsPath);
    
const RootPath = process.env.PWD;

/*
https://solc-bin.ethereum.org/bin/list.json
https://ethereum.github.io/solc-bin/bin/list.json
*/

let _libMap: {[soource:string]:string|string[]};
let _sourceDir: string;

function request(url: string): Promise<{statusCode:number, headers:http.IncomingHttpHeaders, body:string}> {
    return new Promise(function(resolve, reject){
        https.get(url,function(res){
            let body = '';
            res.on('data', (chunk) => (body += chunk.toString()));
            res.on('error', reject);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode <= 299) {
                    resolve({ statusCode: res.statusCode, headers: res.headers, body: body });
                } else {
                    reject('Request failed. status: ' + res.statusCode + ', body: ' + body);
                }
            });
        });
    });
};

function getCache(version: string): string {
    let files = fs.readdirSync(SolcjsPath).find(e => new RegExp(`soljson-v${version}\\+commit.[0-9a-f]{8}.js`).test(e));
    return files ? (path.resolve(SolcjsPath, files)) : null;
}
async function downloadSolc(version: string): Promise<string> {
    try {
        let data = await request("https://solc-bin.ethereum.org/bin/list.json");
        let list = JSON.parse(data.body);
        if (list) {
            let file = list.releases[version || list.latestRelease];
            if (file) {
                let build = list.builds.find(e => e.path == file);
                if (build) {
                    let filename = build.path;
                    let solcjs = await request("https://solc-bin.ethereum.org/bin/" + filename);
                    if (!fs.existsSync(SolcjsPath))
                        fs.mkdirSync(SolcjsPath, {recursive:true});
                    let solcjsPath = path.resolve(SolcjsPath, filename);
                    fs.writeFileSync(solcjsPath, solcjs.body);
                    return solcjsPath;
                }
            }
        }
    } catch (e) { console.log(e); }
}
async function getSolc(version: string): Promise<any> {
  let solcjsPath: string;
  if (version)
    solcjsPath = getCache(version);
  if (!solcjsPath) {
    solcjsPath = await downloadSolc(version);
  }
  if (!solcjsPath) {
    return null;
  }
  let solc = require("solc/wrapper")(require(solcjsPath));
  return solc;
}

interface Source {[contract:string]:{content:string}}
interface Input {language:string, sources:Source, settings:{optimizer?:{enabled:boolean, runs:number}, outputSelection:{[contract:string]:{[contract:string]:string[]}}}}

function recursiveAdd(root: string, srcPath: string, sources: Source, exclude: string[]): Source {
    let currPath = path.join(root, srcPath);
    // signle file
    if (fs.statSync(currPath).isFile()) {
        sources[currPath.replace(new RegExp(`^${root}`),'contracts/')] = { content: fs.readFileSync(currPath, "utf8") };
        return sources;
    }
    else if (fs.existsSync(path.join(currPath, '.ignoreAll')))
        return;

    let files = fs.readdirSync(currPath);
    let stats = files.map(e => fs.statSync(path.resolve(currPath, e)))
    for (let i = 0; i < files.length; i++) {
        if (files[i].endsWith(".sol") && stats[i].isFile()) {
            if (sources[files[i]]) {
                console.log(files[i] + " already exists");
            } else {
                let _path = path.join(root, srcPath, files[i]).replace(/\\/g, "/").replace(/^([A-Za-z]):/, "/$1");
                if ((!exclude || !exclude.includes(_path)))
                    sources[_path.replace(new RegExp(`^${root}`),'contracts/')] = { content: fs.readFileSync(path.resolve(currPath, files[i]), "utf8") };
            }
        }
    }
    for (let i = 0; i < files.length; i++) {
        if (stats[i].isDirectory()) {
            recursiveAdd(root, path.join(srcPath, files[i]), sources, exclude);
        }
    }
    return sources;
}
function buildInput(root: string, source: string[], optimizerRuns: number, viaIR:boolean, exclude?: string[]): Input {
    let input = {
        language: "Solidity",
        sources: {},
        settings:
        {
            // remappings: [ ":g=./contracts" ],
            optimizer: optimizerRuns ? {
                enabled: true,
                runs: optimizerRuns || 999999
            } : undefined,
            viaIR: viaIR,
            // evmVersion: "istanbul",//"constantinople",//"byzantium",
            outputSelection: {
                "*": {
                    "*": ["abi", "evm", "evm.bytecode", "evm.bytecode.object"]
                }
            }
        },
    };
    if (source && Array.isArray(source) && source.length){
        source.forEach(e=>recursiveAdd(root, e, input.sources, exclude));
    } else {
        recursiveAdd(root, "", input.sources, exclude);
    }
    return input;
}

function findImports(path: string): {contents:string} {
    if (fs.existsSync(path.replace(/^contracts\//,_sourceDir))) {
        return {
            contents:
               fs.readFileSync(path.replace(/^contracts\//,_sourceDir), "utf8")
        }
    }

    let target = "node_modules/" + path;
    if (fs.existsSync(target)) {
        return {
            contents:
                fs.readFileSync(target, "utf8")
        }
    }

    for (let prefix in _libMap) {
        if (path.startsWith(prefix)) {
            let sourceDir = _sourceDir;
            if (sourceDir.endsWith(".sol")) {
                sourceDir = sourceDir.replace(/[a-zA-Z0-9_-]+\.sol$/, "");
            }
            let targetList = _libMap[prefix];
            if (!Array.isArray(targetList)) targetList = [targetList];
            for (let j = 0; j < targetList.length; j++) {
                let target = path.replace(prefix, sourceDir + targetList[j]);
                if (fs.existsSync(target)) {
                    return {
                        contents:
                            fs.readFileSync(target, "utf8")
                    }
                }
            }
        }
    }
    console.log("import contract not found: " + path);
}

function prettyPrint(s: string): string {
    let j = 0;
    return s.split('').map(e => {
        if (e == '{') j++; else if (e == '}') j--;
        if (j == 1) {
            if (e == '{') return '{\n';
            else if (e == '[') return '[\n';
            else if (e == ',') return ',\n';
            else if (e == ']') return '\n]';
            else return e;
        } else if (j == 0) {
            if (e == '}') return '\n}';
            else return e;
        } else {
            return e;
        }
    }).join('');
}

interface Type { name: string; type: string; components?: Type[]; internalType?: string; }
interface Item { name: string; type: string; stateMutability: string; inputs?: Type[]; outputs?: Type[];}
interface Output {[sourceFile:string]:{[contract:string]:{evm:{bytecode:{object:string}},abi:Item[]}}}

// the compiled results of normal contracts have both abi and bytecode;
// the compiled results of abstract contracts and interfaces have abi only and without any bytecode;
// the compiled results of library contracts have bytecode and no abi
interface OutputOptions {
    abi?: boolean; // default = compiled result has both abi and bytecode
    bytecode?: boolean; // default = compiled result has both abi and bytecode
    batchCall?: boolean; //default false
    txData?: boolean; //default false
}
function processOutput(sourceDir: string, output:Output, outputDir: string, outputOptions: OutputOptions, exclude?: string[], include?: string[]): string {
    let index = '';
    if (output.contracts) {
        for (let i in output.contracts) {
            if (include && !include.includes(sourceDir+i.replace(/^contracts\//,'')))
                continue;
            if (exclude && exclude.includes(sourceDir+i.replace(/^contracts\//,'')))
                continue;

            let p = path.dirname(i.replace(/^contracts\//,''));
            p = p=='.' ? '' : (p + '/');

            outputOptions = outputOptions || {};

            for (let j in output.contracts[i]) {
                let abi = output.contracts[i][j].abi;
                let bytecode = output.contracts[i][j].evm?.bytecode?.object;

                let outputBytecode = (outputOptions.bytecode === undefined) ? (!!(bytecode && abi && abi.length)) : (outputOptions.bytecode && bytecode);
                let outputAbi = (outputOptions.abi === undefined) ? (!!(bytecode && abi && abi.length)) : (outputOptions.abi && abi && abi.length);
                let linkReferences = output.contracts[i][j].evm?.bytecode?.linkReferences;

                if (outputBytecode || outputAbi) {
                    if (!fs.existsSync(outputDir + '/' + p))
                        fs.mkdirSync(outputDir + '/' + p, { recursive: true });

                    let file = {};
                    if (outputAbi) {
                        file["abi"] = abi;
                    }
                    if (outputBytecode) {
                        file["bytecode"] = bytecode;
                    }
                    let hasLinkReferences = Object.keys(linkReferences).length;
                    if (hasLinkReferences) {
                        file["linkReferences"] = linkReferences;
                    }
                    fs.writeFileSync(outputDir + '/' + p + j +  '.json.ts', "export default " + prettyPrint(JSON.stringify(file)));

                    let relPath = './';         
                    let hasBatchCall = outputOptions.batchCall;       
                    let hasTxData = outputOptions.txData;       
                    let options: IUserDefinedOptions = {
                        outputAbi,
                        outputBytecode,
                        hasBatchCall,
                        hasTxData
                    }
                    let code = codeGen(j, relPath, abi, hasLinkReferences?linkReferences:null, options);
                    fs.writeFileSync(outputDir + '/' + p + j +  '.ts', code);

                    index += `export { ${j} } from \'./${p + j}\';\n`;
                }
            }
        }
    }
    return index;
}

interface CompileOptions { version?: string; optimizerRuns?: number; viaIR?:boolean, outputOptions?: OutputOptions }
interface Override extends CompileOptions { root?:string, sources:string[]; };
interface Config extends CompileOptions {
    sourceDir?: string;
    outputDir?: string;
    output?: string;
    overrides?: Override[];
    libMap?: {[soource:string]:string};
    flattenFiles?: string[];
}

async function main(configFilePath: string) {
    let config:Config = fs.existsSync(configFilePath) ? (fs.statSync(configFilePath).isFile() ? JSON.parse(fs.readFileSync(configFilePath, "utf-8")) : {sourceDir:configFilePath}) : {};
    let rootPath = process.cwd();
    let configPath = path.dirname(path.resolve(path.join(rootPath, configFilePath)));
    
    let {version, optimizerRuns, viaIR, sourceDir, outputDir, outputOptions, overrides, libMap, flattenFiles} = config;

    if (!sourceDir) {
        sourceDir = "contracts/";
        if (!outputDir)
            outputDir = "src/contracts/";
    } else {
        if (!outputDir)
            outputDir = sourceDir;
    }
    sourceDir = path.join(configPath, sourceDir);
    if (!sourceDir.endsWith('/') && !sourceDir.endsWith('.sol'))
        sourceDir = sourceDir + '/';
    outputDir = path.join(configPath, outputDir);
    fs.mkdirSync(outputDir, { recursive: true });

    _libMap = libMap;

    try {
        let solc = await getSolc(version);
        let root = sourceDir;
        _sourceDir = sourceDir;
        let customSources = overrides && overrides.map(e=>e.sources.map(f=>(e.root||root)+f)).reduce((a,b)=>a.concat(b),[]);
        let input = buildInput(sourceDir, null, optimizerRuns, viaIR, customSources);
        let output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
        let index = processOutput(sourceDir, output, outputDir, outputOptions, customSources);
        if (output.errors) {
            output.errors/*.filter(e=>e.severity!='warning')*/.forEach(e => console.log(e.formattedMessage));
        }

        if (overrides) {
            for (let s in overrides) {
                if (overrides[s].version && overrides[s].version!=version) {
                    solc = await getSolc(overrides[s].version);
                }
                _sourceDir = overrides[s].root || root;
                input = buildInput(_sourceDir, overrides[s].sources, overrides[s].optimizerRuns||optimizerRuns, viaIR)
                output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
                index = index + processOutput(sourceDir, output, outputDir, overrides[s].outputOptions || outputOptions, [], overrides[s].sources.map(f=>_sourceDir+f));
                if (output.errors) {
                    output.errors/*.filter(e=>e.severity!='warning')*/.forEach(e=>console.log(e.formattedMessage));
                }
            }
        }
        fs.writeFileSync(outputDir + '/index.ts', index);
        
        if (flattenFiles) {
            const flattenedDestDir = path.join(configPath, 'flattened/');
            if (!fs.existsSync(flattenedDestDir)) {
                fs.mkdirSync(flattenedDestDir);
            }
            for (let file of flattenFiles) {
                const sourceFile = path.join(configPath, file);
                const destFile = flattenedDestDir + path.basename(sourceFile);
                await flattenSolidityFile(sourceFile, destFile);
            }
        }
    } catch (e) { console.log(e); }
}

main(process.argv[2] || "solidity.config.json");
