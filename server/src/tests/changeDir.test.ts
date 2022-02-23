import os from 'os'
import fs, { RmDirOptions, RmOptions } from 'fs'
import path from 'path'
import { endpoints, FSErrorMsg, HttpStatusCode } from '../common/constants'
import request from 'supertest'
import { app } from '../app'
import { ChangeDir_Request, ChangeDir_Response } from '../common/interfaces'
import { testUtils as tu } from './testUtils'
import { Resolver, ResolverPath } from '../filePathResolver'

const testDirMain = "fileServer"
const testDir = "change dir"

const directoryRes = Resolver.instance.createResolverPath(tu.TEMP, testDirMain, testDir) as ResolverPath


beforeAll(() => {
    const dir = directoryRes.getPathServer()
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
        tu.createDir(directoryRes.getPathServer(), newDir)
       
        let changeDir : ChangeDir_Request = {
            remoteDirectory: directoryRes.getPathNetwork(),
            newPath: newDir
        }

        const resp = await request(app)
            .put(endpoints.FS_CD)
            .send(changeDir)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

            console.log(resp.body)
            let response : ChangeDir_Response = resp.body
            
            let expectDir = directoryRes.add(newDir).getPathNetwork()
            expect(response.error).toBeFalsy();
            expect(response.parent).toEqual(expectDir)
    });

    test('Change Directory - ..', async () => {

        let newDir = "patate"
        tu.createDir(directoryRes.getPathServer(), newDir)
        let changeDir : ChangeDir_Request = {
            remoteDirectory: directoryRes.add(newDir).getPathNetwork(),
            newPath: ".."
        }

        const resp = await request(app)
            .put(endpoints.FS_CD)
            .send(changeDir)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

            let response : ChangeDir_Response = resp.body
            
            let expectDir = directoryRes.getPathNetwork()
            expect(response.error).toBeFalsy();
            expect(response.parent).toEqual(expectDir)
    });

    test('Change Directory - TEMP ..', async () => {

        let changeDir : ChangeDir_Request = {
            remoteDirectory: tu.TEMP,
            newPath: ".."
        }

        const resp = await request(app)
            .put(endpoints.FS_CD)
            .send(changeDir)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

            let response : ChangeDir_Response = resp.body
            
            expect(response.error).toBeFalsy();
            expect(response.parent).toEqual(tu.HOME_ROOT)
    });

    test('Change Directory - ROOT to TEMP', async () => {

        let changeDir : ChangeDir_Request = {
            remoteDirectory: tu.HOME_ROOT,
            newPath: tu.TEMP
        }

        const resp = await request(app)
            .put(endpoints.FS_CD)
            .send(changeDir)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);

            let response : ChangeDir_Response = resp.body
            
            expect(response.error).toBeFalsy();
            expect(response.parent).toEqual(tu.TEMP)
    });

    test('Change Directory - Not exist', async () => {

        let newDir = "patate2"
   
        let changeDir : ChangeDir_Request = {
            remoteDirectory: directoryRes.getPathNetwork(),
            newPath: newDir
        }

        const resp = await request(app)
            .put(endpoints.FS_CD)
            .send(changeDir)
            .expect(HttpStatusCode.NOT_FOUND)
            .expect("Content-Type", /json/);

            let dataresp: ChangeDir_Response = resp.body

            console.log(dataresp)
            expect(dataresp.error).toBeTruthy;
            expect(dataresp.message).toEqual(FSErrorMsg.DESTINATION_FOLDER_DOESNT_EXIST)

    });
    
    test('Change Directory - not a Directory', async () => {

        let newDir = "patate3"
        tu.createFile(newDir, directoryRes.getPathServer(), "File data, file data file data")

        let changeDir : ChangeDir_Request = {
            remoteDirectory: directoryRes.getPathNetwork(),
            newPath: newDir
        }

        const resp = await request(app)
            .put(endpoints.FS_CD)
            .send(changeDir)
            .expect(HttpStatusCode.CONFLICT)
            .expect("Content-Type", /json/);

            let dataresp: ChangeDir_Response = resp.body

            console.log(dataresp)
            expect(dataresp.error).toBeTruthy();
            expect(dataresp.message).toEqual(FSErrorMsg.DESTINATION_FOLDER_NOT_DIRECTORY)

    });

    test('Change Directory - Bad Request', async () => {

        let changeDir = {
            //remoteDirectory: dir
            //newPath: newDir
        }

        const resp = await request(app)
            .put(endpoints.FS_CD)
            .send(changeDir)
            .expect(HttpStatusCode.BAD_REQUEST)
            .expect("Content-Type", /json/);

            let dataresp: ChangeDir_Response = resp.body

            expect(dataresp.error).toBeTruthy();
    });
})