export enum FileType {
    File,
    Directory,
    Other
}

export interface FileDetails {
    name: string
    size?: number
    type: FileType;
}

export interface FileList {
    path: string
    files: FileDetails[]
}

export class FileListCls implements FileList {
    path: string
    files: FileDetails[]
    constructor(path: string) {
        this.path = path
        this.files = []
    }
}


interface FS_Response {
    error: boolean,
    message: string,
}

export interface RemoteDirectory {
    remoteDirectory: string
    newPath: string
}

export interface MakeDirRequest {
    parent: string
    dirName: string
    recursive: boolean
}

export interface MakeDirResponse extends FS_Response {
    directory: string
}

export interface RemFile_Request {
    parent: string
    fileName: string
    recursive?: boolean,
    force?: boolean
}

export interface RemFile_Response extends FS_Response {
    file: string,
    parent: string
}

export interface MvFile_Request {
    parent: string
    oldFileName: string
    newFileName: string
}

export interface MvFile_Response extends FS_Response {
    parent: string
    oldFileName: string
    newFileName: string
}