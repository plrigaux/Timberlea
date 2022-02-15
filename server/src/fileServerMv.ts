import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { endpoints, FSErrorCode, HttpStatusCode } from './common/constants';
import { MvFile_Request, MvFile_Response } from './common/interfaces';

export const fileServerMv = express.Router()


class FileError extends Error {
    code: string | undefined;
}

fileServerMv.put(endpoints.ROOT, (req: Request, res: Response) => {

    const data: MvFile_Request = req.body
    console.log("MV", data)

    const oldPath = path.join(data.parent, data.fileName)

    const newPath = path.join(data.newParent ?? data.parent, data.newFileName ?? data.fileName)

    let resp: MvFile_Response = {
        error: true,
        message: `Unkown error`,
        parent: path.dirname(newPath),
        oldFileName: data.fileName,
        newFileName: path.basename(newPath)
    }
    let statusCode: number = HttpStatusCode.INTERNAL_SERVER

    let fileExistCheck: Promise<boolean>

    if (data.overwrite) {
        fileExistCheck = Promise.resolve(false)
    } else {
        fileExistCheck = fs.promises.access(newPath).then(() => {
            return true
        }).catch(() => {
            return false
        })
    }

    fileExistCheck.then((targetExist) => {
        if (targetExist) {
            let e = new FileError("file already exist ...")
            e.code = FSErrorCode.EEXIST
            throw e
        }
        return fs.promises.rename(oldPath, newPath)
    }).then(() => {
        //console.warn("OK .. ")
        resp.error = false
        resp.message = "OK"
        statusCode = HttpStatusCode.OK
    }).catch((error) => {
        //console.warn(error)
        switch (error.code) {
            case FSErrorCode.ENOENT: //TODO check invalid Char
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
    }).finally(() => {
        res.status(statusCode).send(resp);
    })
})

