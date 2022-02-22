import * as DB from "@ijstech/db";
import * as Config from "./config";
import assert from "assert";
import Context from "./model/sample.pdm";
import * as Types from "@ijstech/types";
import {graphql, buildSchema, graphqlSync} from 'graphql';

describe('GraphQL test', function() {
    this.timeout(20000);
    let client: DB.IClient;
    const demoData = [
        ['e41bf3e9-93bf-11ec-9918-0242ac120002', 'Hello World 1', 1.5, 1, true, new Date(2022, 1, 22), null, 'Hello World', 'New Field 1', '12'],
        ['e471a4dc-93bf-11ec-9918-0242ac120002', 'Hello World 2', 1.5, 2, false, new Date(2022, 1, 23), null, 'Hello Test', 'New Field 2', '13'],
        ['e4998f7c-93bf-11ec-9918-0242ac120002', 'Hello World 3', 2, 2, false, new Date(2022, 1, 24), null, 'Test 1', 'New Field 3', '14'],
        ['e4bd44c3-93bf-11ec-9918-0242ac120002', 'Hello World 4', 2, 3, true, new Date(2022, 1, 25), null, '123', 'New Field 4', '15'],
        ['e4dbb75a-93bf-11ec-9918-0242ac120002', 'Hello World 5', 2.5, 3, true, new Date(2022, 1, 26), null, 'Hello 123', 'New Field 5', '16'],
    ];
    before(async function(){
        client = DB.getClient(Config);
    })
    it('Truncate demo table', async function() {
        await client.query(`TRUNCATE demo`);
        const data = await client.query(`SELECT * FROM demo`);
        assert.strictEqual(data.length, 0);
    })
    it(`Insert record into demo`, async function() {
        await client.query(`INSERT INTO demo VALUES ?`, [demoData]);
        const data = await client.query(`SELECT * FROM demo`);
        assert.strictEqual(data.length, 5);
    })
    it('GraphQL query by columns', async function(){
        let context = new Context(client);
        const data = await context.graphql.query(`
        { 
            demo {
                guid
                string
                decimal
                integer
                boolean
                date
                blob
                text
                newField
                size
            }
        }`);
        assert.strictEqual(data.demo.length, 5);
        for(let i in data.demo) {
            const d = data.demo[i];
            assert.strictEqual(d['guid'], demoData[i][0]);
            assert.strictEqual(d['string'], demoData[i][1]);
            assert.strictEqual(d['decimal'], demoData[i][2]);
            assert.strictEqual(d['integer'], demoData[i][3]);
            assert.strictEqual(d['boolean'], demoData[i][4]);
            assert.strictEqual(d['date'], (+demoData[i][5]).toString());
            assert.strictEqual(d['blob'], demoData[i][6]);
            assert.strictEqual(d['text'], demoData[i][7]);
            assert.strictEqual(d['newField'], demoData[i][8]);
            assert.strictEqual(d['size'], demoData[i][9]);

        }
    });
    it('GraphQL query search by key field', async function() {
        let context = new Context(client);
        const data = await context.graphql.query(`
        {
            demo(guid: "e41bf3e9-93bf-11ec-9918-0242ac120002") {
                guid
                string
                decimal
                integer
                boolean
                date
                blob
                text
                newField
                size
            }
        }
        `);
        assert.strictEqual(data.demo.length, 1)
        const d = data.demo[0];
        assert.strictEqual(d['guid'], demoData[0][0]);
        assert.strictEqual(d['string'], demoData[0][1]);
        assert.strictEqual(d['decimal'], demoData[0][2]);
        assert.strictEqual(d['integer'], demoData[0][3]);
        assert.strictEqual(d['boolean'], demoData[0][4]);
        assert.strictEqual(d['date'], (+demoData[0][5]).toString());
        assert.strictEqual(d['blob'], demoData[0][6]);
        assert.strictEqual(d['text'], demoData[0][7]);
        assert.strictEqual(d['newField'], demoData[0][8]);
        assert.strictEqual(d['size'], demoData[0][9]);
    });
    it('GraphQL query search by integer field', async function() {
        let context = new Context(client);
        const data = await context.graphql.query(`
        {
            demo(integer: 2) {
                guid
                string
                decimal
                integer
                boolean
                date
                blob
                text
                newField
                size
            }
        }
        `);
        assert.strictEqual(data.demo.length, 2)
        const d = data.demo[0];
        assert.strictEqual(d['integer'], 2);
    });
    it('GraphQL query search by decimal field', async function() {
        let context = new Context(client);
        const data = await context.graphql.query(`
        {
            demo(decimal: 1.5) {
                guid
                string
                decimal
                integer
                boolean
                date
                blob
                text
                newField
                size
            }
        }
        `);
        assert.strictEqual(data.demo.length, 2)
        const d = data.demo[0];
        assert.strictEqual(d['decimal'], 1.5);
    });
    it('GraphQL query search by boolean field', async function() {
        let context = new Context(client);
        const data = await context.graphql.query(`
        {
            demo(boolean: true) {
                guid
                string
                decimal
                integer
                boolean
                date
                blob
                text
                newField
                size
            }
        }
        `);
        assert.strictEqual(data.demo.length, 3)
        const d = data.demo[0];
        assert.strictEqual(d['boolean'], true);
    });
    it('GraphQL query search by date field', async function() {
        let context = new Context(client);
        const data = await context.graphql.query(`
        {
            demo(date: "2022-02-25") {
                guid
                string
                decimal
                integer
                boolean
                date
                blob
                text
                newField
                size
            }
        }
        `);
        assert.strictEqual(data.demo.length, 1)
        const d = data.demo[0];
        assert.strictEqual(d['date'], (+demoData[3][5]).toString());
    });
    it('GraphQL query search by text field', async function() {
        let context = new Context(client);
        const data = await context.graphql.query(`
        {
            demo(text: "Test") {
                guid
                string
                decimal
                integer
                boolean
                date
                blob
                text
                newField
                size
            }
        }
        `);
        assert.strictEqual(data.demo.length, 2)
        const d1 = data.demo[0];
        const d2 = data.demo[1];
        assert.strictEqual(d1['text'], demoData[1][7]);
        assert.strictEqual(d2['text'], demoData[2][7]);
    });
    it('GraphQL query search by multiple fields', async function() {
        let context = new Context(client);
        const data = await context.graphql.query(`
        {
            demo(text: "Test", size: "13") {
                guid
                string
                decimal
                integer
                boolean
                date
                blob
                text
                newField
                size
            }
        }
        `);
        assert.strictEqual(data.demo.length, 1)
        const d = data.demo[0];
        assert.strictEqual(d['text'], "Hello Test");
        assert.strictEqual(d['size'], "13");
    })
});
