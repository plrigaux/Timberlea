import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode } from './common/constants';
import { FileServerError } from './common/fileServerCommon';
import { FileDetail_Response, FileType, MakeFileRequest } from './common/interfaces';
import { resolver } from './filePathResolver';
import { fileServer } from "./fileServer";

fileServer.post(endpoints.MKFILE,
    body('parent').exists().isString(),
    body('fileName').exists().isString(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                //console.error("Bad request", errors.array())
                throw new FileServerError(FSErrorMsg.BAD_REQUEST, FSErrorCode.EBADR, JSON.stringify(errors.array()))
            }

            const requestData: MakeFileRequest = req.body
            console.log("Mkfile", requestData)

            let fileRes = resolver.resolve(requestData.parent, requestData.fileName)
            let options = { flag: "wx" }

            await fs.promises.writeFile(fileRes.server, requestData.data || "", options)

            let stat = await fs.promises.stat(fileRes.server)

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
            res.status(HttpStatusCode.CREATED).send(resp)
        }
        catch (err) {
            next(err)
        }
    })