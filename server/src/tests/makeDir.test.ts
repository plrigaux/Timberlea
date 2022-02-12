import fs, { RmOptions } from 'fs'
import os from 'os'
import path from 'path'
import request from 'supertest'
import { app } from '../app'
import { endpoints, HttpStatusCode } from '../common/constants'
import { MakeDirRequest } from '../common/interfaces'

const testDirMain = "fileServer"
const testDir = "make dir"
const dir = path.join(os.tmpdir(), testDirMain, testDir)

beforeAll(() => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

afterAll(() => {
    try {
        const options: RmOptions = { recursive: true, force: true }
        fs.rmSync(dir, options)
        console.log(`${dir} is deleted!`);
    } catch (err) {
        console.error(`Error while deleting ${dir}.`, err);
    }
});

describe('Create directory', () => {

    test('Create a single directory', async () => {
        const data: MakeDirRequest = {
            parent: dir,
            dirName: 'pout pout',
            recursive: false
        }


        const resp = await request(app)
            .post(endpoints.FS_MKDIR)
            .send(data)
            .expect(HttpStatusCode.CREATED)
            .expect("Content-Type", /json/)

    });

    test('Create a single directory - Directory already exist', async () => {
        const data: MakeDirRequest = {
            parent: dir,
            dirName: 'pout pout',
            recursive: false
        }

        const resp = await request(app)
            .post(endpoints.FS_MKDIR)
            .send(data)
            .expect(HttpStatusCode.CONFLICT)
            .expect("Content-Type", /json/)

    });

    test('Create a single directory - File already exist', async () => {
        const file = 'thisIsAfile'

        fs.writeFileSync(path.join(dir, file), 'Learn Node FS module')

        const data: MakeDirRequest = {
            parent: dir,
            dirName: file,
            recursive: false
        }

        const resp = await request(app)
            .post(endpoints.FS_MKDIR)
            .send(data)
            .expect(HttpStatusCode.CONFLICT)
            .expect("Content-Type", /json/)

    });


    test('Create multiple directory', () => {

    });

})