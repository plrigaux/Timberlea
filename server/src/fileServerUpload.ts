import express, { Request } from 'express';
import path from 'path'
import fs from 'fs';
import multer from 'multer';
import { FileUpload_Response } from './common/interfaces';
import { fileServerErrors, FSErrorCode, HttpStatusCode, uploadFile } from './common/constants';

export const fileServerUpload = express.Router()

const storage = multer.diskStorage({
    destination: function (req, file, callback) {


        let dsError: Error | null = null
        let cbDestinationFolder = ""

        new Promise<string>((resolve, reject) => {
            let destinationFolder = req.body[uploadFile.DESTINATION_FOLDER]
            if (!destinationFolder) {
                let newError = new Error(`No destination Folder`)
                newError.name = fileServerErrors.NO_DESTINATION_FOLDER_SUPPLIED
                reject(newError)
            } else {
                resolve(destinationFolder)
            }
        }).then((destinationFolder: string) => {
            cbDestinationFolder = destinationFolder
            return fs.promises.stat(destinationFolder)
        }).then(stat => {
            if (!stat.isDirectory()) {
                let newError = new Error(`Not a directory`)
                newError.name = fileServerErrors.DESTINATION_FOLDER_NOT_DIRECTORY
                dsError = newError
            } else {
                return fs.promises.access(cbDestinationFolder, fs.constants.R_OK | fs.constants.W_OK);
            }
        }).catch(error => {
            dsError = error
            if (error) {
                if (error.code == FSErrorCode.ENOENT) {
                    let newError = new Error(`Directory doesn't exist`)
                    newError.name = fileServerErrors.DESTINATION_FOLDER_DOESNT_EXIST
                    dsError = newError
                } else if (error.code == FSErrorCode.EACCES) {
                    let newError = new Error(`Directory is not accessible`)
                    newError.name = fileServerErrors.DESTINATION_FOLDER_NOT_ACCESSIBLE
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
            newFileName = file.fieldname + path.extname(file.originalname)
        } else {
            newFileName = file.originalname
        }

        console.log("filename: info ", newFileName, req.body, req.params)
        console.log("file", file)
        let filePath = path.join(req.body.destinationFolder, newFileName)

        fs.promises.stat(filePath)
            .then(stat => {
                let errorFileName = new Error(`File "${newFileName}" in directory '${req.body.destinationFolder}' exist!`)
                errorFileName.name = fileServerErrors.FILE_ALREADY_EXIST
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

fileServerUpload.post("/", (req, res) => {
    upload(req, res, (err) => {
        //console.log(err)

        let response: FileUpload_Response = {
            parent: req.body[uploadFile.DESTINATION_FOLDER],
            error: false,
            message: ''
        }

        let code = -1
        if (err) {
            response.error = true
            //TODO test if can write a file
            switch (err.name) {

                case fileServerErrors.NO_DESTINATION_FOLDER_SUPPLIED:
                    response.message = fileServerErrors.NO_DESTINATION_FOLDER_SUPPLIED
                    code = HttpStatusCode.NOT_FOUND
                    break;

                case fileServerErrors.FILE_ALREADY_EXIST:
                    response.message = err.name
                    code = HttpStatusCode.CONFLICT
                    break;

                case fileServerErrors.DESTINATION_FOLDER_DOESNT_EXIST:
                    response.message = err.name
                    code = HttpStatusCode.NOT_FOUND
                    break;

                case fileServerErrors.DESTINATION_FOLDER_NOT_DIRECTORY:
                    response.message = err.name
                    code = HttpStatusCode.CONFLICT
                    break;
                case fileServerErrors.DESTINATION_FOLDER_NOT_ACCESSIBLE:
                    response.message = err.name
                    code = HttpStatusCode.FORBIDDEN
                    break;
                default:
                    code = HttpStatusCode.INTERNAL_SERVER
            }
        } else {
            code = HttpStatusCode.OK
            response.message = "OK"
        }
        res.status(code).send(response);
    });
});

fileServerUpload.post("/:robert", upload, (req, res) => {
    console.log(req.params)
    console.log(req.body)
    console.log('[' + new Date().toISOString() + '] - File uploaded:', req.files);
    res.end();
});