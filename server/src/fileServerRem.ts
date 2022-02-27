import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode } from './common/constants';
import { RemFile_Request, RemFile_Response } from './common/interfaces';
import { Resolver } from './filePathResolver';

export const fileServerRem = express.Router()


fileServerRem.delete(endpoints.ROOT, (req: Request, res: Response, next: NextFunction) => {

    const data: RemFile_Request = req.body
    console.log("Delete", data)

    let filePathResolved = Resolver.instance.resolve(data.parent, data.fileName)

    let options: fs.RmOptions = {
        force: data.force === true ? true : false,
        recursive: data.recursive === true ? true : false
    }

    let status = 0

    fs.promises.rm(filePathResolved.getPathServer(), options).then(() => {
        let responseData: RemFile_Response = {
            error: false,
            message: "File deleted",
            parent: data.parent,
            file: data.fileName
        }

        let statusCode = HttpStatusCode.OK
        res.status(statusCode).send(responseData);
    }).catch(next)

})


