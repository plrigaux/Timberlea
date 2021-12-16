import express, { NextFunction, Request, Response } from 'express';
import path from 'path'
import { FileDetails, FileListCls, FileType, MakeDirRequest, MakeDirResponse, RemoteDirectory, RemFile_Request, RemFile_Response } from './common/interfaces';
import fs, { Dirent } from 'fs';
import { endpoints } from './common/constants';


export const fileServer = express.Router()
const default_folder = 'files';


fileServer.get(endpoints.PWD, (req: Request, res: Response) => {


    const notes = '.'

    let dirName = path.dirname(notes) // /users/joe
    let basename = path.basename(notes) // notes.txt
    let extname = path.extname(notes)
    let p = process.cwd()
    console.log(`PWD __dirname ${__dirname} basename ${basename} extname ${extname} dirName ${dirName} process.cwd ${p}`)

    let newRemoteDirectory: RemoteDirectory = {
        remoteDirectory: __dirname,
        newPath: ""
    }
    res.send(newRemoteDirectory)
});

function getList(req: Request, res: Response) {

    let folder: string = req.params.path || ""
    if (!folder) {
        folder = __dirname
    }

    const fileList = new FileListCls(folder)

    console.log(`folder ${folder}`)

    fs.readdir(folder, { withFileTypes: true }, (err, files: Dirent[]) => {
        files.forEach((file: Dirent) => {
            let fi: FileDetails = {
                name: file.name,
                type: file.isFile() ? FileType.File : file.isDirectory() ? FileType.Directory : FileType.Other,
            }

            let toAdd = true
            if (file.isFile()) {
                try {
                    const stats = fs.statSync(path.join(folder, file.name));
                    fi.size = stats.size
                } catch (e) {
                    //EPERM: operation not permitted, stat 'C:\DumpStack.log'
                    if (e instanceof Error) {
                        //let nodeError = e as NodeJS.ErrnoException
                        console.log(e.message)
                    } else {
                        console.log(":(")
                    }
                    toAdd = false
                }
            }
            //console.log(`file ${file}`, file)
            if (toAdd) {
                fileList.files.push(fi)
            }
        });
        res.send(fileList)
    });
}

//List without path
fileServer.get(endpoints.LIST, (req: Request, res: Response) => {
    getList(req, res)
})

//List without path
fileServer.get(endpoints.LIST + "/:path", (req: Request, res: Response) => {
    getList(req, res)
})

fileServer.put(endpoints.CD, (req: Request, res: Response) => {

    console.log(req.body)
    console.log("cdpath: " + req.body)
    console.log("remoteDirectory: " + req.body.remoteDirectory)
    console.log("newPath: " + req.body.newPath)

    let newRemoteDirectory: RemoteDirectory = req.body

    //const statsRoot: Stats = fs.lstatSync(newRemoteDirectory.remoteDirectory)

    //console.log(statsRoot.isDirectory())

    let newPath = path.join(newRemoteDirectory.remoteDirectory, newRemoteDirectory.newPath)
    newPath = path.resolve(newPath);

    if (!fs.existsSync(newPath)) {
        //file does't exist
        res.status(404).send(`Directory \"${newPath}\" doesn't exist`);
    } else {
        if (!fs.lstatSync(newPath).isDirectory()) {
            //file not directory
            res.status(404).send(`File \"${newPath}\" is not a directory`);
        } else {
            try {
                fs.accessSync(newPath, fs.constants.R_OK);
                newRemoteDirectory.remoteDirectory = newPath
                res.send(newRemoteDirectory)
            }
            catch (err) {
                res.status(403).send(`Dirrectory \"${newPath}\" is not accessible`);
            }
        }
    }
})

fileServer.get(endpoints.DOWNLOAD + '/:path/:file', (req: Request, res: Response) => {
    /*
        let folder: string = req.query.dir?.toString() || ""
        if (!folder) {
            folder = __dirname
        }
        const fileList = new FileListCls(folder)
    
        console.log(`folder ${folder}`)
    */
    let fileDir = req.params.path
    let fileName = req.params.file

    let filePath = path.join(fileDir, fileName)

    console.log(`fp: ${fileDir} ${fileName}`)

    res.download(filePath);
    //res.send("OK: " + fileDir + " " + fileName)
})

fileServer.post(endpoints.MKDIR, (req: Request, res: Response) => {

    const data: MakeDirRequest = req.body
    console.log("Mkdir", data)
    let dirPath = path.join(data.parent, data.dirName)

    if (fs.existsSync(dirPath)) {
        let code = -1
        let responseData!: MakeDirResponse
        code = 200
        if (fs.lstatSync(dirPath).isDirectory()) {
            responseData = {
                error: false,
                message: `Directory already exist`,
                directory: dirPath
            }
        } else {
            code = 409
            responseData = {
                error: true,
                message: `File already exist`,
                directory: dirPath
            }
        }

        res.status(code).send(responseData);
        return;
    }

    let options = { recursive: data.recursive ? true : false }

    console.log("Mkdir options", options)
    try {
        fs.mkdirSync(dirPath, options);

        let responseData: MakeDirResponse = {
            error: false,
            message: `Directory Created : ${dirPath}`,
            directory: dirPath
        }
        res.status(201).send(responseData);
    } catch (e) {
        console.error(e)

        let responseData: MakeDirResponse = {
            error: true,
            message: JSON.stringify(e),
            directory: dirPath
        }
        res.status(500).send(responseData);
    }
})

fileServer.delete(endpoints.REM, (req: Request, res: Response) => {

    const data: RemFile_Request = req.body
    console.log("Delete", data)


    let filePath = path.join(data.parent, data.fileName)

    

    let options : fs.RmOptions = {
        force : data.force === true ? true : false,
        recursive : data.recursive === true ? true : false
    }

    if (!options.force && !fs.existsSync(filePath)) {
        let responseData: RemFile_Response = {
            error: false,
            message: `File doesn't exists`,
            parent: path.dirname(filePath),
            file: path.basename(filePath)
        }

        res.status(404).send(responseData);
        return;
    }

    try {
        let isDir = fs.lstatSync(filePath).isDirectory()
        fs.rmSync(filePath, options)
        let responseData: RemFile_Response = {
            error: false,
            message: isDir ? "Directory deleted" : "File deleted",
            parent: path.dirname(filePath),
            file: path.basename(filePath)
        }
        res.status(200).send(responseData);
    } catch (e) {
        console.error(e)

        let responseData: RemFile_Response = {
            error: true,
            message: JSON.stringify(e),
            parent: path.basename(filePath),
            file: path.basename(filePath)
        }
        res.status(500).send(responseData);
    }
})

if (!fs.existsSync(default_folder)) {
    fs.mkdirSync(default_folder);
}