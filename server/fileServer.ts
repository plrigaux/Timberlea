import express, { NextFunction, Request, Response } from 'express';
import path from 'path'
import { FileDetails,  FileListCls,  FileType } from './common/interfaces';
import { currentDirectory } from './directory';
import fs, { Dirent } from 'fs';

export const fileServer = express.Router()

fileServer.get('/pwd', (req: Request, res: Response) => {


    const notes = '.'

    let dirName = path.dirname(notes) // /users/joe
    let basename = path.basename(notes) // notes.txt
    let extname = path.extname(notes)
    let p = process.cwd()
    console.log(`PWD ${__dirname}`)
    res.set('Content-Type', 'text/plain')

    res.send(`PWD ${dirName} ${basename} ${extname} ${__dirname} ${__filename} ${p}`)
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
    
    console.log(req.body )
    console.log("cdpath: " + req.body )
    
    res.setHeader('Content-Type', 'text/plain')
    res.send("OK45")
})
