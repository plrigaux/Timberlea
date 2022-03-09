import config from 'config'
//import { env } from 'process';
import path from 'path'
import os from 'os'
import { FileServerError } from './common/fileServerCommon';
import { FSErrorCode } from './common/constants';


export const HOME = ""
export const PATH_UP = ".."
const HOME_DIR = "HOME"
const TEMP_DIR = "TEMP"
const SEPARATOR = "/"

interface FilePathConfig {
    label: string
    path: string
}

function isRoot(key: string): boolean {
    return key === "" || key === SEPARATOR
}

export class ResolverPath {
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

    getFileName(): string {
        let lh = this.dirFiles.length
        return lh > 0 ? this.dirFiles[lh - 1] : ""
    }

    get basename() {
        return this.getFileName()
    }

    get dirnameNetwork() {
        return this.dirFiles.slice(0, -1).join(SEPARATOR)
    }

    get network() {
        if (!this.pathNetwork) {
            this.pathNetwork = this.dirFiles.join(SEPARATOR)
        }
        return this.pathNetwork
    }

    get server() {
        if (!this.pathServer) {
            this.pathServer = path.join(this.prefix, ...this.dirFiles.slice(1))
        }
        return this.pathServer
    }

    add(...extention: string[]): ResolverPath | never {

        if (this.isHomeRoot()) {
            return Resolver.instance.resolve(extention.join(SEPARATOR))
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

    private filePaths = new Map<string, FilePathConfig>()
    private rootKeys: string[]

    private constructor() {
        const configFilePaths = config.get<FilePathConfig[]>('directories');
        console.log(configFilePaths)


        configFilePaths.forEach(filePathConfig => {

            let resolvedPath

            switch (filePathConfig.path) {
                case TEMP_DIR:
                    resolvedPath = Resolver.homeTempSetter(filePathConfig, HOME_DIR, os.tmpdir())
                    break;
                case HOME_DIR:
                    resolvedPath = Resolver.homeTempSetter(filePathConfig, HOME_DIR, os.homedir())
                    break;
                default:
                    let val = config.util.getEnv(filePathConfig.path)
                    resolvedPath = val || filePathConfig.path
            }

            if (!resolvedPath) {
                console.error(`Bad Config - Path resolve error for label ${filePathConfig.label}`)
                return
            }

            let fp: FilePathConfig = {
                label: filePathConfig.label,
                path: path.normalize(resolvedPath)
            }

            this.filePaths.set(fp.label, fp)
        })

        console.log(this.filePaths)

        this.rootKeys = [...this.filePaths.keys()]
    }

    private static homeTempSetter(filePathConfig: FilePathConfig, key: string, defaultPath: string): string {

        let envVal = config.util.getEnv(key)
        if (envVal) {
            console.log(`${key} path was set to env value ${envVal}`)
            return envVal
        }

        console.log(`${key} path was set to default ${defaultPath}`)
        return defaultPath
    }

    getPath(key: string): string | undefined {
        return this.filePaths.get(key)?.path
    }

    resolve(pathToResolve: string | null | undefined, ...dirs: string[]): ResolverPath | never {
        console.log("resolve", pathToResolve, dirs)
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
            throw new FileServerError(`Key "${key}" unresoled`, FSErrorCode.KEY_UNRESOLVED)
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
