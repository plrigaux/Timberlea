import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { endpoints, FSErrorMsg, HttpStatusCode } from './common/constants';
import { RemFile_Request, RemFile_Response } from './common/interfaces';
import { resolver } from './filePathResolver';
import { fileServer } from "./fileServer";

fileServer.delete(endpoints.REM, async (req: Request, res: Response, next: NextFunction) => {

    const data: RemFile_Request = req.body
    console.log("Delete", data)
    try {
        let filePathResolved = resolver.resolve(data.parent, data.fileName)

        let options: fs.RmOptions = {
            force: data.force === true ? true : false,
            recursive: data.recursive === true ? true : false
        }

        await fs.promises.rm(filePathResolved.server, options)
        let responseData: RemFile_Response = {
            message: FSErrorMsg.OK,
            parent: data.parent,
            file: data.fileName
        }

        res.status(HttpStatusCode.OK).send(responseData);
    }
    catch (err) {
        next(err)
    }

})


