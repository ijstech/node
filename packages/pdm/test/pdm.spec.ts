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
        let tableExists = await client.checkTableExists('customers');
        if (!tableExists){
            let result = await client.import(sql);
            if (!result)
                throw new Error('Import DB data failed!');
        }
    })
    it('Query Customer where customerNumber in [112, 114]', async function(){
        let context = new Context(client);
        context.customer.query.where('customerNumber', 'in', [112,114]);
        let records = await context.customer.fetch();
        assert.strictEqual(context.customer.count, 2);
        assert.strictEqual(records[0].customerNumber, 112);
        let values = context.customer.values('customerNumber');
        assert.deepStrictEqual(values, [112,114]);
    });
    it('Query Customer where customerNumber = 112 or 114', async function(){
        let context = new Context(client);
        context.customer.query.where('customerNumber', '=', 112).or('customerNumber','=',114);
        await context.fetch();
        assert.strictEqual(context.customer.count, 2);
        let values = context.customer.values('customerNumber');
        assert.deepStrictEqual(values, [112,114]);
    });
    it('Query Customer with subQuery customerNumber = 112 or 114', async function(){
        let context = new Context(client);
        context.customer.query.where((qr)=>{
            qr.where('customerNumber','=',112)
        }).or('customerNumber','=',114);
        await context.customer.fetch();
        assert.strictEqual(context.customer.count, 2);
        let values = context.customer.values('customerNumber');
        assert.deepStrictEqual(values, [112,114]);
    });
    it('Add customer', async function(){
        //add record
        let context = new Context(client);
        let rd = context.customer.add();
        let name = '$new' + new Date().getTime().toString();
        rd.customerName = name;
        await context.save();
        //query added record
        context = new Context(client);
        assert.strictEqual(context.customer.first, undefined);
        context.customer.query.where('customerName', '=', name);
        await context.fetch();
        assert.strictEqual(context.customer.first.customerName, name);
        //modified record
        let name2 = '$new' + new Date().getTime().toString();
        context.customer.first.customerName = name2;
        await context.save();
        //query modified record
        context = new Context(client);
        context.customer.query.where('customerName', '=', name2);
        await context.fetch();
        assert.strictEqual(context.customer.first.customerName, name2);

        context = new Context(client);
        context.customer.query.where('customerName', '=', name2);
        let rs = await context.customer.fetch();        
        assert.strictEqual(rs[0].customerName, name2);
        //delete record
        context.customer.delete(context.customer.first);
        assert.strictEqual(context.customer.first, undefined);
        assert.strictEqual(context.customer.count, 0);
        await context.save();
        //query deleted record
        context.reset();
        context.customer.query.where('customerName', '=', name2);
        await context.fetch();
        assert.strictEqual(context.customer.count, 0);
    });
    it('Apply Queries', async function(){
        let context = new Context(client);
        let custName = '$new_' + new Date().getTime().toString();
        //insert
        context.customer.applyInsert({
            'customerName': custName,
            'customerNumber': 8888,
            'country': 'China'
        });
        await context.save();        
        context.customer.query.where('customerName', '=', custName);
        await context.fetch();
        let cust = context.customer.first;
        assert.strictEqual(cust.customerName, custName);        
        //update
        let newCustName = '$m' + custName;
        context.customer.applyUpdate({
            'customerName': newCustName,
            'city': 'HK'
        }).where('customerName', '=', custName);
        await context.save();
        context.customer.query.where('customerName', '=', newCustName);
        await context.fetch();
        assert.strictEqual(context.customer.first.customerName, newCustName);
        assert.strictEqual(context.customer.first.customerName, cust.customerName);
        //delete
        context.customer.applyDelete().where('customerName','=',newCustName);
        await context.save();
        context.reset();
        context.customer.query.where('customerName', '=', newCustName);
        await context.fetch();
        assert.strictEqual(context.customer.count, 0);
    });
    it('Customer Sales Rep', async function(){
        let context = new Context(client);
        context.customer.query.where('customerNumber','=',112);
        await context.fetch();
        let cust = context.customer.first;
        let salesRep = await cust.salesRep;
        assert.strictEqual(salesRep.employeeNumber, 1166);
    });
    it('Order Details', async function(){
        let client = DB.getClient(Config);
        let context = new Context(client);
        context.order.query.where('orderNumber', '=', 10100);
        await context.fetch();
        let order = context.order.first;
        await order.orderDetails.fetch();
        assert.strictEqual(order.guid, (await order.orderDetails.first.order).guid);
        assert.strictEqual(order.orderDetails.count, 4);
        let detail = order.orderDetails.first;
        let qty = detail.quantityOrdered;
        detail.quantityOrdered = 999;
        await context.save();
    });
});
