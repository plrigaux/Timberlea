import os from 'os'
import fs, { RmDirOptions, RmOptions } from 'fs-extra'
import path from 'path'
import { endpoints, HttpStatusCode } from '../common/constants'
import request from 'supertest'
import { app } from '../app'
import { RemFile_Request, RemFile_Response } from '../common/interfaces'
import { testUtils } from './testUtils'
import { resolver, ResolverPath } from '../filePathResolver'


const testDirMain = "fileServer"
const testDir = "dowanload dir"
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

describe('Downaload', () => {

    test('Downaload a single file', async () => {

        let fileName = "poutpout.txt"

        fs.writeFileSync(path.join(directoryRes.server, fileName), 'Learn Node FS module')

        let remoteDirectory = encodeURIComponent(directoryRes.add(fileName).network);
        const url = path.join(endpoints.FS_DOWNLOAD, remoteDirectory)

        const resp = await request(app)
            .get(url)
            .expect(HttpStatusCode.OK)
            .expect("content-disposition", /attachment/)
            .expect("content-disposition", /filename/)
            .expect("Content-Type", /text\/plain/);
    });


    test('Downaload a single file - non test', async () => {

        let fileName = "agile.png"


        try {
            let testPath = './src/tests/datafiles/' + fileName
            fs.copySync(testPath, directoryRes.add(fileName).server)
            console.log('success!')
        } catch (err) {
            console.error(err)
            expect(false).toBeTruthy()
        }


        let remoteDirectory = encodeURIComponent(directoryRes.add(fileName).network);
        const url = path.join(endpoints.FS_DOWNLOAD, remoteDirectory)

        const resp = await request(app)
            .get(url)
            .expect(HttpStatusCode.OK)
            .expect("content-disposition", /attachment/)
            .expect("content-disposition", /filename/)
            .expect("Content-Type", /image\/png/);
    });

    test('Downaload a single file - Not found', async () => {

        let remoteDirectory = encodeURIComponent(directoryRes.add("Nota file.txt").network);
        const url = path.join(endpoints.FS_DOWNLOAD, remoteDirectory)

        const resp = await request(app)
            .get(url)
            .expect(HttpStatusCode.NOT_FOUND)
            .expect("Content-Type", /text\/html/);

    });

    test('Downaload a single Linux hidden file', async () => {

        let fileName = ".hidden"

        fs.writeFileSync(path.join(directoryRes.server, fileName), 'hidden file')

        let remoteDirectory = encodeURIComponent(directoryRes.add(fileName).network);
        const url = path.join(endpoints.FS_DOWNLOAD, remoteDirectory)

        const resp = await request(app)
            .get(url)
            .expect(HttpStatusCode.OK)
        //.expect("Content-Type", /text\/plain/);

    });
})