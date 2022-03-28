import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { nextTick } from 'process';
import { endpoints, FSErrorMsg, HttpStatusCode } from './common/constants';
import { FileDetail_Response, FileType } from './common/interfaces';
import { resolver } from './filePathResolver';
import { fileServer } from './fileServer';

fileServer.get(endpoints.DETAILS + "/:path", async (req: Request, res: Response, next: NextFunction) => {

    try {
        const file: string = req.params.path

        const fileRes = resolver.resolve(req.params.path)

        const stat = await fs.promises.stat(fileRes.server)

        let resp: FileDetail_Response = {
            file: {
                name: fileRes.basename,
                type: stat.isFile() ? FileType.File : stat.isDirectory() ? FileType.Directory : FileType.Other,
                size: stat.size,
                parentDirectory: fileRes.dirnameNetwork,
                birthtime: stat.birthtime.toISOString()
            },
            message: FSErrorMsg.OK
        }
        res.status(HttpStatusCode.OK).send(resp)
    }
    catch (err) {
        next(err)
    }
})


