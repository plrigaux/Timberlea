import express, { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import fs, { Dirent } from 'fs';
import path from 'path';
import { endpoints, FSErrorMsg, FSErrorCode, HttpStatusCode } from './common/constants';
import { FileServerError } from './common/fileServerCommon';
import { ChangeDir_Request, ChangeDir_Response, FileDetails, FileDetail_Response, FileList_Response, FileType, FS_Response } from './common/interfaces';
import { HOME, HOME_ResolverPath, Resolver, ResolverPath } from './filePathResolver';

export const fileServer = express.Router()

fileServer.get(endpoints.PWD, (req: Request, res: Response) => {
    const notes = '.'

    let dirName = path.dirname(notes) // /users/joe
    let basename = path.basename(notes) // notes.txt
    let extname = path.extname(notes)
    let p = process.cwd()
    console.log(`PWD  basename ${basename} extname ${extname} dirName ${dirName} process.cwd ${p}`)

    let newRemoteDirectory: ChangeDir_Response = {
        parent: HOME,
        error: false,
        message: 'OK'
    }
    res.send(newRemoteDirectory)
});

export interface Bob { statusCode: number; resp: FileList_Response }

export function returnList(folder: ResolverPath): Promise<Bob> {
    console.log(`folder ${folder}`)

    if (folder == HOME_ResolverPath) {
        let resp: FileList_Response = {
            parent: HOME_ResolverPath.getPathNetwork(),
            error: false,
            message: "HOME",
            files: [],
        }

        Resolver.instance.root().forEach((key: string) => {

            let fd: FileDetails = {
                name: key,
                type: FileType.Directory
            }
            resp.files?.push(fd)
        })

        let statusCode = HttpStatusCode.OK

        let ret: Promise<Bob> = new Promise((resolve, reject) => {
            resolve({ statusCode, resp })
        });

        return ret;
    }

    return fs.promises.readdir(folder.getPathServer(), { withFileTypes: true })
        .then((files: Dirent[]) => {
            return files.map((file: Dirent) => {
                let fd: FileDetails = {
                    name: file.name,
                    type: file.isFile() ? FileType.File : file.isDirectory() ? FileType.Directory : FileType.Other,
                }
                return fd
            })
        })
        .then(fileDetails => {
            let promiseList: (Promise<void | FileDetails> | FileDetails)[] = []
            fileDetails.forEach((file: FileDetails) => {

                let prom = fs.promises.stat(path.join(folder.getPathServer(), file.name))
                    .then(stats => {
                        if (file.type === FileType.File) {
                            file.size = stats.size
                        }
                        file.mtime = stats.mtime.toISOString()
                        return file
                    }).catch((error) => {
                        console.log(error.code, error.message, file.name)
                    });
                promiseList.push(prom)
            })

            return Promise.all(promiseList).then(_files => {

                let resp: FileList_Response = {
                    parent: folder.getPathNetwork(),
                    files: [],
                    error: false,
                    message: 'Ok'
                }
                _files.forEach((f: void | FileDetails) => {
                    if (f) {
                        resp.files!.push(f)
                    }
                })
                return resp
            }).then(
                resp => {
                    let statusCode = HttpStatusCode.OK
                    return { statusCode, resp }
                }
            )
        })
}

function getList(req: Request, res: Response, next: NextFunction) {
    let paramPath = req.params.path
    let folder: ResolverPath = Resolver.instance.resolve(paramPath)
    returnList(folder).then((b: Bob) => {
        res.status(b.statusCode).send(b.resp)
    }).catch(next)
}

//List without path
fileServer.get(endpoints.LIST, (req: Request, res: Response, next: NextFunction) => {
    getList(req, res, next)
})

fileServer.get(endpoints.LIST + "/:path", (req: Request, res: Response, next: NextFunction) => {
    getList(req, res, next)
})

fileServer.get(endpoints.DETAILS + "/:path", (req: Request, res: Response, next: NextFunction) => {

    const file: string = req.params.path

    let statusCode = -1
    fs.promises.stat(file)
        .then(stat => {
            let resp: FileDetail_Response = {
                file: {
                    name: path.basename(file),
                    type: stat.isFile() ? FileType.File : stat.isDirectory() ? FileType.Directory : FileType.Other,
                    size: stat.size,
                    parentDirectory: path.dirname(file),
                    birthtime: stat.birthtime.toISOString()
                },
                error: false,
                message: FSErrorMsg.OK
            }
            statusCode = HttpStatusCode.OK
            res.status(statusCode).send(resp)
        })
        .catch(next)
})

export function directoryValid(dirpath: ResolverPath): Promise<Bob> {

    let resp: FileList_Response = {
        parent: dirpath.network,
        error: true,
        message: ''
    }
    let statusCode = 0

    return fs.promises.stat(dirpath.server)
        .then((stat: fs.Stats) => {
            const isDirectory = stat.isDirectory()
            if (isDirectory) {
                resp.error = false
                statusCode = HttpStatusCode.OK
            } else {
                resp.error = true
                resp.message = FSErrorMsg.DESTINATION_FOLDER_NOT_DIRECTORY
                statusCode = HttpStatusCode.CONFLICT
            }
            //resp.parent = dirpath.getPathNetwork()
            return { statusCode, resp }
        }).catch((error) => {
            switch (error.code) {
                case FSErrorCode.ENOENT:
                    resp.message = FSErrorMsg.DESTINATION_FOLDER_DOESNT_EXIST
                    statusCode = HttpStatusCode.NOT_FOUND
                    break;
                case FSErrorCode.EACCES:
                    resp.message = FSErrorMsg.DESTINATION_FOLDER_NOT_ACCESSIBLE
                    statusCode = HttpStatusCode.FORBIDDEN
                    break;
                default:
                    console.error(error);
                    resp.message = FSErrorMsg.UNKNOWN_ERROR
                    statusCode = HttpStatusCode.INTERNAL_SERVER
            }
            return { statusCode, resp }
        })
}


