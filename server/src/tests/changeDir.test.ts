import os from 'os'
import fs, { RmDirOptions, RmOptions } from 'fs'
import path from 'path'
import { endpoints } from '../common/constants'
import request from 'supertest'
import { app } from '../app'
import { ChangeDir_Request, ChangeDir_Response } from '../common/interfaces'
import { testUtils as tu } from './testUtils'

const testDirMain = "fileServer"
const testDir = "change dir"
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

describe('Change Directory', () => {

    test('Change Directory - OK', async () => {

        let newDir = "patate"
        fs.mkdirSync(path.join(dir, newDir))
        let changeDir : ChangeDir_Request = {
            remoteDirectory: dir,
            newPath: newDir
        }

        const resp = await request(app)
            .put(endpoints.FS_CD)
            .send(changeDir)
            .expect(200)
            .expect("Content-Type", /json/);

            console.log(resp.body)
    });

    test('Change Directory - Not exist', async () => {

        let newDir = "patate2"
   
        let changeDir : ChangeDir_Request = {
            remoteDirectory: dir,
            newPath: newDir
        }

        const resp = await request(app)
            .put(endpoints.FS_CD)
            .send(changeDir)
            .expect(404)
            .expect("Content-Type", /json/);

            let dataresp: ChangeDir_Response = resp.body

            console.log(dataresp)
            expect(dataresp.error).toBeFalsy;
            expect(dataresp.message).toMatch(/doesn't exist/)

    });

    
    test('Change Directory - not a Directory', async () => {

        let newDir = "patate3"
        tu.createFile(newDir, dir, "File data, file data file data")

        let changeDir : ChangeDir_Request = {
            remoteDirectory: dir,
            newPath: newDir
        }

        const resp = await request(app)
            .put(endpoints.FS_CD)
            .send(changeDir)
            .expect(409)
            .expect("Content-Type", /json/);

            let dataresp: ChangeDir_Response = resp.body

            console.log(dataresp)
            expect(dataresp.error).toBeFalsy;
            expect(dataresp.message).toMatch(/not a directory/)

    });
})