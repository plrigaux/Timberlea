import config from 'config'
import { env } from 'process';
import path from 'path'

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

    private static _instance: Resolver;

    public static get instance(): Resolver {
        return this._instance || (this._instance = new this());
    }

    private filePaths = new Map<string, FilePath>()
    private rootKeys : string[] 

    private constructor() {
        const configFilePaths = config.get<FilePathConfig[]>('filePaths');
        console.log(configFilePaths)


        configFilePaths.forEach(fpc => {
            let path

            if (fpc.env || fpc.path) {
                if (fpc.env) {
                    path = env[fpc.env]
                } else {
                    path = fpc.path
                }
            } else {
                console.error("Bad Config - No path or env")
                return
            }

            if (!path) {
                console.error("Bad Config - Path resolve error")
                return
            }

            let fp: FilePath = {
                name: fpc.label,
                path: path
            }

            this.filePaths.set(fp.name, fp)
        })

        console.log(this.filePaths)

        this.rootKeys =  [...this.filePaths.keys()]
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
            return null
        }

        let key = pathSplited[0]

        let newPathprfix = this.getPath(key)
        if (!newPathprfix) {
            console.error(`Invalid key "${key}"`);
            return null
        }

        return path.join(newPathprfix, ...pathSplited.slice(1))
    }

    root(): string[] {
        return this.rootKeys
    }
}


export default Resolver;