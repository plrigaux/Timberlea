import express, { Request } from 'express';
import path from 'path'
import fs from 'fs';
import multer, { FileFilterCallback } from 'multer';
import { FileUpload_Response } from './common/interfaces';
import { fileServerErrors, HttpStatusCode, uploadFile } from './common/constants';

export const fileServerUpload = express.Router()
const default_folder = 'files';

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        let destinationFolder = req.body[uploadFile.DESTINATION_FOLDER]
        //req.body.destinationFolder = destinationFolder

        let error = null

        if (!destinationFolder) {
            error = new Error(`No destination Folder`)
            error.name = fileServerErrors.NO_DESTINATION_FOLDER
        }

        req.body[uploadFile.DESTINATION_FOLDER] = destinationFolder
        callback(error, destinationFolder);
    },

    filename: function (req: Request, file: Express.Multer.File, callback) {
    
        let field = file.fieldname + '-' + Date.now() +  path.extname(file.originalname)

        let newFileName! : string
        if (file.fieldname) {
            newFileName = file.fieldname +  path.extname(file.originalname)
        } else {
            newFileName = file.originalname
        }

        console.log("filename: info ", newFileName, req.body, req.params)
        console.log("file", file)
        //callback(null, newFileName);

        let filePath = path.join(req.body.destinationFolder, newFileName)
        let exists = fs.existsSync(filePath)

        //let uploadedFileName;
        let error: Error | null = null
        if (exists) {
            //uploadedFileName = Date.now() + '.' + file.originalname;
            error = new Error(`File "${newFileName}" in directory '${req.body.destinationFolder}' exist!`)
            error.name = fileServerErrors.FILE_ALREADY_EXIST
        } else {
            //uploadedFileName = file.originalname;
        }
        callback(error, newFileName)
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
            switch (err.name) {

                case fileServerErrors.NO_DESTINATION_FOLDER:
                    response.message = fileServerErrors.NO_DESTINATION_FOLDER
                    code = HttpStatusCode.NOT_FOUND
                    break;

                case fileServerErrors.FILE_ALREADY_EXIST:
                    response.message = fileServerErrors.FILE_ALREADY_EXIST
                    code = HttpStatusCode.CONFLICT
                    break;
            }


            res.status(code).send(response);
        } else {
            code = HttpStatusCode.OK
            response.message = "OK"
            res.status(code).send(response);
        }
    });
});

fileServerUpload.post("/:robert", upload, (req, res) => {
    console.log(req.params)
    console.log(req.body)
    console.log('[' + new Date().toISOString() + '] - File uploaded:', req.files);
    res.end();
});