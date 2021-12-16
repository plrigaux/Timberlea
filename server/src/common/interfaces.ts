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

export interface RemoteDirectory {
    remoteDirectory: string
    newPath: string
}