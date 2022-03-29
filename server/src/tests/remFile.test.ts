import os from 'os'
import fs, { RmDirOptions, RmOptions } from 'fs'
import path from 'path'
import { endpoints, HttpStatusCode } from '../common/constants'
import request from 'supertest'
import { app } from '../app'
import { RemFile_Request, RemFile_Response } from '../common/interfaces'
import { testUtils } from './testUtils'
import { resolver, ResolverPath } from '../filePathResolver'



const testDirMain = "fileServer"
const testDir = "rem dir"
//const dir = path.join(os.tmpdir(), testDirMain, testDir)
const directoryRes = resolver.resolve(testUtils.TEMP, testDirMain, testDir) as ResolverPath

beforeAll(() => {
    let dir = directoryRes.server
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

describe('Delete file or directory', () => {

    test('Delete a single file', async () => {

        let fileName = "poutpout.txt"
        fs.writeFileSync(path.join(directoryRes.server, fileName), 'Learn Node FS module')

        const data: RemFile_Request = {
            parent: directoryRes.network,
            fileName: fileName,
        }

        const resp = await request(app)
            .delete(endpoints.FS_REM)
            .send(data)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

            let dataresp : RemFile_Response = resp.body
            console.log(dataresp)

            expect(dataresp.file).toEqual(fileName)
    });

    test('Delete a single file - recusive', async () => {

        let fileName = "poutpout2.txt"
        fs.writeFileSync(path.join(directoryRes.server, fileName), 'Learn Node FS module')

         
        const data: RemFile_Request = {
            parent: directoryRes.network,
            fileName: fileName,
            recursive : true
        }

        const resp = await request(app)
            .delete(endpoints.FS_REM)
            .send(data)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

            let dataresp : RemFile_Response = resp.body
            console.log(dataresp)

            expect(dataresp.file).toEqual(fileName)
    });

    test('Delete a single file - not exits', async () => {

        let fileName = "poutpout3.txt"
        
        const data: RemFile_Request = {
            parent: directoryRes.network,
            fileName: fileName,
            recursive : false
        }

        const resp = await request(app)
            .delete(endpoints.FS_REM)
            .send(data)
            .expect(HttpStatusCode.NOT_FOUND)
            .expect("Content-Type", /json/);

            let dataresp : RemFile_Response = resp.body
            console.log(dataresp)

    });

    test('Delete a single directory', async () => {

        let fileName = "poutpoutDir"
        fs.mkdirSync(path.join(directoryRes.server, fileName))
        
        const data: RemFile_Request = {
            parent: directoryRes.network,
            fileName: fileName,
            recursive : true
        }

        const resp = await request(app)
            .delete(endpoints.FS_REM)
            .send(data)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

            let dataresp : RemFile_Response = resp.body
            console.log(dataresp)

            expect(dataresp.file).toEqual(fileName)
    });


    test('Delete a single directory - not permited', async () => {

        let fileName = "poutpoutDir"
        fs.mkdirSync(path.join(directoryRes.server, fileName))
        
        const data: RemFile_Request = {
            parent: directoryRes.network,
            fileName: fileName,
         }

        const resp = await request(app)
            .delete(endpoints.FS_REM)
            .send(data)
            .expect(HttpStatusCode.FORBIDDEN)
            .expect("Content-Type", /json/);

            let dataresp : RemFile_Response = resp.body
    });

})