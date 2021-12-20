import { createDecipheriv } from 'crypto';
import fs, { RmDirOptions, RmOptions } from 'fs'
import path from 'path'

export namespace testUtils {
    export function createFile(fileName: string, parentDir: string, filecontent: string) {

        fs.writeFileSync(path.join(parentDir, fileName), filecontent)
    }

    export function createDir(dir :string){
        console.log(dir);
        removeDir(dir)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    export function removeDir(dir :string) {
        try {
            if (!fs.existsSync(dir)) {
                return
            }
            const options: RmOptions = { recursive: true, force: true }
            fs.rmSync(dir, options)
            console.log(`${dir} is deleted!`);
        } catch (err) {
            console.error(`Error while deleting ${dir}.`, err);
        }
    }
}
