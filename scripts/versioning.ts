import path from 'path'
import fsExtra from 'fs-extra'
import readline from 'node:readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const LOCAL = ""
const CLIENT = "client"
const SERVER = "server"

const PACKAGE = "package.json"


const packages = new Map();

packages.set(LOCAL, { file: path.join(LOCAL, PACKAGE) })
packages.set(CLIENT, { file: path.join(CLIENT, PACKAGE) })
packages.set(SERVER, { file: path.join(SERVER, PACKAGE) })

console.log(packages)

function getVersion(): string {
  let version = fsExtra.readFileSync("VERSION", 'utf8');
  console.log("version", version)
  return version
}

let version = getVersion()

function updateVersions() {
  for (let packageFile of packages.entries()) {

    try {
      let packFile = packageFile[1];

      let data = fsExtra.readFileSync(packFile.file, 'utf8');

      const packageFileData = JSON.parse(data);
      let key = packageFile[0]
      console.log("version", key, packageFileData.version, " --> ", version);
      packFile.version = packageFileData.version

      packageFileData.version = version

      let dataString = JSON.stringify(packageFileData, null, 2)

      fsExtra.writeFileSync(packFile.file, dataString);
    }
    catch (err) {
      console.log(`Error reading file from disk: ${err}`);
    }
  }
}


console.log(packages)

rl.question(`The version is ${version}. Update package version to this version? [y] `, (answer: string) => {

  let yes = /y|(yes)/gi
  if(answer.match(yes)) {
    updateVersions()
    console.log(`Package version updated to ${version}!`)
  }

  console.log(`Bye`)
  rl.close()
})

