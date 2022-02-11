import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { endpoints, FSErrorCode, HttpStatusCode } from './common/constants';
import { MvFile_Request, MvFile_Response } from './common/interfaces';


export const fileServerCopy = express.Router()

fileServerCopy.put(endpoints.ROOT, (req: Request, res: Response) => {

    const data: MvFile_Request = req.body
    console.log("COPY", data)

    const oldPath = path.join(data.parent, data.fileName)

    const newPath = path.join(data.newParent ?? data.parent, data.newFileName ?? data.fileName)

    let resp: MvFile_Response = {
        error: true,
        message: ``,
        parent: path.dirname(newPath),
        oldFileName: data.fileName,
        newFileName: path.basename(newPath)
    }
    
    let statusCode: number = HttpStatusCode.INTERNAL_SERVER

    let mode = data.overwrite ? 0 : fs.constants.COPYFILE_EXCL

    fs.promises.copyFile(oldPath, newPath, mode)
        .then(() => {
            resp.error = false
            resp.message = "OK"
            statusCode = HttpStatusCode.OK
        })
        .catch((error) => {
            switch (error.code) {
                case FSErrorCode.ENOENT:
                    resp.message = `Directory doesn't exist`
                    statusCode = HttpStatusCode.NOT_FOUND
                    break;
                case FSErrorCode.EACCES:
                    resp.message = `Directory is not accessible`
                    statusCode = HttpStatusCode.FORBIDDEN
                    break;
                case FSErrorCode.EEXIST:
                    resp.message = "File already exists"
                    statusCode = HttpStatusCode.CONFLICT
                    break;
                case FSErrorCode.EPERM:
                    resp.message = "Operation not permitted"
                    statusCode = HttpStatusCode.FORBIDDEN
                    break;
                default:
                    console.error(error);
                    resp.message = `Unknown error`
                    statusCode = HttpStatusCode.INTERNAL_SERVER
            }
        })
        .finally(() => {
            res.status(statusCode).send(resp);
        })
})

