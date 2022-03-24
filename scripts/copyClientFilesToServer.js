const fsExtra = require('fs-extra')
const source = "./client/dist/timberlea-client"
const dest = "./server/client"

console.log("Copy client's built files to server.")
console.log(`Copy START`)

console.log("Create directory if not exist")
// return value is a Promise resolving to the first directory created

try {
  fsExtra.ensureDirSync(dest)
  console.log(`\tdirectory ${dest} ensured.`)
} catch (err) {
  console.error(err)
}


console.log("Clean directory")
fsExtra.emptyDirSync(dest)

console.log(`Copy files from ${source} to ${dest}`)
fsExtra.copy(source, dest, {
  overwrite: true
}).then(() => {
  console.log('\tCopy success!')
}).catch(err => {
  return console.error(err)
}).then(() => {
  console.log(`Copy END`)
})
