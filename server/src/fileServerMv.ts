import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode } from './common/constants';
import { FileServerError } from './common/fileServerCommon';
import { MvFile_Request, MvFile_Response } from './common/interfaces';
import { resolver } from './filePathResolver';
import { fileServer } from "./fileServer";

fileServer.put(endpoints.MV, (req: Request, res: Response, next: NextFunction) => {

    const reqData: MvFile_Request = req.body
    console.log("MV", reqData)

    const oldPath = resolver.resolve(reqData.parent, reqData.fileName)

    let newPath = resolver.resolve(reqData.newParent ?? reqData.parent, reqData.newFileName ?? reqData.fileName)


    let fileExistCheck: Promise<boolean>

    if (reqData.overwrite) {
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
        let respData: MvFile_Response = {
            message: FSErrorMsg.OK,
            parent: newPath.dirnameNetwork,
            oldFileName: reqData.fileName,
            newFileName: newPath.basename,
        }

        if (reqData.newParent) {
            respData.oldParent = oldPath.dirnameNetwork
        }

        res.status(HttpStatusCode.OK).send(respData);
    }).catch(next)

})

