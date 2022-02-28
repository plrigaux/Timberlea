import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode, uploadFile } from './common/constants';
import { FileServerError } from './common/fileServerCommon';
import { FileUpload_Response } from './common/interfaces';
import { Resolver } from './filePathResolver';
import { fileServer } from "./fileServer";

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        let dsError: Error | null = null
        let cbDestinationFolder = ""

        new Promise<string>((resolve, reject) => {
            let destinationFolder = req.body[uploadFile.DESTINATION_FOLDER]
            if (!destinationFolder) {
                let newError = new FileServerError(FSErrorMsg.NO_DESTINATION_FOLDER_SUPPLIED, FSErrorCode.EINVAL)
                reject(newError)
            } else {
                resolve(destinationFolder)
            }
        }).then((destinationFolder: string) => {
            let df = Resolver.instance.resolve(destinationFolder)
            if (!df) {
                throw new FileServerError(FSErrorMsg.NO_DESTINATION_FOLDER_SUPPLIED, FSErrorCode.EINVAL)
            }
            cbDestinationFolder = df.getPathServer()
            return fs.promises.stat(cbDestinationFolder)
        }).then(stat => {
            if (!stat.isDirectory()) {
                let newError = new FileServerError(FSErrorMsg.DESTINATION_FOLDER_NOT_DIRECTORY, FSErrorCode.ENOTDIR)
                dsError = newError
            } else {
                return fs.promises.access(cbDestinationFolder, fs.constants.R_OK | fs.constants.W_OK);
            }
        }).catch(error => {
            dsError = error
            if (error) {
                if (error.code == FSErrorCode.ENOENT) {
                    let newError = new FileServerError(FSErrorMsg.DESTINATION_FOLDER_DOESNT_EXIST, FSErrorCode.ENOENT)
                    dsError = newError
                } else if (error.code == FSErrorCode.EACCES) {
                    let newError = new FileServerError(FSErrorMsg.DESTINATION_FOLDER_NOT_ACCESSIBLE, FSErrorCode.EACCES)
                    dsError = newError
                }
            }
        }).finally(() => {
            callback(dsError, cbDestinationFolder);
        })
    },

    filename: function (req: Request, file: Express.Multer.File, callback) {

        let fnError: Error | null = null
        let newFileName: string
        if (file.fieldname) {
            newFileName = file.fieldname //+ path.extname(file.originalname)
        } else {
            newFileName = file.originalname
        }

        console.log("filename: info ", req.body, req.params)
        console.log("file", file)

        let df = Resolver.instance.resolve(req.body.destinationFolder, newFileName)
        if (!df) {
            throw new FileServerError(FSErrorMsg.NO_DESTINATION_FOLDER_SUPPLIED, FSErrorCode.EINVAL)
        }

        let filePath = df.getPathServer()

        console.log("filePath", filePath)
        fs.promises.stat(filePath)
            .then(stat => {
                let errorFileName = new FileServerError(FSErrorMsg.FILE_ALREADY_EXIST, FSErrorCode.EEXIST)
                fnError = errorFileName
            }).catch(error => {
                if (error) {
                    if (error.code == FSErrorCode.ENOENT) {
                        //File doesn't exist and it's OK because we are going to create it
                    } else {
                        fnError = error
                    }
                }
            }).finally(() => {
                callback(fnError, newFileName);
            })
    }
});
const upload = multer({ storage: storage }).any();

fileServer.post(endpoints.UPLOAD, (req: Request, res: Response, next: NextFunction) => {

    upload(req, res, (error) => {
        console.log("Upload File !!!")

        let statusCode = -1
        if (error) {
            next(error)
        } else {
            statusCode = HttpStatusCode.OK

            let response: FileUpload_Response = {
                parent: req.body[uploadFile.DESTINATION_FOLDER],
                error: false,
                message: FSErrorMsg.OK,
                files: []
            }

            if (req.file) {
                let f = req.file
                response.files.push({
                    fileName: f.filename,
                    size: f.size
                })
            } else if (req.files) {
                for (const [id, file] of Object.entries(req.files)) {
                    response.files.push({
                        fileName: file.filename,
                        size: file.size
                    })
                }
            }
            res.status(statusCode).send(response);
        }
    });
});