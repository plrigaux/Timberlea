import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode } from './common/constants';
import { FileServerError } from './common/fileServerCommon';
import { MakeDirRequest, MakeDirResponse } from './common/interfaces';
import { Resolver } from './filePathResolver';
import { fileServer } from "./fileServer";

fileServer.post(endpoints.MKDIR, 
    body('parent').exists().isString(),
    body('dirName').exists().isString(),
    (req: Request, res: Response, next: NextFunction) => {

    const data: MakeDirRequest = req.body
    console.log("Mkdir", data)

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //console.error("Bad request", errors.array())
        throw new FileServerError(FSErrorMsg.BAD_REQUEST, FSErrorCode.EBADR, JSON.stringify(errors.array()))
    }

    let dirPath = Resolver.instance.resolve(data.parent, data.dirName)
    let options = { recursive: data.recursive === true ? true : false }

    fs.promises.mkdir(dirPath.server, options)
        .then(() => {

            let resp: MakeDirResponse = {
                error: false,
                message: "OK",
                parent: dirPath.dirnameNetwork,
                dirName: dirPath.basename
            }

            res.status(HttpStatusCode.CREATED).send(resp);
        })
        .catch(next)
})


