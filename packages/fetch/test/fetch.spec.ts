import assert from 'assert';
import {Fetch} from '../src';

describe('Fetch', function () {
  it('GET', async function(){
    let result = await Fetch.get('https://postman-echo.com/get?param1=param1value');
    assert.strictEqual(result.status, 200);
    let data = JSON.parse(result.body).args;
    assert.strictEqual(data.param1, 'param1value');
  });
  it('POST', async function(){
    let result = await Fetch.post('https://postman-echo.com/post', {
      body: {
        param1: 'param1 value'
      }
    });
    let data = JSON.parse(result.body).data;
    assert.strictEqual(result.status, 200);
    assert.strictEqual(data.param1, 'param1 value');
  })
})