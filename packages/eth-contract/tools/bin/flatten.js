"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = flattenSolidityFile;
const fs = require("fs");
const path = require("path");
const importRegex = /^\s*import\s+(?:"([^"]+)"|'([^']+)')./gm;
const licenseRegex = /\/\/\s+SPDX-License-Identifier:.*/gm;
const compiledContracts = {};
async function compileSolidityFile(filePath, isBaseFile = false) {
    if (compiledContracts[filePath]) {
        return compiledContracts[filePath];
    }
    let sourceCode = fs.readFileSync(filePath, "utf8");
    let license;
    if (isBaseFile) {
        licenseRegex.lastIndex = 0;
        const licenseMatch = licenseRegex.exec(sourceCode);
        license = licenseMatch[0];
    }
    sourceCode = sourceCode.replace(licenseRegex, '');
    let importMatch;
    const dependencies = {};
    importRegex.lastIndex = 0;
    while ((importMatch = importRegex.exec(sourceCode))) {
        const importPath = importMatch[1] || importMatch[2];
        let importFilePath;
        if (importPath.startsWith('.')) {
            importFilePath = path.resolve(path.dirname(filePath), importPath);
        }
        else {
            importFilePath = path.resolve('./node_modules/' + importPath);
        }
        if (!compiledContracts[importFilePath]) {
            compiledContracts[importFilePath] = await compileSolidityFile(importFilePath);
        }
        dependencies[importPath] = compiledContracts[importFilePath];
    }
    compiledContracts[filePath] = {
        filePath: filePath,
        source: sourceCode,
        dependencies: dependencies,
        license: license
    };
    return compiledContracts[filePath];
}
async function flattenSolidityFile(sourcefilePath, targetFilePath) {
    let processedFilePath = [];
    const contracts = await compileSolidityFile(sourcefilePath, true);
    const license = contracts.license;
    const flattenDependencies = (contract) => {
        let sourceCode = "";
        for (const [importPath, dependency] of Object.entries(contract.dependencies)) {
            sourceCode += flattenDependencies(dependency);
        }
        if (!processedFilePath.includes(contract.filePath)) {
            sourceCode += contract.source;
            processedFilePath.push(contract.filePath);
        }
        return sourceCode;
    };
    let sourceCode = license + '\n' + flattenDependencies(contracts);
    sourceCode = sourceCode.replace(importRegex, '');
    fs.writeFileSync(targetFilePath, sourceCode);
    return sourceCode;
}
