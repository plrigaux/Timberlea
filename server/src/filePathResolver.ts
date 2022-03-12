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

let isRoot = (key: string): boolean => {
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

    /**
     *  returns the last portion of a path
     */
    get basename(): string {
        return this.getFileName()
    }

    get basenameNoExt() {
        let fn = this.getFileName()
        let idx = fn.lastIndexOf(".")
        if (idx >= 0) {
            return fn.slice(0, idx)
        }
        return fn
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
            return resolver.resolve(extention.join(SEPARATOR))
        }

        let array = [...this.dirFiles, ...extention]
        return new ResolverPath(this.prefix, array)
    }

    isHomeRoot() {
        return this.prefix === HOME
    }
}

export const HOME_ResolverPath = new ResolverPath("", [])

export namespace resolver {

    let filePaths = new Map<string, FilePathConfig>()
    let rootKeys: string[]

    let init = () => {
        const configFilePaths = config.get<FilePathConfig[]>('directories');
        console.log("init directories", configFilePaths)


        configFilePaths.forEach(filePathConfig => {

            let resolvedPath: string

            switch (filePathConfig.path) {
                case TEMP_DIR:
                    resolvedPath = homeTempSetter(HOME_DIR, os.tmpdir())
                    break;
                case HOME_DIR:
                    resolvedPath = homeTempSetter(HOME_DIR, os.homedir())
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

            filePaths.set(fp.label, fp)
        })

        console.log("filePaths", filePaths)

        rootKeys = [...filePaths.keys()]
    }

    let homeTempSetter = (key: string, defaultPath: string): string => {

        let envVal = config.util.getEnv(key)
        if (envVal) {
            console.log(`${key} path was set to env value ${envVal}`)
            return envVal
        }

        console.log(`${key} path was set to default ${defaultPath}`)
        return defaultPath
    }

    export let resolve = (pathToResolve: string | null | undefined, ...dirs: string[]): ResolverPath | never => {
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

        let newPathprefix = filePaths.get(key)?.path
        if (!newPathprefix) {
            throw new FileServerError(`Key "${key}" unresoled`, FSErrorCode.KEY_UNRESOLVED)
        }

        let resolverPath = new ResolverPath(newPathprefix, array2)

        return resolverPath
    }

    export let root = (): string[] => {
        return rootKeys
    }

    init()
}