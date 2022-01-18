const mkdirp = require('mkdirp')
const fsExtra = require('fs-extra')



const source = "./dist/file-server"
const dest = "./server/client"

console.log("Copy client's built files to server.")
console.log(`Copy START`)

console.log("Create directory if not exist")
// return value is a Promise resolving to the first directory created
const made = mkdirp.sync(dest)
if (made) {
  console.log(`\tdirectory ${made} created.`)
} else {
  console.log(`\tdirectory ${dest} exists.`)
}

console.log("Clean directory")
fsExtra.emptyDirSync(dest)

console.log(`Copy files from ${source} to ${dest}`)
fsExtra.copy(source, dest, {
  overwrite: true
}, err => {
  if (err) return console.error(err)
  console.log('\tsuccess!')
})

console.log(`Copy END`)
