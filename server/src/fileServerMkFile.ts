import express, { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode } from './common/constants';
import { FileServerError } from './common/fileServerCommon';
import { FileDetail_Response, FileType, MakeDirResponse, MakeFileRequest, MakeFileResponse } from './common/interfaces';
import { Resolver } from './filePathResolver';
import { fileServer } from "./fileServer";

fileServer.post(endpoints.MKFILE,
    body('parent').exists().isString(),
    body('fileName').exists().isString(),
    (req: Request, res: Response, next: NextFunction) => {



        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //console.error("Bad request", errors.array())
            throw new FileServerError(FSErrorMsg.BAD_REQUEST, FSErrorCode.EBADR, JSON.stringify(errors.array()))
        }

        const requestData: MakeFileRequest = req.body
        console.log("Mkfile", requestData)

        let fileRes = Resolver.instance.resolve(requestData.parent, requestData.fileName)
        let options = { flag: "wx" }

        fs.promises.writeFile(fileRes.server, requestData.data || "", options)
            .then(() => {
                return fs.promises.stat(fileRes.server)
            }).then(stat => {
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
                res.status(HttpStatusCode.CREATED).send(resp)
            })
            .catch(next)
    })


