import fs, { RmDirOptions, RmOptions } from 'fs'
import path from 'path'

export namespace testUtils {
    export function createFile(fileName: string, parentDir: string, filecontent: string) {

        fs.writeFileSync(path.join(parentDir, fileName), filecontent)
    }
}
