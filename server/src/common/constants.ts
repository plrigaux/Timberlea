export namespace endpoints {

    export const ROOT = "/"
    export const FS = "/fs"

    export const LIST = "/list"
    export const CD = "/cd"
    export const PWD = "/pwd"
    export const DOWNLOAD = "/download"
    export const UPLOAD = "/upload"
    export const MKDIR = "/mkdir"
    export const MKFILE = "/mkfile"
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
    export const FS_MKFILE = FS + MKFILE
    export const FS_REM = FS + REM
    export const FS_MV = FS + MV
    export const FS_DETAILS = FS + DETAILS
    export const FS_COPY = FS + COPY
}

export namespace uploadFile {
    export const DESTINATION_FOLDER = "destinationFolder"
}


export enum FSErrorMsg {
    NO_DESTINATION_FOLDER_SUPPLIED = "NO DESTINATION FOLDER SUPPLIED",
    FILE_ALREADY_EXIST = "FILE ALREADY EXIST",
    FILE_DOESNT_EXIST = "FILE DOESN'T EXIST",
    FILE_NOT_ACCESSIBLE = "FILE NOT ACCESSIBLE",
    DESTINATION_FOLDER_NOT_DIRECTORY = "DESTINATION FOLDER NOT DIRECTORY",
    DESTINATION_FOLDER_DOESNT_EXIST = "DESTINATION FOLDER DOESN'T EXIST",
    DESTINATION_FOLDER_NOT_ACCESSIBLE = "DESTINATION FOLDER NOT ACCESSIBLE",
    BAD_REQUEST = "BAD_REQUEST",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    OPERATION_NOT_PERMITTED = "OPERATION_NOT_PERMITTED",
    OK = "OK"
}

export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    /** Bad Request. */
    BAD_REQUEST = 400,
    /** Access to that resource is forbidden. */
    FORBIDDEN = 403,
    /** The requested resource was not found. */
    NOT_FOUND = 404,
    /** Conflict */
    CONFLICT = 409,
    /** There was an error on the server and the request could not be completed. */
    INTERNAL_SERVER = 500,
}

/**
 * This are error codes
 */

export enum FSErrorCode {
  /** Permission is denied. */
  EACCES = "EACCES",
  /** There is no such file or directory exists */
  ENOENT = "ENOENT",
  /** File already exists */
  EEXIST = "EEXIST",
  /** operation is not permitted */
  EPERM = "EPERM",
  /** not a directory */
  ENOTDIR = "ENOTDIR",
  /** there is an invalid argument */
  EINVAL = "EINVAL",
  /** illegal operation on a directory */
  EISDIR = "EISDIR",
  /** Directory mapping key not resolved */
  KEY_UNRESOLVED = "KEY_UNRESOLVED",
  /** Invalid request descriptor */
  EBADR = "EBADR",
  ERR_FS_EISDIR = "ERR_FS_EISDIR"
}
