import 'mocha';
import * as assert from 'assert';
import Context from './model/sample.pdm';
import * as Config from './config.js';
import * as DB from '../../db/src';
import Fs from 'fs';
import * as Types from '@ijstech/types';

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
    it('Drop the table "demo"', async function(){
        await client.query(`DROP TABLE IF EXISTS demo`);
        const table = await client.query(`SHOW TABLES like 'demo'`);
        assert.strictEqual(table.length, 0);
    });
    it('Run queries and synchronize the table', async () => {
        let context = new Context(client);
        context.demo.query.where('guid', '!=', 'NULL');
        await context.demo.fetch();
        const table = await client.query(`SHOW TABLES like 'demo'`);
        assert.strictEqual(table.length, 1);
    })
    it('Check table schema against fields', async () => {
       let context = new Context(client);
       const fields = context.demo.fields;
       const schema = await client.query(`DESCRIBE demo`);
       const typeException = ['1toM'];
       if(schema.length > 0) {
           for (const fieldName in fields) {
               const field = fields[fieldName];
               const currentField = schema.find(v => v['Field'] === (field.field || fieldName));

               if(!currentField && field.dataType !== '1toM') {
                   assert.fail('Column not found');
               }
               else if (typeException.indexOf(field.dataType) >= 0) continue;

               let compareType;
               let compareField = field.field;
               switch(field.dataType) {
                   case 'key':
                       compareType = 'CHAR(36)';
                       compareField = fieldName;
                       break;
                   case '1toM':
                       break;
                   case 'ref':
                       compareType = 'CHAR(36)';
                       break;
                   case 'char':
                       compareType = `CHAR(${field.size})`;
                       break;
                   case 'varchar':
                       compareType = `VARCHAR(${field.size})`;
                       break;
                   case 'boolean':
                       compareType = `TINYINT(1)`;
                       break;
                   case 'integer':
                       compareType = `INT(${(<Types.IIntegerField> field).digits})`;
                       break;
                   case 'decimal':
                       compareType = `DECIMAL(${(<Types.IIntegerField> field).digits},${(<Types.IIntegerField> field).decimals})`;
                       break;
                   case 'date':
                       compareType = `DATE`;
                       break;
                   case 'blob':
                       compareType = `MEDIUMBLOB`;
                       break;
                   case 'text':
                       compareType = `TEXT`;
                       break;
                   case 'mediumText':
                       compareType = `MEDIUMTEXT`;
                       break;
                   case 'longText':
                       compareType = `LONGTEXT`;
                       break;
               }
               assert.strictEqual(compareField, currentField['Field']);
               assert.strictEqual(compareType, currentField['Type'].toUpperCase());
           }
       }
       else {
           assert.fail('No table columns found.');
       }
    });
});
