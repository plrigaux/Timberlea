import express, { NextFunction, Request, Response } from 'express';
import path from 'path'
import { FileDetails, FileListCls, FileType, RemoteDirectory } from './common/interfaces';
import { currentDirectory } from './directory';
import fs, { Dirent, Stats } from 'fs';
import { endpoints } from './common/constants';
import multer, { FileFilterCallback } from 'multer';



export const fileServerUpload = express.Router()
const default_folder = 'files';

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        console.error("Robert")
        console.warn(file)
        let destinationFolder = default_folder
        req.body.destinationFolder = destinationFolder
        callback(null, destinationFolder);
    },

    filename: function (req: Request, file: Express.Multer.File, callback) {
        let fieldName = 'fileName';
        let field = req.body[fieldName]
        let newFileName = field ? field : file.originalname
        console.log("filename: info ", newFileName, req.body, req.params)
        console.log("file", file)
        callback(null, newFileName);

        let filePath = path.join(req.body.destinationFolder, newFileName)
        let exists = fs.existsSync(filePath)

        let uploadedFileName;
        let error: Error | null = null
        if (exists) {
            uploadedFileName = Date.now() + '.' + file.originalname;
            error = new Error(`File "${newFileName}" in directory '${req.body.destinationFolder}' exist!`)
        } else {
            uploadedFileName = file.originalname;
        }
        callback(error, newFileName)
    }
});
const upload = multer({ storage: storage }).any();

/*
fileServerUpload.post("/", upload.any(), (req, res) => {
    console.log(req.params)
    console.log(req.body)
    console.log('[' + new Date().toISOString() + '] - File uploaded:', req.files);
    res.send("OK");
});
*/
fileServerUpload.post("/", (req, res) => {
    upload(req, res, (err) => {
        //console.log(err)
        if (err) {
            res.status(409).send(err.message);
        } else {
            res.send('file uploaded');
        }
    });
});

fileServerUpload.post("/:robert", upload, (req, res) => {
    console.log(req.params)
    console.log(req.body)
    console.log('[' + new Date().toISOString() + '] - File uploaded:', req.files);
    res.end();
});


//fileServerUpload.post("/:path", handlePost)
/*

const imageFilter = function(req :Request, file : Express.Multer.File, cb : FileFilterCallback) : void {
    // Accept images only

    console.error("QQQQQQQQQ#%^#$%^#$%^   " + file)
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        cb(null, false);
    }
    cb(null, true);
};
exports.imageFilter = imageFilter;

fileServerUpload.post('/test', (req, res) => {
    // 'profile_pic' is the name of our file input field in the HTML form
    //let upload = multer({ storage: storage, fileFilter: imageFilter }).single('profile_pic');

    let upload = multer({ storage: storage, fileFilter: imageFilter }).any();
//console.log(req)
    upload(req, res, function(err) {
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any

        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }

        // Display uploaded image for user validation
        res.send(`You have uploaded this image: <hr/><img src="${req.file?.path || "@#$%@#"}" width="500"><hr /><a href="./">Upload another image</a>`);
    });
});
*/

/*
if (!fs.existsSync(default_folder)) {
  fs.mkdirSync(default_folder);
}
*/