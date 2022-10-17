import {Types} from '@ijstech/plugin';

export async function getSysDate(client: Types.IDBClient): Promise<Date>{
    let result = await client.query('SELECT sysdate() AS sysdate')
    return new Date(result[0].sysdate);
}