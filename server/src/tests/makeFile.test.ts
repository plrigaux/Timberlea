import fs, { RmOptions } from 'fs'
import os from 'os'
import path from 'path'
import request from 'supertest'
import { app } from '../app'
import { endpoints, HttpStatusCode } from '../common/constants'
import { MakeDirRequest, MakeDirResponse, MakeFileRequest, MakeFileResponse } from '../common/interfaces'
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

describe('Create File', () => {

    test('Create a single file', async () => {
        const requestData: MakeFileRequest = {
            dir: directoryRes.getPathNetwork(),
            fileName: 'pout.txt',
            data: "no relevent data"
        }

        const resp = await request(app)
            .post(endpoints.FS_MKFILE)
            .send(requestData)
            .expect(HttpStatusCode.CREATED)
            .expect("Content-Type", /json/)


        let newFile = path.join(directoryRes.getPathServer(), requestData.fileName)
        expect(fs.existsSync(newFile)).toBeTruthy()

        let response: MakeFileResponse = resp.body

        expect(response.error).toBeFalsy()
        expect(response.fileName).toEqual(requestData.fileName)

        const buffer = fs.readFileSync(newFile);


        const fileContent = buffer.toString();
        expect(fileContent).toEqual(requestData.data)

    });

    test('Create a single file - file already exist', async () => {
        const data: MakeFileRequest = {
            dir: directoryRes.getPathNetwork(),
            fileName: 'pout2.txt',
            data: "no data"
        }

        fs.writeFileSync(path.join(directoryRes.getPathServer(), data.fileName), 'Learn Node FS module')

        const resp = await request(app)
            .post(endpoints.FS_MKFILE)
            .send(data)
            .expect(HttpStatusCode.CONFLICT)
            .expect("Content-Type", /json/)

    });

    test('Create a single file - Directory already exist', async () => {
        const file = 'thisIsAfile'


        const data: MakeFileRequest = {
            dir: directoryRes.getPathNetwork(),
            fileName: 'pout3dir',
            data: "no data"
        }

        fs.mkdirSync(path.join(directoryRes.getPathServer(), data.fileName))

        const resp = await request(app)
            .post(endpoints.FS_MKFILE)
            .send(data)
            .expect(HttpStatusCode.CONFLICT)
            .expect("Content-Type", /json/)

    });

    test('Create a single file - Path key fail', async () => {

        const data: MakeFileRequest = {
            dir: "NOTEXIST/" + directoryRes.getPathNetwork(),
            fileName: 'pout4.txt',
            data: "no relevent data"
        }

        const resp = await request(app)
            .post(endpoints.FS_MKFILE)
            .send(data)
            .expect(HttpStatusCode.NOT_FOUND)
            .expect("Content-Type", /json/)

    });

})