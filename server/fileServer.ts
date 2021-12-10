import express, { NextFunction, Request, Response } from 'express';
import path from 'path'
import { FileDetails, FileListCls, FileType, RemoteDirectory } from './common/interfaces';
import { currentDirectory } from './directory';
import fs, { Dirent, Stats } from 'fs';
import { endpoints } from './common/constants';

export const fileServer = express.Router()

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
})

fileServer.get(endpoints.LIST, (req: Request, res: Response) => {


    let folder: string = req.query.dir?.toString() || ""
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
