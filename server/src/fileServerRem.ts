import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode } from './common/constants';
import { RemFile_Request, RemFile_Response } from './common/interfaces';
import { Resolver } from './filePathResolver';

export const fileServerRem = express.Router()


fileServerRem.delete(endpoints.ROOT, (req: Request, res: Response) => {

    const data: RemFile_Request = req.body
    console.log("Delete", data)

    let responseData: RemFile_Response = {
        error: true,
        message: "",
        parent: data.parent,
        file: data.fileName
    }

    let filePathResolved = Resolver.instance.resolve(data.parent, data.fileName)
    //let filePath = path.join(data.parent, data.fileName)
    if (!filePathResolved) {
        responseData.message = FSErrorMsg.FILE_DOESNT_EXIST
        res.status(HttpStatusCode.NOT_FOUND).send(responseData);
        return
    }

    let options: fs.RmOptions = {
        force: data.force === true ? true : false,
        recursive: data.recursive === true ? true : false
    }

    let status = 0

    fs.promises.rm(filePathResolved.getPathServer(), options).then(() => {
        responseData.error = false
        responseData.message = "File deleted"
        status = HttpStatusCode.OK
    }).catch((error) => {
        switch (error.code) {
            case FSErrorCode.ENOENT:
                responseData.message = FSErrorMsg.FILE_DOESNT_EXIST
                status = HttpStatusCode.NOT_FOUND
                break;
            default:
                responseData.message = FSErrorMsg.UNKNOWN_ERROR
                status = HttpStatusCode.INTERNAL_SERVER
                responseData.suplemental = error.code
        }
    }).finally(() => {
        res.status(status).send(responseData);
    })

})


