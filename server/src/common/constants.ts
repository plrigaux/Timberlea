export namespace endpoints {
    export const FS = "/fs"

    export const LIST = "/list"
    export const CD = "/cd"
    export const PWD = "/pwd"
    export const DOWNLOAD = "/download"
    export const UPLOAD = "/upload"
    export const MKDIR = "/mkdir"
    export const REM = "/rem"
    export const MV = "/mv"

    export const FS_LIST = FS + LIST
    export const FS_CD = FS + CD
    export const FS_PWD = FS + PWD
    export const FS_DOWNLOAD = FS + DOWNLOAD
    export const FS_UPLOAD = FS + UPLOAD
    export const FS_MKDIR = FS + MKDIR
    export const FS_REM = FS + REM
    export const FS_MV = FS + MV
}

export namespace uploadFile {
    export const DESTINATION_FOLDER = "destinationFolder"
}

export namespace fileServerErrors {
    export const NO_DESTINATION_FOLDER = "NO DESTINATION FOLDER"
    export const FILE_ALREADY_EXIST = "FILE ALREADY EXIST"
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