import fs, { RmOptions } from 'fs'
import os from 'os'
import path from 'path'
import request from 'supertest'
import { app } from '../app'
import { endpoints, HttpStatusCode } from '../common/constants'
import { MvFile_Request, MvFile_Response } from '../common/interfaces'
import { resolver, ResolverPath } from '../filePathResolver'
import { testUtils as tu } from './testUtils'

const testDirMain = "fileServer"
const testDir = "rename file dir"
//const dir = path.join(os.tmpdir(), testDirMain, testDir)
const dirToSend = resolver.resolve(tu.TEMP, testDirMain, testDir) as ResolverPath

beforeAll(() => {
    let dir = dirToSend.server

    console.log(dir);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

afterAll(() => {
    let dir = dirToSend.server

    try {
        const options: RmOptions = { recursive: true, force: true }
        fs.rmSync(dir, options)
        console.log(`${dir} is deleted!`);
    } catch (err) {
        console.error(`Error while deleting ${dir}.`, err);
    }
});

describe('Rename or move file', () => {

    test('Rename a single file', async () => {

        let oldFileName = "poutpout.txt"
        let newFileName = 'robert.txt'

        let dirToSendOld = dirToSend.add(oldFileName)
        tu.createFilePR(dirToSendOld, "File data, file data file data")

        const data: MvFile_Request = {
            parent: dirToSend.network,
            fileName: oldFileName,
            newFileName: newFileName
        }

        const resp = await request(app)
            .put(endpoints.FS_MV)
            .send(data)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

        expect(dataresp.error).toBeFalsy();
        expect(dataresp.newFileName).toEqual(newFileName)
        expect(dataresp.parent).toEqual(dirToSend.network)
        //expect(dataresp.message).toMatch(/^File/)
    });

    test('Rename a single file - Not found', async () => {

        let oldFileName = "poutpout2dd.txt"
        let newFileName = 'robert2.txt'
        //tu.createFile(oldFileName, dir, "File data, file data file data")

        const data: MvFile_Request = {
            parent: dirToSend.network,
            fileName: oldFileName,
            newFileName: newFileName
        }

        const resp = await request(app)
            .put(endpoints.FS_MV)
            .send(data)
            .expect(HttpStatusCode.NOT_FOUND)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

        expect(dataresp.error).toBeTruthy();
        expect(dataresp.newFileName).toEqual(newFileName)
        expect(dataresp.parent).toEqual(dirToSend.network)
        //expect(dataresp.message).toMatch(/^File/)
    });

    test('Rename a single file - target exist', async () => {

        let oldFileName = "poutpout3.txt"
        let newFileName = 'robert4.txt'

        tu.createFile(oldFileName, dirToSend.server, "File data, file data file data")
        tu.createFile(newFileName, dirToSend.server, "File data, file data file data")

        const data: MvFile_Request = {
            parent: dirToSend.network,
            fileName: oldFileName,
            newFileName: newFileName
        }

        const resp = await request(app)
            .put(endpoints.FS_MV)
            .send(data)
            .expect(HttpStatusCode.CONFLICT)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

        expect(dataresp.error).toBeTruthy();
        expect(dataresp.newFileName).toEqual(newFileName)
        expect(dataresp.parent).toEqual(dirToSend.network)
        //expect(dataresp.message).toMatch(/^File/)
    });

    test('Rename a single file - target exist - overwrite', async () => {

        let oldFileName = "poutpout3.txt"
        let newFileName = 'robert4.txt'

        tu.createFile(oldFileName, dirToSend.server, "File data, file data file data")
        tu.createFile(newFileName, dirToSend.server, "File data, file data file data")

        const data: MvFile_Request = {
            parent: dirToSend.network,
            fileName: oldFileName,
            newFileName: newFileName,
            overwrite : true
        }

        const resp = await request(app)
            .put(endpoints.FS_MV)
            .send(data)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

        expect(dataresp.error).toBeFalsy();
        expect(dataresp.newFileName).toEqual(newFileName)
        expect(dataresp.parent).toEqual(dirToSend.network)
        //expect(dataresp.message).toMatch(/^File/)
    });

    test('Rename a single directory', async () => {

        let oldFileName = "directory dir"
        let newFileName = 'directory bear'
        fs.mkdirSync(dirToSend.add(oldFileName).server)

        tu.createFile("snusnuf.txt", dirToSend.add(oldFileName).server, "File data, file data file data")

        const data: MvFile_Request = {
            parent: dirToSend.network,
            fileName: oldFileName,
            newFileName: newFileName
        }

        const resp = await request(app)
            .put(endpoints.FS_MV)
            .send(data)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

        expect(dataresp.error).toBeFalsy();
        expect(dataresp.newFileName).toEqual(newFileName)
        expect(dataresp.parent).toEqual(dirToSend.network)
    });
})