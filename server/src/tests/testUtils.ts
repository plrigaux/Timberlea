import { createDecipheriv } from 'crypto';
import fs, { RmDirOptions, RmOptions } from 'fs'
import path from 'path'

export namespace testUtils {

    export const TEMP = "TEMP"
    export const HOME = "HOME"
    export const HOME_ROOT = ""

    export function createFile(fileName: string, parentDir: string, filecontent: string) : string {
        let p = path.join(parentDir, fileName)
        fs.writeFileSync(p, filecontent)
        return p
    }

    export function createDir(parent: string, dirName: string | null = null) {
        let dir: string

        if (dirName) {
            dir = path.join(parent, dirName)
        } else {
            dir = parent
        }

        removeDir(dir)

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    export function removeDir(dir: string) {
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
