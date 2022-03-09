import fs, { RmOptions } from 'fs'
import os from 'os'
import path from 'path'
import request from 'supertest'
import { app } from '../app'
import { endpoints, HttpStatusCode } from '../common/constants'
import { FileList_Response, FileType } from '../common/interfaces'
import { Resolver, ResolverPath } from '../filePathResolver'
import { testUtils as tu } from './testUtils'

const testDirMain = "fileServer"
const testDir = "file list"
const dir = path.join(os.tmpdir(), testDirMain, testDir)

const dirToSend = Resolver.instance.resolve(tu.TEMP, testDirMain, testDir) as ResolverPath

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

        expect(dataresp.files).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: tu.TEMP }),
                expect.objectContaining({ name: tu.HOME }),
            ])
        );
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

    test('Get file list - TEMP', async () => {

        let remoteDirectory = encodeURIComponent(tu.TEMP);
        const url = path.join(endpoints.FS_LIST, remoteDirectory)
        const resp = await request(app)
            .get(url)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        let dataresp: FileList_Response = resp.body

        expect(dataresp.error).toBeFalsy();
        expect(dataresp.files).toBeDefined();
        expect(dataresp.files?.length).toBeDefined();

        expect(dataresp.files).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: testDirMain, type: FileType.Directory }),
            ])
        );
    });

    test('Get file list - directory', async () => {

        let new_File = "patate"
        let fileNum = 1
        let f1 = new_File + fileNum++
        let f2 = new_File + fileNum++
        let f3 = new_File + fileNum++
        tu.createFile(f1, dir, "File data, file data file data")
        tu.createFile(f2, dir, "File data, file data file data")
        tu.createFile(f3, dir, "File data, file data file data")

        let new_Dir = "new_dir"
        tu.createDir(dir, new_Dir)

        let remoteDirectory = encodeURIComponent(dirToSend.network);
        console.warn(remoteDirectory)
        const url = path.join(endpoints.FS_LIST, remoteDirectory)
        const resp = await request(app)
            .get(url)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        let dataresp: FileList_Response = resp.body
        console.log(dataresp)

        expect(dataresp.error).toBeFalsy();
        expect(dataresp.files?.length).toEqual(4)
        expect(dataresp.parent).toEqual(dirToSend.network)

        dataresp.files?.forEach(a => {
            if (a.name == new_Dir) {
                expect(a.type).toEqual(FileType.Directory)
                expect(a.size).toBeUndefined()
            } else {
                expect(a.type).toEqual(FileType.File)
                expect(a.size).toBeGreaterThanOrEqual(0)
            }
        })

        expect(dataresp.files).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: f1, type: FileType.File }),
                expect.objectContaining({ name: f2, type: FileType.File }),
                expect.objectContaining({ name: f3, type: FileType.File }),
                expect.objectContaining({ name: new_Dir, type: FileType.Directory }),
            ])
        );
    });

    test('Get file list - from a file', async () => {

        let new_File = "tomato.txt"

        let p: string = tu.createFile(new_File, dir, "File data, file data file data")

        let p1 = Resolver.instance.replaceWithKey(p)

        expect(p1).not.toBeNull()

        if (!p1) {
            return
        }

        let remoteDirectory = encodeURIComponent(p1);
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