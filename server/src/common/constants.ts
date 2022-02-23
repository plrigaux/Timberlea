export namespace endpoints {

    export const ROOT = "/"
    export const FS = "/fs"

    export const LIST = "/list"
    export const CD = "/cd"
    export const PWD = "/pwd"
    export const DOWNLOAD = "/download"
    export const UPLOAD = "/upload"
    export const MKDIR = "/mkdir"
    export const REM = "/rem"
    export const MV = "/mv"
    export const DETAILS = "/details"
    export const COPY = "/copy"

    export const FS_LIST = FS + LIST
    export const FS_CD = FS + CD
    export const FS_PWD = FS + PWD
    export const FS_DOWNLOAD = FS + DOWNLOAD
    export const FS_UPLOAD = FS + UPLOAD
    export const FS_MKDIR = FS + MKDIR
    export const FS_REM = FS + REM
    export const FS_MV = FS + MV
    export const FS_DETAILS = FS + DETAILS
    export const FS_COPY = FS + COPY
}

export namespace uploadFile {
    export const DESTINATION_FOLDER = "destinationFolder"
}

export namespace fileServerErrors {
    export const NO_DESTINATION_FOLDER_SUPPLIED = "NO DESTINATION FOLDER SUPPLIED"
    export const FILE_ALREADY_EXIST = "FILE ALREADY EXIST"
    export const FILE_DOESNT_EXIST = "FILE DOESN'T EXIST"
    export const FILE_NOT_ACCESSIBLE = "FILE NOT ACCESSIBLE"
    export const DESTINATION_FOLDER_NOT_DIRECTORY =  "DESTINATION FOLDER NOT DIRECTORY"
    export const DESTINATION_FOLDER_DOESNT_EXIST = "DESTINATION FOLDER DOESN'T EXIST"
    export const DESTINATION_FOLDER_NOT_ACCESSIBLE = "DESTINATION FOLDER NOT ACCESSIBLE"
    export const BAD_REQUEST = "BAD_REQUEST"
    export const UNKNOWN_ERROR = "UNKNOWN_ERROR"
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

/**
 * This are error codes
 */
export enum FSErrorCode {
    EACCES = "EACCES",
    /** No such file or directory */
    ENOENT = "ENOENT", 
    EEXIST = "EEXIST",
    EPERM = "EPERM",
    ENOTDIR = "ENOTDIR", //** Not directoro */
    EINVAL = "EINVAL"
}
