import * as DB from "@ijstech/db";
import * as Config from "./config";
import Types from '@ijstech/types';
import assert from "assert";
import Context from "./model/sample.pdm";

describe('Table Schema', function() {
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
           for (const prop in fields) {
               const field = fields[prop];
               const fieldName = field.field;
               const currentField = schema.find(v => v['Field'] === (fieldName));

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
    it('Insert record into demo', async function () {
        let context = new Context(client);
        await client.query(`INSERT INTO demo VALUES (UUID(), '123', 12.5, 12, true, CURDATE(), null, 'text', '123', '12')`);
        await client.query(`INSERT INTO demo VALUES (UUID(), '123', 12.5, 12, true, CURDATE(), null, 'text', '123', '12')`);
        context.demo.query.where('guid', '!=', 'NULL');
        const data = await context.demo.fetch();
        assert.strictEqual(data.length, 2);
    });
    it('Drop the column String', async function () {
        const schemaBeforeDropColumn = await client.query('DESCRIBE demo');
        assert.strictEqual(!!schemaBeforeDropColumn.find(v => v['Field'] === 'string'), true);
        await client.query('ALTER TABLE demo DROP COLUMN string');
        const schemaAfterDropColumn = await client.query('DESCRIBE demo');
        assert.strictEqual(!!schemaAfterDropColumn.find(v => v['Field'] === 'string'), false);
    })
    it('Run queries and synchronize the column', async () => {
        let context = new Context(client);
        context.demo.query.where('guid', '!=', 'NULL');
        await context.demo.fetch();
        const tableSchema = await client.query(`DESCRIBE demo`);
        assert.strictEqual(!!tableSchema.find(v => v['Field'] === 'string'), true);
    });
    it('Drop the primary key', async function () {
        const schemaBeforeDropColumn = await client.query('DESCRIBE demo');
        assert.strictEqual(!!schemaBeforeDropColumn.find(v => v['Field'] === 'uuid'), true);
        assert.strictEqual(schemaBeforeDropColumn.find(v => v['Field'] === 'uuid')['Key'], 'PRI');
        await client.query('ALTER TABLE demo DROP COLUMN uuid');
        const schemaAfterDropColumn = await client.query('DESCRIBE demo');
        assert.strictEqual(!!schemaAfterDropColumn.find(v => v['Field'] === 'uuid'), false);
    });
    it('Run queries and synchronize the column', async () => {
        try {
            let context = new Context(client);
            context.demo.query.where('guid', '!=', 'NULL');
            await context.demo.fetch();
            const tableSchema = await client.query(`DESCRIBE demo`);
            assert.strictEqual(!!tableSchema.find(v => v['Field'] === 'uuid'), true);
            assert.strictEqual(tableSchema.find(v => v['Field'] === 'uuid')['Key'], '');
        }
        catch(e) {
            console.log('error');
            assert.fail(e);
        }
    });
});