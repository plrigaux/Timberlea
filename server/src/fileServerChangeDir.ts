import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode } from './common/constants';
import { FileServerError } from './common/fileServerCommon';
import { ChangeDir_Request, FileList_Response } from './common/interfaces';
import { resolver } from './filePathResolver';
import { fileServer, isDirectory, returnList } from "./fileServer";

fileServer.put(endpoints.CD,
    body('remoteDirectory').exists().isString(),
    body('newPath').exists().isString(),
    body('returnList').toBoolean()
    , async (req: Request, res: Response, next: NextFunction) => {
        try {
            let newRemoteDirectory: ChangeDir_Request = req.body

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                //console.error("Bad request", errors.array())
                throw new FileServerError(FSErrorMsg.BAD_REQUEST, FSErrorCode.EBADR, JSON.stringify(errors.array()))
            }

            let newPath = resolver.resolve(newRemoteDirectory.remoteDirectory, newRemoteDirectory.newPath)

            if (! await isDirectory(newPath)) {
                throw new FileServerError(FSErrorMsg.DESTINATION_FOLDER_NOT_DIRECTORY, FSErrorCode.ENOTDIR)
            }

            let resp: FileList_Response
            if (newRemoteDirectory.returnList) {
                resp = await returnList(newPath)
            } else {
                resp = {
                    parent: newPath.network,
                    message: FSErrorMsg.OK
                }
            }
            res.status(HttpStatusCode.OK).send(resp)
        }
        catch (err) {
            next(err)
        }
    })
