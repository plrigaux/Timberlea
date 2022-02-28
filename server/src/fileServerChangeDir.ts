import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode } from './common/constants';
import { FileServerError } from './common/fileServerCommon';
import { ChangeDir_Request, MakeDirRequest, MakeDirResponse } from './common/interfaces';
import { Resolver } from './filePathResolver';
import { Bob, directoryValid, fileServer, returnList } from "./fileServer";

fileServer.put(endpoints.CD,
    body('remoteDirectory').exists().isString(),
    body('newPath').exists().isString(),
    body('returnList').toBoolean()
    , (req: Request, res: Response) => {
        console.log("cdpath: " + req.body)
        console.log("remoteDirectory: " + req.body.remoteDirectory)
        console.log("newPath: " + req.body.newPath)

        let newRemoteDirectory: ChangeDir_Request = req.body

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //console.error("Bad request", errors.array())
            throw new FileServerError(FSErrorMsg.BAD_REQUEST, FSErrorCode.EBADR, JSON.stringify(errors.array()))
        }

        let newPath = Resolver.instance.resolve(newRemoteDirectory.remoteDirectory, newRemoteDirectory.newPath)

        directoryValid(newPath).then((valid: Bob) => {
            if (newRemoteDirectory.returnList && !valid.resp.error) {
                return returnList(newPath)
            } else {
                return valid
            }
        }).then((valid: Bob) => {
            res.status(valid.statusCode).send(valid.resp)
        })
    })
