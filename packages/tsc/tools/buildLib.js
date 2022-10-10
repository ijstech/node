const { promises: Fs} = require("fs")
const Path = require('path');

async function mkdir(path){
    try{
        await Fs.mkdir(path, { recursive: true });
    }
    catch(err){}
}
async function copyDir(src, dest) {
    await mkdir(dest);
    let entries = await Fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = Path.join(src, entry.name);
        let destPath = Path.join(dest, entry.name);

        entry.isDirectory() ?
            await copyDir(srcPath, destPath) :
            await Fs.copyFile(srcPath, destPath);
    }
}
async function copyFile(src, dest) {    
    let dir = Path.dirname(dest);
    await mkdir(dir);
    await Fs.copyFile(src, dest);
};
async function readFile(fileName) {
    let result = await Fs.readFile(fileName, 'utf8');
    return result;
}
async function writeFile(fileName, content) {
    try{
        let dir = Path.dirname(fileName);
        await mkdir(dir);
        await Fs.writeFile(fileName, content, 'utf8');
    }
    catch(err){}
}

const libs = [
    'es5',
    'es2015.core',
    'es2015.collection',
    "es2015.iterable",
    "es2015.generator", 
    "es2015.promise",
    "es2015.proxy",
    "es2015.reflect",
    "es2015.symbol",
    "es2015.symbol.wellknown",
    "es2016.array.include",
    "es2017.object",
    "es2017.sharedmemory",
    "es2017.string",
    "es2017.intl",
    "es2017.typedarrays"
]
async function bundle(){
    let content = '';
    for (let i = 0; i < libs.length; i ++){
        content += await readFile(Path.resolve(__dirname, `../../../node_modules/typescript/lib/lib.${libs[i]}.d.ts`));
    }
    await writeFile(Path.resolve(__dirname, '../src/lib/lib.d.ts'), `
interface Console {    
    dir(value?: any, ...optionalParams: any[]): void;    
    log(message?: any, ...optionalParams: any[]): void;
}
declare var Console: {
    prototype: Console;
    new(): Console;
};
declare var console: Console;
${content}
`);    
};
bundle();