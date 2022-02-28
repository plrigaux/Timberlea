import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { endpoints, FSErrorCode, HttpStatusCode } from './common/constants';
import { MakeDirRequest, MakeDirResponse } from './common/interfaces';
import { Resolver } from './filePathResolver';
import { fileServer } from "./fileServer";

fileServer.post(endpoints.MKDIR, (req: Request, res: Response, next: NextFunction) => {

    const data: MakeDirRequest = req.body
    console.log("Mkdir", data)


    let dirPath = Resolver.instance.resolve(data.parent, data.dirName)
    let options = { recursive: data.recursive === true ? true : false }

    fs.promises.mkdir(dirPath.getPathServer(), options)
        .then(() => {

            let resp: MakeDirResponse = {
                error: false,
                message: "OK",
                directory: dirPath.getPathNetwork()
            }

            let statusCode = HttpStatusCode.CREATED
            res.status(statusCode).send(resp);
        })
        .catch(next)
})


