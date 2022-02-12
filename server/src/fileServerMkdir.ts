import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { endpoints, FSErrorCode, HttpStatusCode } from './common/constants';
import { MakeDirRequest, MakeDirResponse } from './common/interfaces';

export const fileServerMkDir = express.Router()


fileServerMkDir.post(endpoints.ROOT, (req: Request, res: Response) => {

    const data: MakeDirRequest = req.body
    console.log("Mkdir", data)
    let dirPath = path.join(data.parent, data.dirName)

    let resp: MakeDirResponse = {
        error: true,
        message: '',
        directory: dirPath
    }

    let statusCode = -1
    let notSent = true

    let options = { recursive: data.recursive ? true : false }

    fs.promises.mkdir(dirPath, options)
        .then(() => {
            resp.error = false
            resp.message = "OK"
            statusCode = HttpStatusCode.CREATED
        })
        .catch((error) => {
            switch (error.code) {
                case FSErrorCode.ENOENT:
                    resp.message = `Directory doesn't exist`
                    statusCode = HttpStatusCode.NOT_FOUND
                    break;
                case FSErrorCode.EEXIST:
                    resp.message = "File already exists"
                    statusCode = HttpStatusCode.CONFLICT
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


