import fs, { RmOptions } from 'fs'
import os from 'os'
import path from 'path'
import request from 'supertest'
import { app } from '../app'
import { endpoints, HttpStatusCode } from '../common/constants'
import { FileDetail_Response, FileType } from '../common/interfaces'
import { resolver, ResolverPath } from '../filePathResolver'
import { testUtils as tu } from './testUtils'

const testDirMain = "fileServer"
const testDir = "file details"
const dir = path.join(os.tmpdir(), testDirMain, testDir)

const dirToSend = resolver.resolve(tu.TEMP, testDirMain, testDir) as ResolverPath

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

describe('File details', () => {

    test('Get file detail', async () => {

        const fileName = "pizza.txt"

        const filePath = dirToSend.add(fileName)

        fs.writeFileSync(filePath.server, 'Learn Node FS module')

        const fileEncoded = encodeURIComponent(filePath.network);

        const resp = await request(app)
            .get(endpoints.FS_DETAILS + "/" + fileEncoded)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        console.log(resp.body)

        let dataresp: FileDetail_Response = resp.body

        expect(dataresp.error).toBeFalsy();
        expect(dataresp.file).toBeDefined();
        expect(dataresp.file.name).toEqual(fileName);
        expect(dataresp.file.type).toEqual(FileType.File);
        expect(dataresp.file.size).toBeDefined();
        expect(dataresp.file.birthtime).toBeDefined();
    });

    test('Get directory detail', async () => {

        const fileEncoded = encodeURIComponent(dirToSend.network);

        const resp = await request(app)
            .get(endpoints.FS_DETAILS + "/" + fileEncoded)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

        console.log(resp.body)

        let dataresp: FileDetail_Response = resp.body

        expect(dataresp.error).toBeFalsy();
        expect(dataresp.file).toBeDefined();
        expect(dataresp.file.name).toEqual(dirToSend.basename);
        expect(dataresp.file.type).toEqual(FileType.Directory);
        //expect(dataresp.file.size).toBeUndefined();
        expect(dataresp.file.birthtime).toBeDefined();
    });

    test('Get file list - Not exist', async () => {

        const fileEncoded = encodeURIComponent(dirToSend.network + "/not ezist");

        const resp = await request(app)
            .get(endpoints.FS_DETAILS + "/" + fileEncoded)
            .expect(HttpStatusCode.NOT_FOUND)
            .expect("Content-Type", /json/);

        console.log(resp.body)

        let dataresp: FileDetail_Response = resp.body

        expect(dataresp.error).toBeTruthy();

    });
})