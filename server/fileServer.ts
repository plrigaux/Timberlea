import express, { NextFunction, Request, Response } from 'express';
import path from 'path'
import { FileDetails, FileListCls, FileType, RemoteDirectory } from './common/interfaces';
import { currentDirectory } from './directory';
import fs, { Dirent, Stats } from 'fs';

export const fileServer = express.Router()

fileServer.get('/pwd', (req: Request, res: Response) => {


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

fileServer.get('/list', (req: Request, res: Response) => {

    let folder = currentDirectory

    console.log(`folder ${folder}`)

    const fileList = new FileListCls(folder)

    fs.readdir(folder, { withFileTypes: true }, (err, files: Dirent[]) => {
        files.forEach(file => {


            let fi: FileDetails = {
                name: file.name,
                type: file.isFile() ? FileType.File : file.isDirectory() ? FileType.Directory : FileType.Other,
            }

            if (file.isFile()) {
                const stats = fs.statSync(file.name);
                fi.size = stats.size
            }

            console.log(`file ${file}`)
            fileList.files.push(fi)
        });
        res.send(fileList)
    });
})

fileServer.put('/cd', (req: Request, res: Response) => {

    console.log(req.body)
    console.log("cdpath: " + req.body)
    console.log("remoteDirectory: " + req.body.remoteDirectory)
    console.log("newPath: " + req.body.newPath)

    let newRemoteDirectory: RemoteDirectory = req.body

    const statsRoot: Stats = fs.lstatSync(newRemoteDirectory.remoteDirectory)

    console.log(statsRoot.isDirectory())

    const newPath = path.join(newRemoteDirectory.remoteDirectory, newRemoteDirectory.newPath)
    try {
        const statsNew: Stats = fs.lstatSync(newPath)
        console.log(statsNew.isDirectory())
    } catch (error) {
        console.error(error)
        console.log("-------------------------------------")
        console.log(typeof error)
        //console.log(error['message'])
        //console.log(error['code'])
        if (error instanceof Error) {
            let message = error.message
            console.log(`Name: ${error.name} Msg ${message}`);
            console.log(`Name: ${error.name} Msg ${message}`);
        }
    }


    newRemoteDirectory.remoteDirectory = newPath;

    res.send(newRemoteDirectory)
})
