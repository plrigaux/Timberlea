import config from 'config'
import { env } from 'process';
import path from 'path'
import { Result } from 'express-validator';

interface FilePathConfig {
    label: string
    env?: string
    path?: string
}

interface FilePath {
    name: string
    path: string
}

class Resolver {

    static get home(): string { return "" }

    private static _instance: Resolver;

    public static get instance(): Resolver {
        return this._instance || (this._instance = new this());
    }

    private filePaths = new Map<string, FilePath>()
    private rootKeys: string[]

    private constructor() {
        const configFilePaths = config.get<FilePathConfig[]>('filePaths');
        console.log(configFilePaths)


        configFilePaths.forEach(fpc => {
            let keyPath

            if (fpc.env || fpc.path) {
                if (fpc.env) {
                    keyPath = env[fpc.env]
                } else {
                    keyPath = fpc.path
                }
            } else {
                console.error("Bad Config - No path or env")
                return
            }

            if (!keyPath) {
                console.error("Bad Config - Path resolve error")
                return
            }

            keyPath = path.normalize(keyPath)

            let fp: FilePath = {
                name: fpc.label,
                path: keyPath
            }

            this.filePaths.set(fp.name, fp)
        })

        console.log(this.filePaths)

        this.rootKeys = [...this.filePaths.keys()]
    }

    getPath(key: string): string | undefined {
        return this.filePaths.get(key)?.path
    }

    resolve(pathToResolve: string): string | null {
        //normalisation should happen before resolution to avoid security issues
        pathToResolve = path.normalize(pathToResolve);

        let pathSplited = pathToResolve.split(/[\/\\]/)

        if (pathSplited.length == 0) {
            console.error("Invalid");
            return Resolver.home
        }

        let key = pathSplited[0]

        let newPathprfix = this.getPath(key)
        if (!newPathprfix) {
            console.warn(`Invalid key "${key}"`);
            return null
        }

        return path.join(newPathprfix, ...pathSplited.slice(1))
    }

    root(): string[] {
        return this.rootKeys
    }

    replaceWithKey(filePath: string): string | null {
        let result = null
        filePath = path.normalize(filePath)

        for (const [key, value] of this.filePaths.entries()) {

            let fp = value.path

            if (filePath.startsWith(fp)) {
                result = path.join(key, filePath.substring(fp.length))
                break
            }
        }
        return result
    }

}


export default Resolver;