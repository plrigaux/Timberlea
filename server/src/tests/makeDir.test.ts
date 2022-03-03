import fs, { RmOptions } from 'fs'
import os from 'os'
import path from 'path'
import request from 'supertest'
import { app } from '../app'
import { endpoints, HttpStatusCode } from '../common/constants'
import { MakeDirRequest, MakeDirResponse } from '../common/interfaces'
import { Resolver, ResolverPath } from '../filePathResolver'
import { testUtils } from './testUtils'

const testDirMain = "fileServer"
const testDir = "make dir"
//const dir = path.join(os.tmpdir(), testDirMain, testDir)
const directoryRes = Resolver.instance.resolve(testUtils.TEMP, testDirMain, testDir) as ResolverPath

beforeAll(() => {
    if (!fs.existsSync(directoryRes.getPathServer())) {
        fs.mkdirSync(directoryRes.getPathServer(), { recursive: true });
    }
});

afterAll(() => {
    try {
        const options: RmOptions = { recursive: true, force: true }
        fs.rmSync(directoryRes.getPathServer(), options)
        console.log(`${directoryRes.getPathServer()} is deleted!`);
    } catch (err) {
        console.error(`Error while deleting ${directoryRes.getPathServer()}.`, err);
    }
});

describe('Create directory', () => {

    test('Create a single directory', async () => {
        const data: MakeDirRequest = {
            parent: directoryRes.getPathNetwork(),
            dirName: 'pout pout',
        }

        const resp = await request(app)
            .post(endpoints.FS_MKDIR)
            .send(data)
            .expect(HttpStatusCode.CREATED)
            .expect("Content-Type", /json/)

            
            let newDir = path.join(directoryRes.getPathServer(), data.dirName)
            expect(fs.existsSync(newDir)).toBeTruthy()

            let response : MakeDirResponse = resp.body
            
            expect(response.error).toBeFalsy()
            expect(response.dirName).toEqual(data.dirName)
            expect(response.parent).toEqual(data.parent)
    });

    test('Create a single directory - Directory already exist', async () => {
        const data: MakeDirRequest = {
            parent: directoryRes.getPathNetwork(),
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

        fs.writeFileSync(path.join(directoryRes.getPathServer(), file), 'Learn Node FS module')

        const data: MakeDirRequest = {
            parent: directoryRes.getPathNetwork(),
            dirName: file,
            recursive: false
        }

        const resp = await request(app)
            .post(endpoints.FS_MKDIR)
            .send(data)
            .expect(HttpStatusCode.CONFLICT)
            .expect("Content-Type", /json/)

    });

    test('Create a single directory - Path key fail', async () => {

        const data: MakeDirRequest = {
            parent: "NOTEXIST/" + directoryRes.getPathNetwork(),
            dirName: "new dir man",
            recursive: false
        }

        const resp = await request(app)
            .post(endpoints.FS_MKDIR)
            .send(data)
            .expect(HttpStatusCode.NOT_FOUND)
            .expect("Content-Type", /json/)

    });


    test('Create multiple directory', async () => {
        const data: MakeDirRequest = {
            parent: directoryRes.getPathNetwork(),
            dirName: 'pout12/pout',
            recursive: true
        }

        const resp = await request(app)
            .post(endpoints.FS_MKDIR)
            .send(data)
            .expect(HttpStatusCode.CREATED)
            .expect("Content-Type", /json/)

            let newDir = path.join(directoryRes.getPathServer(), data.dirName)
            expect(fs.existsSync(newDir)).toBeTruthy()


            let response : MakeDirResponse = resp.body

            expect(response.error).toBeFalsy()
            expect(response.dirName).not.toEqual(data.dirName)
            expect(response.parent).not.toEqual(data.parent)
            expect(response.parent + "/" + response.dirName).toEqual(data.parent + "/" + data.dirName)
    });

    test('Create directory - Bad request', async () => {
        const data: MakeDirRequest = {
            parent: 3456,
            dirName: 1234,
        } as unknown as MakeDirRequest

        const resp = await request(app)
            .post(endpoints.FS_MKDIR)
            .send(data)
            .expect(HttpStatusCode.BAD_REQUEST)
            .expect("Content-Type", /json/)

            let response : MakeDirResponse = resp.body

            expect(response.error).toBeTruthy()
        
    });

})