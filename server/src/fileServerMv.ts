import { Request, Response } from 'express';
import fs from 'fs';
import { endpoints, FSErrorCode, HttpStatusCode } from './common/constants';
import { FileServerError } from './common/fileServerCommon';
import { MvFile_Request, MvFile_Response } from './common/interfaces';
import { resolver } from './filePathResolver';
import { fileServer } from "./fileServer";

fileServer.put(endpoints.MV, (req: Request, res: Response) => {

    const data: MvFile_Request = req.body
    console.log("MV", data)

    const oldPath =  resolver.resolve(data.parent, data.fileName)

    const newPath = resolver.resolve(data.newParent ?? data.parent, data.newFileName ?? data.fileName)

    let resp: MvFile_Response = {
        error: true,
        message: `Unkown error`,
        parent: newPath.dirnameNetwork,
        oldFileName: data.fileName,
        newFileName: newPath.basename
    }

    let statusCode: number = HttpStatusCode.INTERNAL_SERVER

    let fileExistCheck: Promise<boolean>

    if (data.overwrite) {
        fileExistCheck = Promise.resolve(false)
    } else {
        fileExistCheck = fs.promises.access(newPath.server).then(() => {
            return true
        }).catch(() => {
            return false
        })
    }

    fileExistCheck.then((targetExist) => {
        if (targetExist) {
            throw new FileServerError
                ("file already exist ...", FSErrorCode.EEXIST)
        }
        return fs.promises.rename(oldPath.server, newPath.server)
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

