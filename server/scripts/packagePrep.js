const fsExtra = require('fs-extra')

const dist = "./dist"

console.log(`Clean directory ${dist}`)
fsExtra.emptyDirSync(dist)