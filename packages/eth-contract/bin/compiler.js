#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const solcWrapper = require("solc/wrapper");
const https = require('https');

const SolcjsPath = path.resolve(__dirname, 'solcjs');
const codeGen = require('./codeGen');
const RootPath = process.env.PWD;

/*
https://solc-bin.ethereum.org/bin/list.json
https://ethereum.github.io/solc-bin/bin/list.json
*/

let _libMap;
let _sourceDir;

const request = function(url){
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

function getCache(version) {
    let files = fs.readdirSync(SolcjsPath);
    files = files.find(e => new RegExp(`soljson-v${version}\\+commit.[0-9a-f]{8}.js`).test(e));
    return files ? (path.resolve(SolcjsPath, files)) : null;
}
async function downloadSolc(version) {
    try {
        let data = await request("https://solc-bin.ethereum.org/bin/list.json");
        let list = JSON.parse(data.body);
        if (list) {
            let file = list.releases[version];
            if (file) {
                let build = list.builds.find(e => e.path == file);
                if (build) {
                    let filename = build.path;
                    let solcjs = await request("https://solc-bin.ethereum.org/bin/" + filename);
                    solcjs = solcjs.body;
                    if (!fs.existsSync(SolcjsPath))
                        fs.mkdirSync(SolcjsPath, {recursive:true});
                    let solcjsPath = path.resolve(SolcjsPath, filename);
                    fs.writeFileSync(solcjsPath, solcjs);
                    return solcjsPath;
                }
            }
        }
    } catch (e) { console.log(e); }
}
async function getSolc(version) {
  let solcjsPath = getCache(version);
  if (!solcjsPath) {
    solcjsPath = await downloadSolc(version);
  }
  if (!solcjsPath) {
    return null;
  }
  let solc = solcWrapper(require(solcjsPath));
  return solc;
}

function recursiveAdd(root, srcPath, sources) {
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
                let _path = path.join(srcPath, files[i]).replace(/\\/g, "/").replace(/^([A-Za-z]):/, "/$1");
                sources[_path.replace(new RegExp(`^${root}`),'contracts/')] = { content: fs.readFileSync(path.resolve(currPath, files[i]), "utf8") };
            }
        }
    }
    for (let i = 0; i < files.length; i++) {
        if (stats[i].isDirectory()) {
            recursiveAdd(root, path.join(srcPath, files[i]), sources);
        }
    }
    return sources;
}
function buildInput(root, source) {    
    let input = {
        language: "Solidity",
        sources: {},
        settings:
        {
            // remappings: [ ":g=./contracts" ],
            optimizer: {
                enabled: true,
                runs: 999999
            },
            // evmVersion: "istanbul",//"constantinople",//"byzantium",
            outputSelection: {
                "*": {
                    "*": ["abi", "evm", "evm.bytecode", "evm.bytecode.object"]
                }
            }
        },
    };
    if (source && Array.isArray(source)){
        source.forEach(e=>recursiveAdd(root, e, input.sources));
    } else {
        recursiveAdd(root, "", input.sources);
    }
    return input;
}

function findImports(path) {
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

function prettyPrint1(s) {
    let i = 0;
    return s.split('').map(e => {
        if (e == '[') i++; else if (e == ']') i--;
        return i == 0 ? e == "{" ? "{\n  " : e == "," ? ",\n  " : e == "}" ? "\n}" : e : e;
    }).join('');
}
function processOutput(output, outputDir) {
    let index = '';
    if (output.contracts) {
        for (let i in output.contracts) {
            let p = path.dirname(i.replace(/^contracts\//,''));
            p = p=='.' ? '' : (p + '/');

            for (let j in output.contracts[i]) {
                let bytecode = output.contracts[i][j].evm?.bytecode?.object;
                if (bytecode && output.contracts[i][j].abi && output.contracts[i][j].abi.length){
                    if (!fs.existsSync(outputDir + '/' + p))
                        fs.mkdirSync(outputDir + '/' + p, { recursive: true });
                    fs.writeFileSync(outputDir + '/' + p + j +  '.json.ts', 'export default ' + JSON.stringify({
                        abi: output.contracts[i][j].abi,
                        bytecode: bytecode
                    }, null, 4));
                    let code = codeGen(j, `./${j}.json.ts`, output.contracts[i][j].abi);
                    fs.writeFileSync(outputDir + '/' + p + j +  '.ts', code);
                    index += `export { ${j} } from \'./${j}\';\n`;
                }
            }
        }
    }
    return index;
}
async function main(solVersion, contractDir, outputDir) {
    if (!contractDir.endsWith('/') && !contractDir.endsWith('.sol'))
        contractDir = contractDir + '/';
    if (!outputDir)
        outputDir = contractDir;
    
    fs.mkdirSync(outputDir, { recursive: true });
    
    try {
        let solc = await getSolc(solVersion);        
        let input = buildInput(contractDir, null);
        let output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
        let index = processOutput(output, outputDir);
        fs.writeFileSync(path.join(outputDir, '/index.ts'), index);        
        if (output.errors) {
            output.errors/*.filter(e=>e.severity!='warning')*/.forEach(e => console.log(e.formattedMessage));
        }
    } catch (e) { console.log(e); }
}
main(process.argv[2]/*solidity version*/, process.argv[3]/*contract dir*/, process.argv[4]/*output dir*/);
