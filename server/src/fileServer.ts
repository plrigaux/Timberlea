import express, { NextFunction, Request, Response } from 'express';
import fs, { Dirent } from 'fs';
import path from 'path';
import { endpoints, FSErrorMsg, HttpStatusCode } from './common/constants';
import { ChangeDir_Response, FileDetails, FileList_Response, FileType } from './common/interfaces';
import { HOME, HOME_ResolverPath, resolver, ResolverPath } from './filePathResolver';

export const fileServer = express.Router()

export async function isEntityExists(path: string): Promise<boolean> {
    let targetExist: boolean
    try {
        await fs.promises.access(path)
        targetExist = true
    } catch (err) {
        targetExist = false
    }
    return targetExist
}

fileServer.get(endpoints.PWD, (req: Request, res: Response) => {
    const notes = '.'

    let dirName = path.dirname(notes) // /users/joe
    let basename = path.basename(notes) // notes.txt
    let extname = path.extname(notes)
    let p = process.cwd()
    console.log(`PWD  basename ${basename} extname ${extname} dirName ${dirName} process.cwd ${p}`)

    let newRemoteDirectory: ChangeDir_Response = {
        parent: HOME,
        message: 'OK'
    }
    res.send(newRemoteDirectory)
});

export async function returnList(folder: ResolverPath): Promise<FileList_Response> {
    console.log(`folder ${folder}`)

    if (folder == HOME_ResolverPath) {
        let resp: FileList_Response = {
            parent: HOME_ResolverPath.network,
            message: FSErrorMsg.OK,
            files: [],
        }

        resolver.root().forEach((key: string) => {

            let fd: FileDetails = {
                name: key,
                type: FileType.Directory
            }
            resp.files?.push(fd)
        })

        return resp;
    }

    let files: Dirent[] = await fs.promises.readdir(folder.server, { withFileTypes: true })

    let fileDetails = files.map((file: Dirent) => {
        let fd: FileDetails = {
            name: file.name,
            type: file.isFile() ? FileType.File : file.isDirectory() ? FileType.Directory : FileType.Other,
        }
        return fd
    })

    let resp: FileList_Response = {
        parent: folder.network,
        files: [],
        message: FSErrorMsg.OK
    }

    let promiseList: (Promise<void>)[] = []
    fileDetails.forEach((file: FileDetails) => {
        let prom = fs.promises.stat(path.join(folder.server, file.name))
            .then(stats => {
                if (file.type === FileType.File) {
                    file.size = stats.size
                }
                file.mtime = stats.mtime.toISOString()

                resp.files!.push(file)
            }).catch((error) => {
                console.log(error.code, error.message, file.name)
            });
            
        promiseList.push(prom)
    })

    await Promise.all(promiseList)

    return resp
}

async function getList(req: Request, res: Response, next: NextFunction) {
    try {
        let paramPath = req.params.path
        let folder: ResolverPath = resolver.resolve(paramPath)
        let resp = await returnList(folder)
        res.status(HttpStatusCode.OK).send(resp)
    }
    catch (err) {
        next(err)
    }
}

//List without path
fileServer.get(endpoints.LIST, (req: Request, res: Response, next: NextFunction) => {
    getList(req, res, next)
})

fileServer.get(endpoints.LIST + "/:path", (req: Request, res: Response, next: NextFunction) => {
    getList(req, res, next)
})
