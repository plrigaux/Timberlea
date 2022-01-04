import express, { Request, Response } from 'express';
import fs, { Dirent } from 'fs';
import path from 'path';
import { endpoints, FSErrorCode, HttpStatusCode } from './common/constants';
import { ChangeDir_Request, ChangeDir_Response, FileDetails, FileList_Response, FileType, MakeDirRequest, MakeDirResponse, MvFile_Request, MvFile_Response, RemFile_Request, RemFile_Response } from './common/interfaces';



export const fileServer = express.Router()
const default_folder = 'files';


fileServer.get(endpoints.PWD, (req: Request, res: Response) => {


    const notes = '.'

    let dirName = path.dirname(notes) // /users/joe
    let basename = path.basename(notes) // notes.txt
    let extname = path.extname(notes)
    let p = process.cwd()
    console.log(`PWD __dirname ${__dirname} basename ${basename} extname ${extname} dirName ${dirName} process.cwd ${p}`)

    let newRemoteDirectory: ChangeDir_Response = {
        directory: __dirname,
        error: false,
        message: 'OK'
    }
    res.send(newRemoteDirectory)
});

function getList(req: Request, res: Response) {

    const folder: string = req.params.path || __dirname

    console.log(`folder ${folder}`)

    fs.promises.readdir(folder, { withFileTypes: true })
        .then((files: Dirent[]) => {
            return files.map((file: Dirent) => {
                let fd: FileDetails = {
                    name: file.name,
                    type: file.isFile() ? FileType.File : file.isDirectory() ? FileType.Directory : FileType.Other,
                }
                return fd
            })
        })
        .then(fileDetails => {
            let promiseList: (Promise<void | FileDetails> | FileDetails)[] = []
            fileDetails.forEach((file: FileDetails) => {
                if (file.type === FileType.File) {
                    let prom = fs.promises.stat(path.join(folder, file.name))
                        .then(stats => {
                            file.size = stats.size
                            return file
                        }).catch((error) => {
                            console.log(error.code, error.message, file.name)
                        });
                    promiseList.push(prom)
                } else {
                    promiseList.push(file)
                }
            })

            Promise.all(promiseList).then(_files => {

                let resp: FileList_Response = {
                    parent: folder,
                    files: [],
                    error: false,
                    message: 'Ok'
                }
                _files.forEach((f: void | FileDetails) => {
                    if (f) {
                        resp.files.push(f)
                    }
                })
                return resp
            }).then(
                resp => res.send(resp)
            )
        }).catch((error) => {
            console.log(error)
            let resp: FileList_Response = {
                parent: folder,
                files: [],
                error: true,
                message: ''
            }
            let code = HttpStatusCode.INTERNAL_SERVER
            switch (error.code) {
                case "ENOENT":
                    resp.message = `Directory doesn't exist`
                    code = HttpStatusCode.NOT_FOUND;
                    break;
                case "EACCES":
                    resp.message = `Directory is not accessible`
                    code = HttpStatusCode.FORBIDDEN
                    break;
                default:
                    console.error(error);
                    resp.message = `Unknown error`
                    code = HttpStatusCode.INTERNAL_SERVER
            }
            res.status(code).send(resp)

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


function directoryValid(dirpath: string, res: Response) {

    let resp: ChangeDir_Response = {
        directory: dirpath,
        error: true,
        message: ''
    }
    let statusCode = 0
    let isDirectory = true

    fs.promises.stat(dirpath)
        .then(stat => {
            isDirectory = stat.isDirectory()
            if (isDirectory) {
                return fs.promises.access(dirpath, fs.constants.R_OK)
            }
        }).then(() => {
            if (isDirectory) {
                resp.error = false
                resp.directory = dirpath
                statusCode = HttpStatusCode.OK
            } else {
                resp.error = true
                resp.directory = dirpath
                resp.message = `File is not a directory`
                statusCode = HttpStatusCode.CONFLICT
            }
        }).catch((error) => {
            switch (error.code) {
                case FSErrorCode.ENOENT:
                    resp.message = `Directory doesn't exist`
                    statusCode = HttpStatusCode.NOT_FOUND
                    break;
                case FSErrorCode.EACCES:
                    resp.message = `Directory is not accessible`
                    statusCode = HttpStatusCode.FORBIDDEN
                    break;
                default:
                    console.error(error);
                    resp.message = `Unknown error`
                    statusCode = HttpStatusCode.INTERNAL_SERVER
            }
        }).finally(() =>{
            res.status(statusCode).send(resp);
        });
}

fileServer.put(endpoints.CD, (req: Request, res: Response) => {
    console.log("cdpath: " + req.body)
    console.log("remoteDirectory: " + req.body.remoteDirectory)
    console.log("newPath: " + req.body.newPath)

    let newRemoteDirectory: ChangeDir_Request = req.body

    let newPath = path.join(newRemoteDirectory.remoteDirectory, newRemoteDirectory.newPath)
    newPath = path.resolve(newPath);

    directoryValid(newPath, res)

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

    let responseData: MakeDirResponse = {
        error: false,
        message: '',
        directory: dirPath
    }

    let code = -1
    let notSent = true
    const send = () => {
        if (notSent) {
            res.status(code).send(responseData);
            notSent = false
        }
    }

    fs.promises.stat(dirPath)
        .then(stat => {
            if (stat.isDirectory()) {
                code = HttpStatusCode.OK
                responseData.message = `Directory already exist`;
                send()
            } else {
                code = HttpStatusCode.CONFLICT
                responseData.error = true
                responseData.message = `File already exist`
                send()
            }
        }).catch(error => {
            if (error.code == FSErrorCode.ENOENT) {
                let options = { recursive: data.recursive ? true : false }

                console.log("Mkdir options", options)
                return fs.promises.mkdir(dirPath, options)
                    .then(() => {
                        code = HttpStatusCode.CREATED
                        responseData.error = false
                        responseData.message = `Directory Created : ${dirPath}`
                        send()
                    })
                    .catch(error => {
                        code = HttpStatusCode.INTERNAL_SERVER
                        responseData.error = true
                        responseData.message = JSON.stringify(error)
                        send()
                    })
            }
        })
})

fileServer.delete(endpoints.REM, (req: Request, res: Response) => {

    const data: RemFile_Request = req.body
    console.log("Delete", data)

    let filePath = path.join(data.parent, data.fileName)

    let options: fs.RmOptions = {
        force: data.force === true ? true : false,
        recursive: data.recursive === true ? true : false
    }

    if (!options.force && !fs.existsSync(filePath)) {
        let responseData: RemFile_Response = {
            error: false,
            message: `File doesn't exists`,
            parent: path.dirname(filePath),
            file: path.basename(filePath)
        }

        res.status(HttpStatusCode.NOT_FOUND).send(responseData);
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
            parent: path.dirname(filePath),
            file: path.basename(filePath)
        }
        res.status(HttpStatusCode.INTERNAL_SERVER).send(responseData);
    }
})

fileServer.put(endpoints.MV, (req: Request, res: Response) => {

    const data: MvFile_Request = req.body
    console.log("MV", data)

    const oldPath = path.join(data.parent, data.oldFileName)
    const newPath = path.join(data.parent, data.newFileName)

    let responseData: MvFile_Response = {
        error: true,
        message: `Unkown error`,
        parent: path.dirname(newPath),
        oldFileName: data.oldFileName,
        newFileName: path.basename(newPath)
    }
    let statuCode: number = HttpStatusCode.INTERNAL_SERVER

    const send = () => {
        res.status(statuCode).send(responseData);
    }

    fs.access(newPath, function (error) {
        if (!error) {
            statuCode = HttpStatusCode.CONFLICT
            responseData.message = "New file exists"
            send()
        } else {
            fs.rename(oldPath, newPath, (error) => {
                if (error) {
                    // Show the error 
                    console.error(error);
                    if (error.code == FSErrorCode.ENOENT) {
                        statuCode = HttpStatusCode.NOT_FOUND
                        responseData.message = `File not found`
                    }
                }
                else {
                    responseData.error = false
                    // List all the filenames after renaming
                    console.log("\nFile Renamed\n");
                    statuCode = 200
                    responseData.message = `File moved succesfully`
                }
                send()
            });
        }
    });
})

if (!fs.existsSync(default_folder)) {
    fs.mkdirSync(default_folder);
}