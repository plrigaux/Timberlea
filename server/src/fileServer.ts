import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import fs, { Dirent } from 'fs';
import path from 'path';
import { endpoints, FSErrorCode, HttpStatusCode } from './common/constants';
import { ChangeDir_Request, ChangeDir_Response, FileDetails, FileDetail_Response, FileList_Response, FileType, FS_Response } from './common/interfaces';
import { HOME, HOME_ResolverPath, Resolver, ResolverPath } from './filePathResolver';

export const fileServer = express.Router()

fileServer.get(endpoints.PWD, (req: Request, res: Response) => {
    const notes = '.'

    let dirName = path.dirname(notes) // /users/joe
    let basename = path.basename(notes) // notes.txt
    let extname = path.extname(notes)
    let p = process.cwd()
    console.log(`PWD  basename ${basename} extname ${extname} dirName ${dirName} process.cwd ${p}`)

    let newRemoteDirectory: ChangeDir_Response = {
        parent: HOME,
        error: false,
        message: 'OK'
    }
    res.send(newRemoteDirectory)
});

interface Bob { statusCode: number; resp: FileList_Response }

function returnList(folder: ResolverPath | null): Promise<Bob> {
    console.log(`folder ${folder}`)

    if (!folder) {
        let resp: FileList_Response = {
            parent: "",
            error: true,
            message: "NOT found"
        }

        let statusCode = HttpStatusCode.NOT_FOUND

        let ret: Promise<Bob> = new Promise((resolve, reject) => {
            resolve({ statusCode, resp })
        });

        return ret;
    } else if (folder == HOME_ResolverPath) {
        let resp: FileList_Response = {
            parent: "",
            error: false,
            message: "HOME",
            files: [],
        }

        Resolver.instance.root().forEach((key: string) => {

            let fd: FileDetails = {
                name: key,
                type: FileType.Directory
            }
            resp.files?.push(fd)
        })

        let statusCode = HttpStatusCode.OK

        let ret: Promise<Bob> = new Promise((resolve, reject) => {
            resolve({ statusCode, resp })
        });

        return ret;
    }

    return fs.promises.readdir(folder.getFullPath(), { withFileTypes: true })
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

                let prom = fs.promises.stat(path.join(folder.getFullPath(), file.name))
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
                    parent: folder.getFullPath(),
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
                parent: folder.getFullPath(),
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
    let paramPath = req.params.path
    let folder: ResolverPath | null = Resolver.instance.resolve(paramPath)
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

    let resp: FileDetail_Response = {
        error: true,
        message: ''
    }

    let statusCode = -1
    fs.promises.stat(file)
        .then(stat => {
            resp = {
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
            statusCode = HttpStatusCode.OK
        })
        .catch((error) => {
            let statusCode = HttpStatusCode.INTERNAL_SERVER

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
                    resp.message = error.message
                    statusCode = HttpStatusCode.INTERNAL_SERVER
            }

        }).finally(() => {
            res.status(statusCode).send(resp)
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
                let rp = Resolver.instance.resolve(newPath)
                return returnList(rp)
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

