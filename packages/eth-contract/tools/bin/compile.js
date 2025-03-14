#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const https = __importStar(require("https"));
const codeGen_1 = __importDefault(require("./codeGen"));
const flatten_1 = __importDefault(require("./flatten"));
const SolcjsPath = path.resolve(__dirname, 'solcjs');
if (!fs.existsSync(SolcjsPath))
    fs.mkdirSync(SolcjsPath);
const RootPath = process.env.PWD;
/*
https://solc-bin.ethereum.org/bin/list.json
https://ethereum.github.io/solc-bin/bin/list.json
*/
let _libMap;
let _sourceDir;
function request(url) {
    return new Promise(function (resolve, reject) {
        https.get(url, function (res) {
            let body = '';
            res.on('data', (chunk) => (body += chunk.toString()));
            res.on('error', reject);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode <= 299) {
                    resolve({ statusCode: res.statusCode, headers: res.headers, body: body });
                }
                else {
                    reject('Request failed. status: ' + res.statusCode + ', body: ' + body);
                }
            });
        });
    });
}
;
function getCache(version) {
    let files = fs.readdirSync(SolcjsPath).find(e => new RegExp(`soljson-v${version}\\+commit.[0-9a-f]{8}.js`).test(e));
    return files ? (path.resolve(SolcjsPath, files)) : null;
}
async function downloadSolc(version) {
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
                        fs.mkdirSync(SolcjsPath, { recursive: true });
                    let solcjsPath = path.resolve(SolcjsPath, filename);
                    fs.writeFileSync(solcjsPath, solcjs.body);
                    return solcjsPath;
                }
            }
        }
    }
    catch (e) {
        console.log(e);
    }
}
async function getSolc(version) {
    let solcjsPath;
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
function recursiveAdd(root, srcPath, sources, exclude) {
    let currPath = path.join(root, srcPath);
    // signle file
    if (fs.statSync(currPath).isFile()) {
        sources[currPath.replace(new RegExp(`^${root}`), 'contracts/')] = { content: fs.readFileSync(currPath, "utf8") };
        return sources;
    }
    else if (fs.existsSync(path.join(currPath, '.ignoreAll')))
        return;
    let files = fs.readdirSync(currPath);
    let stats = files.map(e => fs.statSync(path.resolve(currPath, e)));
    for (let i = 0; i < files.length; i++) {
        if (files[i].endsWith(".sol") && stats[i].isFile()) {
            if (sources[files[i]]) {
                console.log(files[i] + " already exists");
            }
            else {
                let _path = path.join(root, srcPath, files[i]).replace(/\\/g, "/").replace(/^([A-Za-z]):/, "/$1");
                if ((!exclude || !exclude.includes(_path)))
                    sources[_path.replace(new RegExp(`^${root}`), 'contracts/')] = { content: fs.readFileSync(path.resolve(currPath, files[i]), "utf8") };
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
function buildInput(root, source, optimizerRuns, viaIR, exclude) {
    let input = {
        language: "Solidity",
        sources: {},
        settings: {
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
    if (source && Array.isArray(source) && source.length) {
        source.forEach(e => recursiveAdd(root, e, input.sources, exclude));
    }
    else {
        recursiveAdd(root, "", input.sources, exclude);
    }
    return input;
}
function findImports(path) {
    if (fs.existsSync(path.replace(/^contracts\//, _sourceDir))) {
        return {
            contents: fs.readFileSync(path.replace(/^contracts\//, _sourceDir), "utf8")
        };
    }
    let target = "node_modules/" + path;
    if (fs.existsSync(target)) {
        return {
            contents: fs.readFileSync(target, "utf8")
        };
    }
    for (let prefix in _libMap) {
        if (path.startsWith(prefix)) {
            let sourceDir = _sourceDir;
            if (sourceDir.endsWith(".sol")) {
                sourceDir = sourceDir.replace(/[a-zA-Z0-9_-]+\.sol$/, "");
            }
            let targetList = _libMap[prefix];
            if (!Array.isArray(targetList))
                targetList = [targetList];
            for (let j = 0; j < targetList.length; j++) {
                let target = path.replace(prefix, sourceDir + targetList[j]);
                if (fs.existsSync(target)) {
                    return {
                        contents: fs.readFileSync(target, "utf8")
                    };
                }
            }
        }
    }
    console.log("import contract not found: " + path);
}
function prettyPrint(s) {
    let j = 0;
    return s.split('').map(e => {
        if (e == '{')
            j++;
        else if (e == '}')
            j--;
        if (j == 1) {
            if (e == '{')
                return '{\n';
            else if (e == '[')
                return '[\n';
            else if (e == ',')
                return ',\n';
            else if (e == ']')
                return '\n]';
            else
                return e;
        }
        else if (j == 0) {
            if (e == '}')
                return '\n}';
            else
                return e;
        }
        else {
            return e;
        }
    }).join('');
}
function processOutput(sourceDir, output, outputDir, outputOptions, exclude, include) {
    var _a, _b, _c, _d;
    let index = '';
    if (output.contracts) {
        for (let i in output.contracts) {
            if (include && !include.includes(sourceDir + i.replace(/^contracts\//, '')))
                continue;
            if (exclude && exclude.includes(sourceDir + i.replace(/^contracts\//, '')))
                continue;
            let p = path.dirname(i.replace(/^contracts\//, ''));
            p = p == '.' ? '' : (p + '/');
            outputOptions = outputOptions || {};
            for (let j in output.contracts[i]) {
                let abi = output.contracts[i][j].abi;
                let bytecode = (_b = (_a = output.contracts[i][j].evm) === null || _a === void 0 ? void 0 : _a.bytecode) === null || _b === void 0 ? void 0 : _b.object;
                let outputBytecode = (outputOptions.bytecode === undefined) ? (!!(bytecode && abi && abi.length)) : (outputOptions.bytecode && bytecode);
                let outputAbi = (outputOptions.abi === undefined) ? (!!(bytecode && abi && abi.length)) : (outputOptions.abi && abi && abi.length);
                let linkReferences = (_d = (_c = output.contracts[i][j].evm) === null || _c === void 0 ? void 0 : _c.bytecode) === null || _d === void 0 ? void 0 : _d.linkReferences;
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
                    fs.writeFileSync(outputDir + '/' + p + j + '.json.ts', "export default " + prettyPrint(JSON.stringify(file)));
                    let relPath = './';
                    let hasBatchCall = outputOptions.batchCall;
                    let hasTxData = outputOptions.txData;
                    let options = {
                        outputAbi,
                        outputBytecode,
                        hasBatchCall,
                        hasTxData
                    };
                    let code = codeGen_1.default(j, relPath, abi, hasLinkReferences ? linkReferences : null, options);
                    fs.writeFileSync(outputDir + '/' + p + j + '.ts', code);
                    index += `export { ${j} } from \'./${p + j}\';\n`;
                }
            }
        }
    }
    return index;
}
;
async function main(configFilePath) {
    let config = fs.existsSync(configFilePath) ? (fs.statSync(configFilePath).isFile() ? JSON.parse(fs.readFileSync(configFilePath, "utf-8")) : { sourceDir: configFilePath }) : {};
    let rootPath = process.cwd();
    let configPath = path.dirname(path.resolve(path.join(rootPath, configFilePath)));
    let { version, optimizerRuns, viaIR, sourceDir, outputDir, outputOptions, overrides, libMap, flattenFiles } = config;
    if (!sourceDir) {
        sourceDir = "contracts/";
        if (!outputDir)
            outputDir = "src/contracts/";
    }
    else {
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
        let customSources = overrides && overrides.map(e => e.sources.map(f => (e.root || root) + f)).reduce((a, b) => a.concat(b), []);
        let input = buildInput(sourceDir, null, optimizerRuns, viaIR, customSources);
        let output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
        let index = processOutput(sourceDir, output, outputDir, outputOptions, customSources);
        if (output.errors) {
            output.errors /*.filter(e=>e.severity!='warning')*/.forEach(e => console.log(e.formattedMessage));
        }
        if (overrides) {
            for (let s in overrides) {
                if (overrides[s].version && overrides[s].version != version) {
                    solc = await getSolc(overrides[s].version);
                }
                _sourceDir = overrides[s].root || root;
                input = buildInput(_sourceDir, overrides[s].sources, overrides[s].optimizerRuns || optimizerRuns, viaIR);
                output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
                index = index + processOutput(sourceDir, output, outputDir, overrides[s].outputOptions || outputOptions, [], overrides[s].sources.map(f => _sourceDir + f));
                if (output.errors) {
                    output.errors /*.filter(e=>e.severity!='warning')*/.forEach(e => console.log(e.formattedMessage));
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
                await flatten_1.default(sourceFile, destFile);
            }
        }
    }
    catch (e) {
        console.log(e);
    }
}
main(process.argv[2] || "solidity.config.json");
