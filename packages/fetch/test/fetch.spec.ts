import assert from 'assert';
import Path from 'path';

describe('fetch', function () {
  it('GET', async function(){
    let result = await fetch('https://www.google.com');
    console.dir(await result.text())
  })
})