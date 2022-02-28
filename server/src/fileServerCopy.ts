import express, { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode } from './common/constants';
import { FileServerError } from './common/fileServerCommon';
import { MvFile_Request, MvFile_Response } from './common/interfaces';
import { Resolver } from './filePathResolver';
import { fileServer } from "./fileServer";



fileServer.put(endpoints.COPY, body('parent').exists().isString(),
    body('fileName').exists().isString(),
    body('newFileName').optional().isString(),
    body('newParent').optional().isString(),
    (req: Request, res: Response, next: NextFunction) => {

        const data: MvFile_Request = req.body
        console.log("COPY", data)

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //console.error("Bad request", errors.array())
            throw new FileServerError(FSErrorMsg.BAD_REQUEST, FSErrorCode.EBADRQC, JSON.stringify(errors.array()))
        }

        const oldPath = Resolver.instance.resolve(data.parent, data.fileName)

        const newPath = Resolver.instance.resolve(data.newParent ?? data.parent, data.newFileName ?? data.fileName)

        let mode = data.overwrite ? 0 : fs.constants.COPYFILE_EXCL

        fs.promises.copyFile(oldPath.server, newPath.server, mode)
            .then(() => {
                let resp: MvFile_Response = {
                    error: false,
                    message: "OK",
                    parent: newPath.dirnameNetwork,
                    oldFileName: data.fileName,
                    newFileName: newPath.basename
                }

                res.status(HttpStatusCode.OK).send(resp);
            })
            .catch(next)
    })

