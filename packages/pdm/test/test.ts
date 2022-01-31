import Context from './model/sample.pdm';
import * as Config from './config.js';
import * as DB from '../../db/src';

async function test(){
    let client = DB.getClient(Config);
    let context = new Context(client);
    context.order.query.where('orderNumber', '=', 10100);
    await context.fetch();
    let order = context.order.first;      
    try{
        let details = order.orderDetails;
        await details.fetch();
        console.dir(details.count);
    }
    catch(err){
        console.dir(err)
    }
};
test();