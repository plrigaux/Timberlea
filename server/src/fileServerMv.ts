import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { endpoints, FSErrorCode, HttpStatusCode } from './common/constants';
import { FileServerError } from './common/fileServerCommon';
import { MvFile_Request, MvFile_Response } from './common/interfaces';
import { resolver } from './filePathResolver';
import { fileServer } from "./fileServer";

fileServer.put(endpoints.MV, (req: Request, res: Response, next: NextFunction) => {

    const data: MvFile_Request = req.body
    console.log("MV", data)

    const oldPath =  resolver.resolve(data.parent, data.fileName)

    const newPath = resolver.resolve(data.newParent ?? data.parent, data.newFileName ?? data.fileName)


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
        let resp: MvFile_Response = {
            error: true,
            message: `Unkown error`,
            parent: newPath.dirnameNetwork,
            oldFileName: data.fileName,
            newFileName: newPath.basename,
        }
    
        if (data.newParent) {
            resp.oldParent = oldPath.dirnameNetwork
        }
    
        resp.error = false
        resp.message = "OK"
        let statusCode = HttpStatusCode.OK

        res.status(statusCode).send(resp);
    }).catch(next)
    
})

