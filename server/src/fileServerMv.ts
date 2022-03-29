import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode } from './common/constants';
import { FileServerError } from './common/fileServerCommon';
import { MvFile_Request, MvFile_Response } from './common/interfaces';
import { resolver } from './filePathResolver';
import { fileServer, isEntityExists } from "./fileServer";

fileServer.put(endpoints.MV, async (req: Request, res: Response, next: NextFunction) => {

    const reqData: MvFile_Request = req.body
    console.log("MV", reqData)
    try {
        const oldPath = resolver.resolve(reqData.parent, reqData.fileName)

        let newPath = resolver.resolve(reqData.newParent ?? reqData.parent, reqData.newFileName ?? reqData.fileName)

        let targetExist = false
        if (!reqData.overwrite) {
            targetExist = await isEntityExists(newPath.server)
        }

        if (targetExist) {
            throw new FileServerError
                ("file already exist ...", FSErrorCode.EEXIST)
        }

        await fs.promises.rename(oldPath.server, newPath.server)

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
    }
    catch (err) {
        next(err)
    }
})

