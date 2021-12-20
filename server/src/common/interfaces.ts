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

export interface FileList_Response extends FS_Response {
    parent: string
    files: FileDetails[]
}

interface FS_Response {
    error: boolean,
    message: string,
}

export interface ChangeDir_Request {
    remoteDirectory: string
    newPath: string
}

export interface ChangeDir_Response extends FS_Response {
    directory: string
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

export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    INTERNAL_SERVER = 500,
}

export enum FSErrorCode {
    EACCES  = "EACCES",
    ENOENT  = "ENOENT",
 }