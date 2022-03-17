import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode } from './common/constants';
import { FileServerError } from './common/fileServerCommon';
import { ChangeDir_Request, FileList_Response } from './common/interfaces';
import { resolver, ResolverPath } from './filePathResolver';
import { fileServer, returnList } from "./fileServer";


export function directoryValid(dirpath: ResolverPath): Promise<boolean> {
    return fs.promises.stat(dirpath.server)
        .then((stat: fs.Stats) => {
            const isDirectory = stat.isDirectory()
            return isDirectory
        })
}

fileServer.put(endpoints.CD,
    body('remoteDirectory').exists().isString(),
    body('newPath').exists().isString(),
    body('returnList').toBoolean()
    , (req: Request, res: Response, next: NextFunction) => {
        let newRemoteDirectory: ChangeDir_Request = req.body

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //console.error("Bad request", errors.array())
            throw new FileServerError(FSErrorMsg.BAD_REQUEST, FSErrorCode.EBADR, JSON.stringify(errors.array()))
        }

        let newPath = resolver.resolve(newRemoteDirectory.remoteDirectory, newRemoteDirectory.newPath)

        directoryValid(newPath)
            .then((isDirectory: boolean) => {
                if (!isDirectory) {
                    throw new FileServerError(FSErrorMsg.DESTINATION_FOLDER_NOT_DIRECTORY, FSErrorCode.ENOTDIR)
                }
            })
            .then(() => {
                if (newRemoteDirectory.returnList) {
                    return returnList(newPath)
                } else {
                    let resp: FileList_Response = {
                        parent: newPath.network,
                        message: FSErrorMsg.OK
                    }
                    return resp
                }
            }) 
            .then((resp: FileList_Response) => {
                res.status(HttpStatusCode.OK).send(resp)
            }).catch(next)
    })
