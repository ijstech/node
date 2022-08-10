/*!-----------------------------------------------------------
* Original work Copyright (c) 2015 Lewis J Ellis
* Subsequent revisions Copyright (c) 2017 Mixmax, Inc and Lewis J Ellis
* Released under MIT license
* https://github.com/bee-queue/bee-queue/blob/master/LICENSE
*-----------------------------------------------------------*/

//https://github.com/bee-queue/bee-queue/blob/1c2fb849708881408fe22c6527e3f62c33a58755/lib/lua/index.js

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const util = require('util');

const scripts = {};
const shas = {};
let scriptsRead = false;
let scriptsPromise = null;

const readFile = util.promisify(fs.readFile);
const readDir = util.promisify(fs.readdir);

function readScript(file) {
  return readFile(path.join(__dirname, file), 'utf8')
    .then((script) => {
      const name = file.slice(0, -4);
      scripts[name] = script;
      const hash = crypto.createHash('sha1');
      hash.update(script);
      shas[name] = hash.digest('hex');
    });
}

function readScripts() {
  if (scriptsRead) return scriptsPromise;
  scriptsRead = true;
  return scriptsPromise = readDir(__dirname).then((files) => {
    return Promise.all(files.filter((file) => file.endsWith('.lua')).map(readScript));
  }).then(() => scripts);
}

function buildCache(client) {
  // We could theoretically pipeline this, but it's pretty insignificant.
  return readScripts().then(() => Promise.all(Object.keys(shas).map((key) => {
    return new Promise((resolve, reject) => {
      client.script('exists', shas[key], (err, exists) => {
        /* istanbul ignore if */
        if (err) {
          reject(err);
        } else if (exists[0] === 0) {
          client.script('load', scripts[key], (loadErr) => {
            /* istanbul ignore if */
            if (loadErr) {
              return reject(loadErr);
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  })));
}

module.exports = {
  scripts,
  shas,
  buildCache
};