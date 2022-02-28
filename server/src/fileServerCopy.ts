import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { endpoints, FSErrorCode, HttpStatusCode } from './common/constants';
import { MvFile_Request, MvFile_Response } from './common/interfaces';
import { Resolver } from './filePathResolver';
import { fileServer } from "./fileServer";

fileServer.put(endpoints.COPY, (req: Request, res: Response, next: NextFunction) => {

    const data: MvFile_Request = req.body
    console.log("COPY", data)

    const oldPath = Resolver.instance.resolve(data.parent, data.fileName)

    const newPath = Resolver.instance.resolve(data.newParent ?? data.parent, data.newFileName ?? data.fileName)

    let mode = data.overwrite ? 0 : fs.constants.COPYFILE_EXCL

    fs.promises.copyFile(oldPath.server, newPath.server, mode)
        .then(() => {
            let resp: MvFile_Response = {
                error: false,
                message: "OK",
                parent: newPath.dirnameNetwork,
                oldFileName: data.fileName,
                newFileName: newPath.basename
            }

            res.status(HttpStatusCode.OK).send(resp);
        })
        .catch(next)
})

