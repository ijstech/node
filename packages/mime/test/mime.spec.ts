import assert from 'assert';
import mime from '../src';

describe('Mime', function () {
  it('getType', async function(){
    let result = mime.getType('file.txt');
    assert.strictEqual(result, "text/plain")
    result = mime.getType('txt');
    assert.strictEqual(result, "text/plain")
    result = mime.getType('json');
    assert.strictEqual(result, "application/json")
  })
  it('getExtension', async function(){
    let result = mime.getExtension("text/plain");
    assert.strictEqual(result, "txt")
  })
})