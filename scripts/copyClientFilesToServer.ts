import fsExtra from 'fs-extra'
import chalk from 'chalk'
const source = "./client/dist/timberlea-client"
const dest = "./server/client"

console.log(chalk.green("Copy client's built files to server."))
console.log(chalk.green(`Copy START`))

console.log(chalk.yellowBright("Create directory if not exist"))
// return value is a Promise resolving to the first directory created

try {
  fsExtra.ensureDirSync(dest)
  console.log(chalk.green(`\tdirectory ${dest} ensured.`))
} catch (err) {
  console.error(err)
}


console.log(chalk.blue("Clean directory"))
fsExtra.emptyDirSync(dest)

console.log(chalk.blue(`Copy files from ${source} to ${dest}`))
fsExtra.copy(source, dest, {
  overwrite: true
}).then(() => {
  console.log(chalk.green('\tCopy success!'))
}).catch(err => {
  return console.error(err)
}).then(() => {
  console.log(chalk.blue(`Copy END`))
})
