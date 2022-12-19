const fs = require("fs");
const path = require("path");

interface ICompiledContract {
    filePath: string;
    source: string;
    dependencies: Record<string, ICompiledContract>;
}

const importRegex = /^\s*import\s+(?:"([^"]+)"|'([^']+)')./gm;
const compiledContracts: Record<string, ICompiledContract> = {};

async function compileSolidityFile(filePath: string) {
    if (compiledContracts[filePath]) {
        return compiledContracts[filePath];
    }

    const sourceCode = fs.readFileSync(filePath, "utf8");

    let importMatch;
    const imports = [];
    while ((importMatch = importRegex.exec(sourceCode))) {
        const importPath = importMatch[1] || importMatch[2];
        imports.push(importPath);
    }

    const dependencies = {};
    await Promise.all(
        imports.map(async (importPath) => {
            let importFilePath;
            if (importPath.startsWith('.')) {
                importFilePath = path.resolve(path.dirname(filePath), importPath);
            }
            else {
                importFilePath = path.resolve('./node_modules/' + importPath);
            }
            dependencies[importPath] = await compileSolidityFile(importFilePath);
        })
    );

    compiledContracts[filePath] = {
        filePath: filePath,
        source: sourceCode,
        dependencies: dependencies,
    };

    return compiledContracts[filePath];
}

export default async function flattenSolidityFile(sourcefilePath: string, targetFilePath: string) {
    let processedFilePath = [];
    const contracts = await compileSolidityFile(sourcefilePath);
    const flattenDependencies = (contract) => {
        let sourceCode = "";
        for (const [importPath, dependency] of Object.entries(
            contract.dependencies
        )) {
            sourceCode += flattenDependencies(dependency);
        }
        if (!processedFilePath.includes(contract.filePath)) {
            sourceCode += contract.source;
            processedFilePath.push(contract.filePath);
        }
        return sourceCode;
    };

    let sourceCode = flattenDependencies(contracts);
    sourceCode = sourceCode.replace(importRegex, '');
    let count = 0;
    const licenseRegex = /\/\/\s+SPDX-License-Identifier:.*/gm;
    sourceCode = sourceCode.replace(licenseRegex, (match) => {
        count++;
        return count === 1 ? match : '';
    });

    fs.writeFileSync(targetFilePath, sourceCode);
    return sourceCode;
}
