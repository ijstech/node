import 'mocha';
import * as assert from 'assert';
import Context from './model/sample.pdm';
import * as Config from './config.js';
import * as DB from '../../db/src';
import Fs from 'fs';

require.extensions['.sql'] = function (module, filename) {
    module.exports = Fs.readFileSync(filename, 'utf8');
};
const sql = require('./model/sample.sql');

describe('PDM', function() {
    this.timeout(20000);
    let client: DB.IClient;
    before(async function(){
        client = DB.getClient(Config);
    })
    it('Test', async function(){
        let context = new Context(client);
        context.demo.query.where('guid', '!=', 'NULL');
        context.demoItem.query.where('guid', '!=', 'NULL');
        let demo = await context.demo.fetch();
        let demoItem = await context.demoItem.fetch();

    });
});
