import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode } from './common/constants';
import { FileServerError } from './common/fileServerCommon';
import { MvFile_Request, MvFile_Response } from './common/interfaces';
import { resolver } from './filePathResolver';
import { fileServer } from "./fileServer";

fileServer.put(endpoints.COPY, body('parent').exists().isString(),
    body('fileName').exists().isString(),
    body('newFileName').optional().isString(),
    body('newParent').optional().isString(),
    (req: Request, res: Response, next: NextFunction) => {

        const reqData: MvFile_Request = req.body
        console.log("COPY", reqData)

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //console.error("Bad request", errors.array())
            throw new FileServerError(FSErrorMsg.BAD_REQUEST, FSErrorCode.EBADR, JSON.stringify(errors.array()))
        }

        const oldPath = resolver.resolve(reqData.parent, reqData.fileName)

        let newPath = resolver.resolve(reqData.newParent ?? reqData.parent, reqData.newFileName ?? reqData.fileName)

        let mode = reqData.overwrite ? 0 : fs.constants.COPYFILE_EXCL

        new Promise((resolve, reject) => {
            if (reqData.overwrite) {
                resolve(false)
            } else {
                resolve(fs.promises.access(newPath.server).then(() => {
                    return true
                }).catch(() => {
                    return false
                }))
            }
        }).then((targetExist) => {
            if (targetExist) {
                if (reqData.autoNaming === true) {
                    //Find an available fileName
                    let [fileName, i] = newPath.basenameNoExtNoIndice
                    let ext = newPath.ext
                    let autoFileName
                    do {
                        autoFileName = `${fileName} (${++i}).${ext}`
                        newPath = newPath.add("..", autoFileName)
                    } while (fs.existsSync(newPath.server))
                } else {
                    throw new FileServerError
                        ("file already exist ...", FSErrorCode.EEXIST)
                }
            }
            return fs.promises.copyFile(oldPath.server, newPath.server, mode)
        }).then(() => {
            let resp: MvFile_Response = {
                message: FSErrorMsg.OK,
                parent: newPath.dirnameNetwork,
                oldFileName: reqData.fileName,
                newFileName: newPath.basename
            }

            res.status(HttpStatusCode.OK).send(resp);
        }).catch(next)
    })

