import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { endpoints, HttpStatusCode } from './common/constants';
import { MakeDirResponse, MakeFileRequest, MakeFileResponse } from './common/interfaces';
import { Resolver } from './filePathResolver';
import { fileServer } from "./fileServer";

fileServer.post(endpoints.MKFILE, (req: Request, res: Response, next: NextFunction) => {

    const data: MakeFileRequest = req.body
    console.log("Mkfile", data)


    let dirPath = Resolver.instance.resolve(data.dir, data.fileName)
    let options = { flag: "wx" }

    fs.promises.writeFile(dirPath.getPathServer(), data.data, options)
        .then(() => {

            let resp: MakeFileResponse = {
                error: false,
                message: "OK",
                fileName: data.fileName
            }

            let statusCode = HttpStatusCode.CREATED
            res.status(statusCode).send(resp);
        })
        .catch(next)
})


