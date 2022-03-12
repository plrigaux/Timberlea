import { NextFunction, Request, Response } from "express";
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode } from "./common/constants";
import { resolver } from "./filePathResolver";
import { fileServer } from "./fileServer";
import archiver from "archiver";
import fs from 'fs';
import { FileServerError } from "./common/fileServerCommon";

fileServer.get(endpoints.DOWNZIP + '/:path', (req: Request, res: Response, next: NextFunction) => {
    let filePath = req.params.path
    let filePathResolved = resolver.resolve(filePath)

    const arch : archiver.Archiver = archiver('zip')
   
    let filePathRes = filePathResolved.server
    fs.promises.stat(filePathRes).then((stat) => {

        let fileName = ""
        if (stat.isDirectory()) {
            arch.directory(filePathResolved.server, false);
            fileName = filePathResolved.basename + '.zip'
        } else if (stat.isFile()) {
            arch.file(filePathResolved.server, { name: filePathResolved.basename });
            fileName = filePathResolved.basenameNoExt + '.zip'
        } else {
            throw new FileServerError(FSErrorMsg.UNKNOWN_ERROR, FSErrorCode.ENOENT)
        }

        arch.pipe(res);
        arch.on('end', () => res.end()); // end response when archive stream ends
        arch.on('error', function (err) {
            next(err);
        });
        res.attachment(fileName).type('zip');

    }).catch(next)
    .finally(() => {
        arch.finalize();
    })
})
