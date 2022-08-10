const { promises: Fs } = require("fs")
const Path = require("path")

async function copyDir(src, dest) {
    await Fs.mkdir(dest, { recursive: true });
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
    await Fs.mkdir(dir, { recursive: true });
    await Fs.copyFile(src, dest);    
};
async function run(){
    await copyDir('src/bee-queue', 'lib/bee-queue');
    await copyFile('src/bee-queue/index.d.ts', 'types/bee-queue/index.d.ts');
}
run()