import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { endpoints, FSErrorMsg, HttpStatusCode } from './common/constants';
import { FileDetail_Response, FileType } from './common/interfaces';
import { Resolver } from './filePathResolver';
import { fileServer } from './fileServer';


fileServer.get(endpoints.DETAILS + "/:path", (req: Request, res: Response, next: NextFunction) => {

    const file: string = req.params.path
    const fileRes = Resolver.instance.resolve(req.params.path)

    fs.promises.stat(fileRes.server)
        .then(stat => {
            let resp: FileDetail_Response = {
                file: {
                    name: fileRes.basename,
                    type: stat.isFile() ? FileType.File : stat.isDirectory() ? FileType.Directory : FileType.Other,
                    size: stat.size,
                    parentDirectory: fileRes.dirnameNetwork,
                    birthtime: stat.birthtime.toISOString()
                },
                error: false,
                message: FSErrorMsg.OK
            }
            res.status(HttpStatusCode.OK).send(resp)
        })
        .catch(next)
})


