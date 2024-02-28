const fs = require('fs');

function createFile(size) {
    return new Promise((work,fail)=>{
      fs.writeFile(size+'.bin', Buffer.alloc(size), err=>err?fail(err):work())      
    })
}
async function main(){
    await createFile(1048575)
    await createFile(1048576) //1MB
    await createFile(1048577)
}
main()