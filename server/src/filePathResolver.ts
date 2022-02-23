import config from 'config'
import { env } from 'process';
import path from 'path'


export const HOME = ""
export const PATH_UP = ".."
const SEPARATOR = /[\/\\]/

interface FilePathConfig {
    label: string
    env?: string
    path?: string
}

interface FilePath {
    name: string
    path: string
}

function isRoot(key: string): boolean {
    return key === "" || key === "/"
}

export class ResolverPath {
    //private key: string
    private prefix: string
    private dirFiles: string[]
    private pathServer: string | null = null
    private pathNetwork: string | null = null

    constructor(prefix: string, dirFiles: string[]) {
        if (dirFiles.length === 0) {
            this.prefix = HOME
            this.dirFiles = []
        } else {
            this.prefix = prefix
            this.dirFiles = dirFiles
        }
    }

    get key() {
        return this.dirFiles.length === 0 ? "" : this.dirFiles[0]
    }

    getPathServer(): string {
        if (!this.pathServer) {
            this.pathServer = path.join(this.prefix, ...this.dirFiles.slice(1))
        }
        return this.pathServer
    }

    getPathNetwork(): string {
        if (!this.pathNetwork) {
            this.pathNetwork = this.dirFiles.join("/")
        }
        return this.pathNetwork
    }

    add(...extention: string[]): ResolverPath | null {
/*
        if (isRoot(this.key)) {
            if (extention.length == 0) {
                return HOME_ResolverPath
            }

            let key = extention[0]
            extention = extention.slice(1)

            let newPath = Resolver.instance.createResolverPath(key, ...extention)
            return newPath ? newPath : HOME_ResolverPath
        }
*/
        

        if (this.isHomeRoot()) {
            return Resolver.instance.resolve(extention.join("/"))
        }

        let array = [...this.dirFiles, ...extention]
        return new ResolverPath(this.prefix, array)
    }

    isHomeRoot() {
        return this.prefix === HOME
    }
}

export const HOME_ResolverPath = new ResolverPath("", [])

export class Resolver {

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

    resolve(pathToResolve: string | null | undefined, ...dirs: string[]): ResolverPath | null {
        if (pathToResolve === null || pathToResolve === undefined) {
            pathToResolve = HOME
        }

        let array: string[] = pathToResolve.split(SEPARATOR)
        dirs.forEach(s => {
            let splited: string[] = s.split(SEPARATOR)
            array.push(...splited)
        })

        let array2 = []
        for (let i = 0; i < array.length; ++i) {
            let s = array[i]
            if (s === "") {

            } else if (s === PATH_UP) {
                array2.pop()
            } else {
                array2.push(s)
            }
        }

        if (array2.length === 0) {
            return HOME_ResolverPath
        }

        let key = array2[0]

        let newPathprefix = this.getKeyPath(key)
        if (!newPathprefix) {
            return null
        }

        let resolverPath = new ResolverPath(newPathprefix, array2)

        return resolverPath
    }

    private getKeyPath(key: string): string | null {
        let newPathprefix = this.getPath(key)
        if (!newPathprefix) {
            if (isRoot(key)) {
                return ""
            }
            console.warn(`Invalid key "${key}"`);
            return null
        }
        return newPathprefix
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
