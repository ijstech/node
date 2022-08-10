const {promises: Fs} = require('fs');
const Path = require('path');

async function copyFile(src, dest) {    
    let dir = Path.dirname(dest);
    await Fs.mkdir(dir, { recursive: true });
    await Fs.copyFile(src, dest);    
};
copyFile('src/ipfs.js', 'lib/ipfs.js');
copyFile('src/ipfs.js', 'dist/index.js');