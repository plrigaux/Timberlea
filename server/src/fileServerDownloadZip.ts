import { NextFunction, Request, Response } from "express";
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode } from "./common/constants";
import { resolver } from "./filePathResolver";
import { fileServer } from "./fileServer";
import archiver from "archiver";
import fs from 'fs';
import { FileServerError } from "./common/fileServerCommon";

fileServer.get(endpoints.DOWNZIP + '/:path', async (req: Request, res: Response, next: NextFunction) => {
    let arch: archiver.Archiver | null = null
    try {
        let filePath = req.params.path
        let filePathResolved = resolver.resolve(filePath)

        arch = archiver('zip')

        let filePathRes = filePathResolved.server
        const stat = await fs.promises.stat(filePathRes)

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


    }
    catch (err) {
        next(err)
    }
    finally {
        if (arch) {
            (arch as archiver.Archiver).finalize();
        }
    }
})
