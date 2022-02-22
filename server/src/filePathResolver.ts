import config from 'config'
import { env } from 'process';
import path from 'path'


export const HOME = ""

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
    private key: string
    private prefix: string
    private dirFiles: string[]

    constructor(key: string, prefix: string, ...rest: string[]) {
        if (isRoot(key)) {
            this.key = HOME
            this.prefix = HOME
            this.dirFiles = []
        } else {
            this.key = key
            this.prefix = prefix
            this.dirFiles = rest
        }
    }

    getPathServer(): string {
        return path.join(this.prefix, ...this.dirFiles)
    }

    getPathNetwork(): string {
        let pathNetwork = path.join(this.key, ...this.dirFiles)
        pathNetwork = pathNetwork.replaceAll("\\", "/")
        return pathNetwork == "." ? HOME : pathNetwork
    }

    add(...extention: string[]) {

        if (isRoot(this.key)) {
            if (extention.length == 0) {
                return HOME_ResolverPath
            }

            let key = extention[0]
            extention = extention.slice(1)
           
            return Resolver.instance.createResolverPath(key, ...extention)
        }

        return new ResolverPath(this.key, this.prefix, ...this.dirFiles, ...extention)
    }
}

export const HOME_ResolverPath = new ResolverPath("", "")

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
            console.warn("=== null")

        } else if (pathToResolve === "") {
            //TO handle the case HOME/<dir/file>
            console.warn("=== EMPTY")
            if (dirs.length != 0) {
                pathToResolve = dirs[0]
                dirs = []
            } else {
                return HOME_ResolverPath
            }
        }

        //normalisation should happen before resolution to avoid security issues
        pathToResolve = path.normalize(pathToResolve as string);

        let pathSplited = pathToResolve.split(/[\/\\]/)

        if (pathSplited.length == 0) {
            console.error("Invalid");
            return HOME_ResolverPath
        }

        let key = pathSplited[0]

        let newPathprefix = this.getKeyPath(key)
        if (!newPathprefix) {
            return null
        }

        let resolverPath = new ResolverPath(key, newPathprefix, ...pathSplited.slice(1), ...dirs)

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

    createResolverPath(key: string, ...dirs: string[]): ResolverPath | null {

        if (isRoot(key)) {
            if (dirs.length != 0) {
                key = dirs[0]
                dirs = dirs.slice(1)
            }
        }

        let newPathprefix = this.getKeyPath(key)
        if (newPathprefix === null) {
            return null
        }

        return new ResolverPath(key, newPathprefix, ...dirs)
    }

}
