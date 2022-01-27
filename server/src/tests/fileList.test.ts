import os from 'os'
import fs, { RmDirOptions, RmOptions } from 'fs'
import path from 'path'
import { endpoints, HttpStatusCode } from '../common/constants'
import request from 'supertest'
import { app } from '../app'
import { testUtils as tu } from './testUtils'
import { FileList_Response, FileType } from '../common/interfaces'

const testDirMain = "fileServer"
const testDir = "file list"
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

describe('File list - App root', () => {

    test('Get file list', async () => {
        const resp = await request(app)
            .get(endpoints.FS_LIST)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        console.log(resp.body)

        let dataresp: FileList_Response = resp.body

        expect(dataresp.error).toBeFalsy();
        expect(dataresp.files).toBeDefined();
        expect(dataresp.files?.length).toBeDefined();
    });

    test('Get file list - Not exist', async () => {

        let remoteDirectory = encodeURIComponent("this dir should not exist");
        const url = path.join(endpoints.FS_LIST, remoteDirectory)
        const resp = await request(app)
            .get(url)
            .expect(HttpStatusCode.NOT_FOUND)
            .expect("Content-Type", /json/);

        console.log(resp.body)

        let dataresp: FileList_Response = resp.body

        expect(dataresp.error).toBeTruthy();
    });

    test('Get file list - Root', async () => {

        let remoteDirectory = encodeURIComponent("c:/");
        const url = path.join(endpoints.FS_LIST, remoteDirectory)
        const resp = await request(app)
            .get(url)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        console.log(resp.body)
    });

    test('Get file list - directory', async () => {

        let new_File = "patate"
        let fileNum = 1
        tu.createFile(new_File + fileNum++, dir, "File data, file data file data")
        tu.createFile(new_File + fileNum++, dir, "File data, file data file data")
        tu.createFile(new_File + fileNum++, dir, "File data, file data file data")

        let new_Dir = "new_dir"
        tu.createDir(new_Dir, dir)

        let remoteDirectory = encodeURIComponent(dir);
        const url = path.join(endpoints.FS_LIST, remoteDirectory)
        const resp = await request(app)
            .get(url)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        let dataresp: FileList_Response = resp.body
        console.log(dataresp)

        expect(dataresp.error).toBeFalsy();
        expect(dataresp.files?.length).toEqual(4)
        expect(dataresp.parent).toEqual(dir)

        dataresp.files?.forEach(a => {
            if (a.name == new_Dir) {
                expect(a.type).toEqual(FileType.Directory)
                expect(a.size).toBeUndefined()
            } else {
                expect(a.type).toEqual(FileType.File)
                expect(a.size).toBeGreaterThanOrEqual(0)
            }
        })
    });






    test('Get file list - from a file', async () => {

        let new_File = "tomato.txt"

        let p = tu.createFile(new_File, dir, "File data, file data file data")

        let remoteDirectory = encodeURIComponent(p);
        const url = path.join(endpoints.FS_LIST, remoteDirectory)
        const resp = await request(app)
            .get(url)
            .expect(HttpStatusCode.CONFLICT)
            .expect("Content-Type", /json/);

        let dataresp: FileList_Response = resp.body
        console.log(dataresp)

        expect(dataresp.error).toBeTruthy();
    });
})