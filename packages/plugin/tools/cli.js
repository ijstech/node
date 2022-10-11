#!/usr/bin/env node
const Fs = require('fs');
const Path = require('path');
const RootDir = process.cwd();

async function copy(source, target ) {    
    if (Fs.lstatSync(source).isDirectory() ) {
        let files = Fs.readdirSync(source);
        files.forEach(function (file) {
            copy(Path.join(source, file), Path.join(target, file))
        } );
    }
    else if (!Fs.existsSync(target)){
        try{
            Fs.mkdirSync(Path.dirname(target), { recursive: true });
        }
        catch(err){}
        Fs.writeFileSync(target, Fs.readFileSync(source));
    }
}
async function init(){    
    let args = process.argv.slice(2);
    if (args[0] == 'init'){
        if (args[1] == 'worker'){
            copy(Path.join(__dirname, 'templates/worker'), RootDir)
        }
        else if (args[1] == 'router'){
            copy(Path.join(__dirname, 'templates/router'), RootDir)
        }
        let packPath = Path.join(RootDir, 'package.json');
        if (args[2] && Fs.existsSync(packPath)){
            let pack = JSON.parse(Fs.readFileSync(packPath));
            pack.name = args[2];
            Fs.writeFileSync(packPath, JSON.stringify(pack, null, 4));
        };
    };
};
init();