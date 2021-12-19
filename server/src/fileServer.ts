import express, { Request, Response } from 'express';
import path from 'path'
import { FileDetails, FileListCls, FileType, MakeDirRequest, MakeDirResponse, ChangeDir_Request, RemFile_Request, RemFile_Response, MvFile_Request, MvFile_Response, ChangeDir_Response } from './common/interfaces';
import fs, { Dirent, Stats } from 'fs';
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

    let newRemoteDirectory: ChangeDir_Request = {
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
                        }).catch(e => {
                            //EPERM: operation not permitted, stat 'C:\DumpStack.log'
                            if (e instanceof Error) {
                                //let nodeError = e as NodeJS.ErrnoException
                                console.log(e.message)
                            } else {
                                console.log(":(")
                            }
                        });
                    promiseList.push(prom)
                } else {
                    promiseList.push(file)
                }
            })

            Promise.all(promiseList).then(_files => {
                const fileList = new FileListCls(folder)
                _files.forEach((f: void | FileDetails) => {
                    if (f) {
                        fileList.files.push(f)
                    }
                })
                return fileList
            }).then(
                fileList => res.send(fileList)
            )
        })
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
    console.log("cdpath: " + req.body)
    console.log("remoteDirectory: " + req.body.remoteDirectory)
    console.log("newPath: " + req.body.newPath)

    let newRemoteDirectory: ChangeDir_Request = req.body

    let newPath = path.join(newRemoteDirectory.remoteDirectory, newRemoteDirectory.newPath)
    newPath = path.resolve(newPath);

    let resp: ChangeDir_Response = {
        directory: newPath,
        error: true,
        message: ''
    }

    let notSent = true
    const send = (code: number) => {
        if (notSent) {
            res.status(code).send(resp);
            notSent = false
        }
    }

    fs.promises.stat(newPath)
        .then(stat => {
            if (!stat.isDirectory()) {
                resp.message = `File is not a directory`
                send(409)
            } else {
                return fs.promises.access(newPath, fs.constants.R_OK)
            }
        }).then(() => {
            resp.error = false
            resp.directory = newPath
            send(200)
        }).catch((error) => {
            switch (error.code) {
                case "ENOENT":
                    resp.message = `Directory doesn't exist`
                    send(404);
                    break;
                case "EACCES ":
                    resp.message = `Directory is not accessible`
                    send(403);
                    break;
                default:
                    console.error(error);
                    resp.message = `Unknown error`
                    send(500);
            }

        });
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
            parent: path.dirname(filePath),
            file: path.basename(filePath)
        }
        res.status(500).send(responseData);
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
    let statuCode: number = 500

    const send = () => {
        res.status(statuCode).send(responseData);
    }

    fs.access(newPath, function (error) {
        if (!error) {
            statuCode = 409
            responseData.message = "New file exists"
            send()
        } else {
            fs.rename(oldPath, newPath, (error) => {
                if (error) {
                    // Show the error 
                    console.error(error);
                    if (error.code == "ENOENT") {
                        statuCode = 404
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