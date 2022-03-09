import fs, { RmOptions } from 'fs'
import os from 'os'
import path from 'path'
import request from 'supertest'
import { app } from '../app'
import { endpoints, HttpStatusCode } from '../common/constants'
import { FileDetail_Response, MakeDirRequest, MakeDirResponse, MakeFileRequest, MakeFileResponse } from '../common/interfaces'
import { Resolver, ResolverPath } from '../filePathResolver'
import { testUtils } from './testUtils'

const testDirMain = "fileServer"
const testDir = "make dir"
//const dir = path.join(os.tmpdir(), testDirMain, testDir)
const directoryRes = Resolver.instance.resolve(testUtils.TEMP, testDirMain, testDir) as ResolverPath

beforeAll(() => {
    if (!fs.existsSync(directoryRes.server)) {
        fs.mkdirSync(directoryRes.server, { recursive: true });
    }
});

afterAll(() => {
    try {
        const options: RmOptions = { recursive: true, force: true }
        fs.rmSync(directoryRes.server, options)
        console.log(`${directoryRes.server} is deleted!`);
    } catch (err) {
        console.error(`Error while deleting ${directoryRes.server}.`, err);
    }
});

describe('Create File', () => {

    test('Create a single file', async () => {
        const requestData: MakeFileRequest = {
            parent: directoryRes.network,
            fileName: 'pout.txt',
            data: "no relevent data"
        }

        const resp = await request(app)
            .post(endpoints.FS_MKFILE)
            .send(requestData)
            .expect(HttpStatusCode.CREATED)
            .expect("Content-Type", /json/)


        let newFile = path.join(directoryRes.server, requestData.fileName)
        expect(fs.existsSync(newFile)).toBeTruthy()

        let response: FileDetail_Response = resp.body

        expect(response.error).toBeFalsy()
        expect(response.file).not.toBeUndefined()
        expect(response.file.name).toEqual(requestData.fileName)

        const buffer = fs.readFileSync(newFile);


        const fileContent = buffer.toString();
        expect(fileContent).toEqual(requestData.data)

    });

    test('Create a single file - file already exist', async () => {
        const data: MakeFileRequest = {
            parent: directoryRes.network,
            fileName: 'pout2.txt',
            data: "no data"
        }

        fs.writeFileSync(path.join(directoryRes.server, data.fileName), 'Learn Node FS module')

        const resp = await request(app)
            .post(endpoints.FS_MKFILE)
            .send(data)
            .expect(HttpStatusCode.CONFLICT)
            .expect("Content-Type", /json/)

    });

    test('Create a single file - Directory already exist', async () => {
        const file = 'thisIsAfile'


        const data: MakeFileRequest = {
            parent: directoryRes.network,
            fileName: 'pout3dir',
            data: "no data"
        }

        fs.mkdirSync(path.join(directoryRes.server, data.fileName))

        const resp = await request(app)
            .post(endpoints.FS_MKFILE)
            .send(data)
            .expect(HttpStatusCode.CONFLICT)
            .expect("Content-Type", /json/)

    });

    test('Create a single file - Path key fail', async () => {

        const data: MakeFileRequest = {
            parent: "NOTEXIST/" + directoryRes.network,
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