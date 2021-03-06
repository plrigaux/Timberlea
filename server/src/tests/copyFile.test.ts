import fs, { RmOptions } from 'fs'
import fse from 'fs-extra'
import os from 'os'
import path from 'path'
import request from 'supertest'
import { app } from '../app'
import { endpoints, HttpStatusCode } from '../common/constants'
import { FS_Response, MvFile_Request, MvFile_Response } from '../common/interfaces'
import { resolver, ResolverPath } from '../filePathResolver'
import { testUtils as tu } from './testUtils'

const testDirMain = "fileServer"
const testDir = "copy file dir"
//const dir = path.join(os.tmpdir(), testDirMain, testDir)
const directoryRes = resolver.resolve(tu.TEMP, testDirMain, testDir) as ResolverPath

beforeAll(() => {
    let dir = directoryRes.server
    console.log(dir);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

afterAll(() => {
    let dir = path.join(os.tmpdir(), testDirMain, testDir)

    try {
        const options: RmOptions = { recursive: true, force: true }
        fs.rmSync(dir, options)
        console.log(`${dir} is deleted!`);
    } catch (err) {
        console.error(`Error while deleting ${dir}.`, err);
    }
});

describe('Copy file', () => {

    test('Copy a single file', async () => {

        let oldFileName = "poutpout.txt"
        let newFileName = 'robert.txt'
        tu.createFile(oldFileName, directoryRes.server, "File data, file data file data")

        const data: MvFile_Request = {
            parent: directoryRes.network,
            fileName: oldFileName,
            newFileName: newFileName
        }

        const resp = await request(app)
            .put(endpoints.FS_COPY)
            .send(data)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

        expect(dataresp.newFileName).toEqual(newFileName)
        expect(dataresp.parent).toEqual(directoryRes.network)
        //expect(dataresp.message).toMatch(/^File/)
    });

    test('Copy a single file in another dir', async () => {

        let oldFileName = "poutpoutttt.txt"

        tu.createFile(oldFileName, directoryRes.server, "File data, file data file data")

        let dirPath = directoryRes.add("outDir")
        fs.mkdirSync(dirPath.server);

        const data: MvFile_Request = {
            parent: directoryRes.network,
            fileName: oldFileName,
            newParent: dirPath.network
        }

        const resp = await request(app)
            .put(endpoints.FS_COPY)
            .send(data)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

        expect(dataresp.newFileName).toEqual(oldFileName)
        expect(dataresp.parent).toEqual(dirPath.network)
        //expect(dataresp.message).toMatch(/^File/)
    });

    test('Copy2 a single file - Not found', async () => {

        let oldFileName = "poutpout2.txt"
        let newFileName = 'robert2.txt'
        //tu.createFile(oldFileName, dir, "File data, file data file data")

        const data: MvFile_Request = {
            parent: directoryRes.network,
            fileName: oldFileName,
            newFileName: newFileName
        }

        const resp = await request(app)
            .put(endpoints.FS_COPY)
            .send(data)
            .expect(HttpStatusCode.NOT_FOUND)
            .expect("Content-Type", /json/);

        let dataresp: FS_Response = resp.body
        console.log(dataresp)

    });

    test('Copy a single file - target exist', async () => {

        let oldFileName = "poutpout3.txt"
        let newFileName = 'robert4.txt'

        tu.createFile(oldFileName, directoryRes.server, "File data, file data file data")
        tu.createFile(newFileName, directoryRes.server, "File data, file data file data")

        const data: MvFile_Request = {
            parent: directoryRes.network,
            fileName: oldFileName,
            newFileName: newFileName
        }

        const resp = await request(app)
            .put(endpoints.FS_COPY)
            .send(data)
            .expect(HttpStatusCode.CONFLICT)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

    });

    test('Copy a single file - target exist - overwrite target', async () => {

        let oldFileName = "poutpout8.txt"
        let newFileName = 'robert8.txt'

        tu.createFile(oldFileName, directoryRes.server, "File data, file data file data")
        tu.createFile(newFileName, directoryRes.server, "File data, file data file data")

        const data: MvFile_Request = {
            parent: directoryRes.network,
            fileName: oldFileName,
            newFileName: newFileName,
            overwrite: true
        }

        const resp = await request(app)
            .put(endpoints.FS_COPY)
            .send(data)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

        expect(dataresp.newFileName).toEqual(newFileName)
        expect(dataresp.parent).toEqual(directoryRes.network)
        //expect(dataresp.message).toMatch(/^File/)
    });

    test('Copy a single directory', async () => {

        let oldFileName = "directory dir"
        let newFileName = 'directory bear'
        fs.mkdirSync(path.join(directoryRes.server, oldFileName))

        tu.createFile("snusnuf.txt", path.join(directoryRes.server, oldFileName), "File data, file data file data")

        const data: MvFile_Request = {
            parent: directoryRes.network,
            fileName: oldFileName,
            newFileName: newFileName
        }

        const resp = await request(app)
            .put(endpoints.FS_COPY)
            .send(data)
            .expect(HttpStatusCode.FORBIDDEN)
            .expect("Content-Type", /json/);

        let dataresp: FS_Response = resp.body
        console.log(dataresp)
    });

    test('Copy - malformed Request', async () => {
        const data: MvFile_Request = {

        } as MvFile_Request

        const resp = await request(app)
            .put(endpoints.FS_COPY)
            .send(data)
            .expect(HttpStatusCode.BAD_REQUEST)
            .expect("Content-Type", /json/);

        let dataresp: FS_Response = resp.body
        console.log(dataresp)

    });
})

describe('Copy file auto reanme', () => {

    test('Copy a single file - target exist', async () => {

        let oldFileName = "rename.txt"

        tu.createFile(oldFileName, directoryRes.server, "File data, file data file data")


        const data: MvFile_Request = {
            parent: directoryRes.network,
            fileName: oldFileName,
            autoNaming: true
        }

        const resp = await request(app)
            .put(endpoints.FS_COPY)
            .send(data)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

        expect(dataresp.newFileName).toEqual("rename (1).txt")
        let rp = resolver.resolve(dataresp.parent, dataresp.newFileName)
        expect(fs.existsSync(rp.server)).toBeTruthy()
    });


    test('Copy a single file - target exist skip', async () => {

        let oldFileName = "rename.txt"

        tu.createFile(oldFileName, directoryRes.server, "File data, file data file data")
        tu.createFile("rename (1).txt", directoryRes.server, "File data, file data file data")

        const data: MvFile_Request = {
            parent: directoryRes.network,
            fileName: oldFileName,
            autoNaming: true
        }

        const resp = await request(app)
            .put(endpoints.FS_COPY)
            .send(data)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

        expect(dataresp.newFileName).toEqual("rename (2).txt")
        let rp = resolver.resolve(dataresp.parent, dataresp.newFileName)
        expect(fs.existsSync(rp.server)).toBeTruthy()
    });


    test('Copy a single file - target exist skip', async () => {

        let oldFileName = "renameTest (1).txt"

        tu.createFile(oldFileName, directoryRes.server, "File data, file data file data")

        const data: MvFile_Request = {
            parent: directoryRes.network,
            fileName: oldFileName,
            autoNaming: true
        }

        const resp = await request(app)
            .put(endpoints.FS_COPY)
            .send(data)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

        expect(dataresp.newFileName).toEqual("renameTest (2).txt")
        let rp = resolver.resolve(dataresp.parent, dataresp.newFileName)
        expect(fs.existsSync(rp.server)).toBeTruthy()
    });



    test('Copy a single file - target exist skip start later and skip few', async () => {

        let oldFileName = "renameTest (4).txt"

       
        tu.createFile(oldFileName, directoryRes.server, "File data, file data file data")
        tu.createFile("renameTest (5).txt", directoryRes.server, "File data, file data file data")
        tu.createFile("renameTest (6).txt", directoryRes.server, "File data, file data file data")

        const data: MvFile_Request = {
            parent: directoryRes.network,
            fileName: oldFileName,
            autoNaming: true
        }

        const resp = await request(app)
            .put(endpoints.FS_COPY)
            .send(data)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

        expect(dataresp.newFileName).toEqual("renameTest (7).txt")
        let rp = resolver.resolve(dataresp.parent, dataresp.newFileName)
        expect(fs.existsSync(rp.server)).toBeTruthy()
    });

})