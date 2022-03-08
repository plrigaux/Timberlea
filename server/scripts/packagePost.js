const fsExtra = require('fs-extra')

const test = "./dist/tests"

console.log(`Remove directory ${test}`)
fsExtra.promises.rm(test, { recursive: true })
.then( () => {
    console.log(`directory ${test} is deleted!`);
})
.catch( (err) => {
    if (err.code === 'ENOENT') {
        console.log(`Directory ${test} doesn't exist`)
        return
    }
    console.error(err);
});

