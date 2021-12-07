import express, { NextFunction, Request, Response } from 'express';
import path from 'path'
import { FileInfo, FileType } from './structures';
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
    let fileInfos: FileInfo[] = []
    fs.readdir(folder, { withFileTypes: true }, (err, files: Dirent[]) => {
        files.forEach(file => {


            let fi: FileInfo = {
                name: file.name,
                type: file.isFile() ? FileType.File : file.isDirectory() ? FileType.Directory : FileType.Other,
            }

            if (file.isFile()) {
                const stats = fs.statSync(file.name);
                fi.size = stats.size
            }

            console.log(`file ${file}`)
            fileInfos.push(fi)
        });
        res.send(fileInfos)
    });
})

fileServer.put('/cd', (req: Request, res: Response) => {
    
    console.log(req.body )
    console.log("cdpath: " + req.body )
    
    res.setHeader('Content-Type', 'text/plain')
    res.send("OK45")
})
