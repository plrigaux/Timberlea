import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import fs, { Dirent } from 'fs';
import os from 'os';
import path from 'path';
import { endpoints, FSErrorCode, HttpStatusCode } from './common/constants';
import { ChangeDir_Request, ChangeDir_Response, FileDetails, FileDetail_Response, FileList_Response, FileType, FS_Response, MakeDirRequest, MakeDirResponse, MvFile_Request, MvFile_Response, RemFile_Request, RemFile_Response } from './common/interfaces';

export const fileServer = express.Router()
const default_folder = os.tmpdir();

fileServer.get(endpoints.PWD, (req: Request, res: Response) => {


    const notes = '.'

    let dirName = path.dirname(notes) // /users/joe
    let basename = path.basename(notes) // notes.txt
    let extname = path.extname(notes)
    let p = process.cwd()
    console.log(`PWD  basename ${basename} extname ${extname} dirName ${dirName} process.cwd ${p}`)

    let newRemoteDirectory: ChangeDir_Response = {
        parent: default_folder,
        error: false,
        message: 'OK'
    }
    res.send(newRemoteDirectory)
});

interface Bob { statusCode: number; resp: FileList_Response }

function returnList(folder: string): Promise<Bob> {
    console.log(`folder ${folder}`)

    return fs.promises.readdir(folder, { withFileTypes: true })
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

                let prom = fs.promises.stat(path.join(folder, file.name))
                    .then(stats => {
                        if (file.type === FileType.File) {
                            file.size = stats.size
                        }
                        file.mtime = stats.mtime.toISOString()
                        return file
                    }).catch((error) => {
                        console.log(error.code, error.message, file.name)
                    });
                promiseList.push(prom)
            })

            return Promise.all(promiseList).then(_files => {

                let resp: FileList_Response = {
                    parent: folder,
                    files: [],
                    error: false,
                    message: 'Ok'
                }
                _files.forEach((f: void | FileDetails) => {
                    if (f) {
                        resp.files!.push(f)
                    }
                })
                return resp
            }).then(
                resp => {
                    let statusCode = HttpStatusCode.OK
                    return { statusCode, resp }
                }
            )
        }).catch((error) => {
            console.log(error)
            let resp: FileList_Response = {
                parent: folder,
                error: true,
                message: ''
            }
            let statusCode = HttpStatusCode.INTERNAL_SERVER
            switch (error.code) {
                case "ENOENT":
                    resp.message = `Directory doesn't exist`
                    statusCode = HttpStatusCode.NOT_FOUND;
                    break;
                case "EACCES":
                    resp.message = `Directory is not accessible`
                    statusCode = HttpStatusCode.FORBIDDEN
                    break;
                case "ENOTDIR":
                    resp.message = `Not a directory`
                    statusCode = HttpStatusCode.CONFLICT
                    break;
                default:
                    console.error(error);
                    resp.message = `Unknown error`
                    statusCode = HttpStatusCode.INTERNAL_SERVER
            }
            return { statusCode, resp }
        });
}

function getList(req: Request, res: Response) {

    const folder: string = req.params.path || default_folder
    returnList(folder).then((b: Bob) => {
        res.status(b.statusCode).send(b.resp)
    })
}

//List without path
fileServer.get(endpoints.LIST, (req: Request, res: Response) => {
    getList(req, res)
})

fileServer.get(endpoints.LIST + "/:path", (req: Request, res: Response) => {
    getList(req, res)
})

fileServer.get(endpoints.DETAILS + "/:path", (req: Request, res: Response) => {
    const file: string = req.params.path

    fs.promises.stat(file)
        .then(stat => {

            let resp: FileDetail_Response = {
                file: {
                    name: path.basename(file),
                    type: stat.isFile() ? FileType.File : stat.isDirectory() ? FileType.Directory : FileType.Other,
                    size: stat.size,
                    parentDirectory: path.dirname(file),
                    birthtime: stat.birthtime.toISOString()
                },
                error: false,
                message: 'OK'
            }
            let statusCode: number = HttpStatusCode.OK
            return { statusCode, resp }
        })
        .catch((error) => {
            let statusCode = HttpStatusCode.INTERNAL_SERVER

            let resp: FileDetail_Response = {
                error: true,
                message: ''
            }

            switch (error.code) {
                case FSErrorCode.ENOENT:
                    resp.message = `File doesn't exist`
                    statusCode = HttpStatusCode.NOT_FOUND
                    break;
                case FSErrorCode.EACCES:
                    resp.message = `File is not accessible`
                    statusCode = HttpStatusCode.FORBIDDEN
                    break;
                default:
                    console.warn(error)
                    console.error(error);
                    resp.message = `Unknown error`
                    statusCode = HttpStatusCode.INTERNAL_SERVER
            }
            return { statusCode, resp }
        }).then((o: {
            statusCode: number;
            resp: FileDetail_Response;
        }) => {
            res.status(o.statusCode).send(o.resp)
        })
})

function directoryValid(dirpath: string): Promise<Bob> {

    let resp: FileList_Response = {
        parent: dirpath,
        error: true,
        message: ''
    }
    let statusCode = 0

    return fs.promises.stat(dirpath)
        .then(stat => {
            const isDirectory = stat.isDirectory()
            if (isDirectory) {
                resp.error = false
                resp.parent = dirpath
                statusCode = HttpStatusCode.OK
            } else {
                resp.error = true
                resp.parent = dirpath
                resp.message = `File is not a directory`
                statusCode = HttpStatusCode.CONFLICT
            }
            return { statusCode, resp }
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
            return { statusCode, resp }
        })
}

fileServer.put(endpoints.CD,
    body('remoteDirectory').exists().isString(),
    body('newPath').exists().isString(),
    body('returnList').toBoolean()
    , (req: Request, res: Response) => {
        console.log("cdpath: " + req.body)
        console.log("remoteDirectory: " + req.body.remoteDirectory)
        console.log("newPath: " + req.body.newPath)

        let newRemoteDirectory: ChangeDir_Request = req.body

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Bad request", errors.array())

            let resp: FS_Response = {
                error: true,
                message: JSON.stringify(errors.array())
            }
            res.status(HttpStatusCode.BAD_REQUEST).send(resp)
            return
        }

        let newPath = path.join(newRemoteDirectory.remoteDirectory, newRemoteDirectory.newPath)
        newPath = path.resolve(newPath);

        directoryValid(newPath).then((valid: Bob) => {
            if (newRemoteDirectory.returnList && !valid.resp.error) {
                return returnList(newPath)
            } else {
                return valid
            }
        }).then((valid: Bob) => {
            res.status(valid.statusCode).send(valid.resp)
        })
    })

fileServer.get(endpoints.DOWNLOAD + '/:path', (req: Request, res: Response) => {


    let filePath = req.params.path

    console.log(`filePath`, filePath)

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


class FileError extends Error {
    code: string | undefined;
}



fileServer.put(endpoints.MV, (req: Request, res: Response) => {

    const data: MvFile_Request = req.body
    console.log("MV", data)

    const oldPath = path.join(data.parent, data.fileName)

    const newPath = path.join(data.newParent ?? data.parent, data.newFileName ?? data.fileName)

    let resp: MvFile_Response = {
        error: true,
        message: `Unkown error`,
        parent: path.dirname(newPath),
        oldFileName: data.fileName,
        newFileName: path.basename(newPath)
    }
    let statusCode: number = HttpStatusCode.INTERNAL_SERVER

    let fileExistCheck: Promise<boolean>

    if (data.overwrite) {
        fileExistCheck = Promise.resolve(false)
    } else {
        fileExistCheck = fs.promises.access(newPath).then(() => {
            return true
        }).catch(() => {
            return false
        })
    }

    fileExistCheck.then((targetExist) => {
        if (targetExist) {
            let e = new FileError("file already exist ...")
            e.code = FSErrorCode.EEXIST
            throw e
        }
        return fs.promises.rename(oldPath, newPath)
    }).then(() => {
        //console.warn("OK .. ")
        resp.error = false
        resp.message = "OK"
        statusCode = HttpStatusCode.OK
    }).catch((error) => {
        //console.warn(error)
        switch (error.code) {
            case FSErrorCode.ENOENT:
                resp.message = `Directory doesn't exist`
                statusCode = HttpStatusCode.NOT_FOUND
                break;
            case FSErrorCode.EEXIST:
                resp.message = "File already exists"
                statusCode = HttpStatusCode.CONFLICT
                break;
            default:
                console.error(error);
                resp.message = `Unknown error`
                statusCode = HttpStatusCode.INTERNAL_SERVER
        }
    }).finally(() => {
        res.status(statusCode).send(resp);
    })
})

