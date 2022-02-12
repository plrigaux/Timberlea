import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { endpoints, FSErrorCode, HttpStatusCode } from './common/constants';
import { RemFile_Request, RemFile_Response } from './common/interfaces';

export const fileServerRem = express.Router()


fileServerRem.delete(endpoints.ROOT, (req: Request, res: Response) => {

    const data: RemFile_Request = req.body
    console.log("Delete", data)

    let filePath = path.join(data.parent, data.fileName)

    let options: fs.RmOptions = {
        force: data.force === true ? true : false,
        recursive: data.recursive === true ? true : false
    }

    let responseData: RemFile_Response = {
        error: true,
        message: "File deleted",
        parent: path.dirname(filePath),
        file: path.basename(filePath)
    }

    let status = 0

    fs.promises.rm(filePath, options).then(() => {
        responseData.error = false
        responseData.message = "File deleted"
        status = HttpStatusCode.OK
    }).catch((error) => {
        switch (error.code) {
            case FSErrorCode.ENOENT:
                responseData.message = "No such file or directory"
                status = HttpStatusCode.NOT_FOUND
                break;
            default:
                responseData.message = error.message
                status = HttpStatusCode.INTERNAL_SERVER
        }
    }).finally(() => {
        res.status(status).send(responseData);
    })

})


