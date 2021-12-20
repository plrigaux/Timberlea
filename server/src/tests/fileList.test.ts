import os from 'os'
import fs, { RmDirOptions, RmOptions } from 'fs'
import path from 'path'
import { endpoints } from '../common/constants'
import request from 'supertest'
import { app } from '../app'

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

describe('File list', () => {

    test('Get file list', async () => {
        const resp = await request(app)
            .get(endpoints.FS_LIST)
            .expect(200)
            .expect("Content-Type", /json/);

            console.log(resp.body)
    });

    test('Get file list - Not exist', async () => {

        let remoteDirectory = encodeURIComponent("this dir should not exist");
        const url = path.join(endpoints.FS_LIST, remoteDirectory)
        const resp = await request(app)
            .get(url)
            .expect(404)
            .expect("Content-Type", /json/);

            console.log(resp.body)
    });

    test('Get file list - Root', async () => {

        let remoteDirectory = encodeURIComponent("c:/");
        const url = path.join(endpoints.FS_LIST, remoteDirectory)
        const resp = await request(app)
            .get(url)
            .expect(200)
            .expect("Content-Type", /json/);

            console.log(resp.body)
    });
})