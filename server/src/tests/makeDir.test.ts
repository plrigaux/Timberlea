import os from 'os'
import fs, { RmDirOptions, RmOptions } from 'fs'
import path from 'path'
import { endpoints } from '../common/constants'
import request from 'supertest'
import { app } from '../app'
import { MakeDir } from '../common/interfaces'

const testDirMain = "fileServer"
const testDir = "make dir"
let dir = ""

beforeAll(() => {
    console.log(os.tmpdir());

    dir = path.join(os.tmpdir(), testDirMain, testDir)
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

describe('Create directory', () => {

    test('Create a single directory', async () => {
        const data: MakeDir = {
            parentDir: dir,
            dirName: 'pout pout',
            recursive: false
        }


        const resp = await request(app)
            .post(endpoints.FS_MKDIR)
            .send(data)
            .expect(201)
            .expect("Content-Type", /json/)

    });

    test('Create a single directory - Directory already exist', async () => {
        const data: MakeDir = {
            parentDir: dir,
            dirName: 'pout pout',
            recursive: false
        }

        const resp = await request(app)
            .post(endpoints.FS_MKDIR)
            .send(data)
            .expect(200)
            .expect("Content-Type", /json/)

    });

    test('Create a single directory - File already exist', async () => {
        const file = 'thisIsAfile'

        fs.writeFileSync(path.join(dir, file), 'Learn Node FS module')

        const data: MakeDir = {
            parentDir: dir,
            dirName: file,
            recursive: false
        }

        const resp = await request(app)
            .post(endpoints.FS_MKDIR)
            .send(data)
            .expect(409)
            .expect("Content-Type", /json/)

    });


    test('Create multiple directory', () => {

    });

})