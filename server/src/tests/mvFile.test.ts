import os from 'os'
import fs, { RmDirOptions, RmOptions } from 'fs'
import path from 'path'
import { endpoints } from '../common/constants'
import request from 'supertest'
import { app } from '../app'
import { HttpStatusCode, MvFile_Request, MvFile_Response, RemFile_Request, RemFile_Response } from '../common/interfaces'
import { testUtils as tu } from './testUtils'

const testDirMain = "fileServer"
const testDir = "rename file dir"
const dir = path.join(os.tmpdir(), testDirMain, testDir)

beforeAll(() => {
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

describe('Rename or move file', () => {

    test('Rename a single file', async () => {

        let oldFileName = "poutpout.txt"
        let newFileName = 'robert.txt'
        tu.createFile(oldFileName, dir, "File data, file data file data")

        const data: MvFile_Request = {
            parent: dir,
            oldFileName: oldFileName,
            newFileName: newFileName
        }

        const resp = await request(app)
            .put(endpoints.FS_MV)
            .send(data)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

        expect(dataresp.error).toBeFalsy;
        expect(dataresp.newFileName).toEqual(newFileName)
        expect(dataresp.parent).toEqual(dir)
        //expect(dataresp.message).toMatch(/^File/)
    });

    test('Rename a single file - Not found', async () => {

        let oldFileName = "poutpout2.txt"
        let newFileName = 'robert2.txt'
        //tu.createFile(oldFileName, dir, "File data, file data file data")

        const data: MvFile_Request = {
            parent: dir,
            oldFileName: oldFileName,
            newFileName: newFileName
        }

        const resp = await request(app)
            .put(endpoints.FS_MV)
            .send(data)
            .expect(HttpStatusCode.NOT_FOUND)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

        expect(dataresp.error).toBeFalsy;
        expect(dataresp.newFileName).toEqual(newFileName)
        expect(dataresp.parent).toEqual(dir)
        //expect(dataresp.message).toMatch(/^File/)
    });

    test('Rename a single file - target exist', async () => {

        let oldFileName = "poutpout3.txt"
        let newFileName = 'robert4.txt'

        tu.createFile(oldFileName, dir, "File data, file data file data")
        tu.createFile(newFileName, dir, "File data, file data file data")

        const data: MvFile_Request = {
            parent: dir,
            oldFileName: oldFileName,
            newFileName: newFileName
        }

        const resp = await request(app)
            .put(endpoints.FS_MV)
            .send(data)
            .expect(HttpStatusCode.CONFLICT)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

        expect(dataresp.error).toBeFalsy;
        expect(dataresp.newFileName).toEqual(newFileName)
        expect(dataresp.parent).toEqual(dir)
        //expect(dataresp.message).toMatch(/^File/)
    });

    test('Rename a single directory', async () => {

        let oldFileName = "directory dir"
        let newFileName = 'directory bear'
        fs.mkdirSync(path.join(dir, oldFileName))

        tu.createFile("snusnuf.txt", path.join(dir, oldFileName), "File data, file data file data")

        const data: MvFile_Request = {
            parent: dir,
            oldFileName: oldFileName,
            newFileName: newFileName
        }

        const resp = await request(app)
            .put(endpoints.FS_MV)
            .send(data)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        let dataresp: MvFile_Response = resp.body
        console.log(dataresp)

        expect(dataresp.error).toBeFalsy;
        expect(dataresp.newFileName).toEqual(newFileName)
        expect(dataresp.parent).toEqual(dir)
    });
})