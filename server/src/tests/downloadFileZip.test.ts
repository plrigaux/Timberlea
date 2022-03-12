import fs, { RmOptions } from 'fs-extra'
import os from 'os'
import path from 'path'
import request from 'supertest'
import { app } from '../app'
import { endpoints, HttpStatusCode } from '../common/constants'
import { resolver, ResolverPath } from '../filePathResolver'
import { testUtils } from './testUtils'


const testDirMain = "fileServer"
const testDir = "dowanload zip dir"
const directoryRes = resolver.resolve(testUtils.TEMP, testDirMain, testDir) as ResolverPath

beforeAll(() => {
    let dir = directoryRes.server
    console.log(dir);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

afterAll(() => {
    let dir = directoryRes.server

    try {
        const options: RmOptions = { recursive: true, force: true }
        fs.rmSync(dir, options)
        console.log(`${dir} is deleted!`);
    } catch (err) {
        console.error(`Error while deleting ${dir}.`, err);
    }
});

describe('Downaload Zip', () => {

    test('Downaload a single directory', (done: jest.DoneCallback) => {

        let fileName = "poutpout.txt"

        fs.writeFileSync(path.join(directoryRes.server, fileName), 'Learn Node FS module')

        try {
            let testPath = './src/tests/datafiles'
            fs.copySync(testPath, directoryRes.add("sub").server)
            console.log('success!')
        } catch (err) {
            console.error(err)
            expect(false).toBeTruthy()
        }

        let remoteDirectory = encodeURIComponent(directoryRes.network);
        const url = path.join(endpoints.FS_DOWNZIP, remoteDirectory)
        console.log(url)

        request(app)
            .get(url)
            .expect("Content-Type", /application\/zip/)
            .expect("content-disposition", /attachment/)
            .expect("content-disposition", /filename/)
            .expect("content-disposition", new RegExp(directoryRes.basename + ".zip"))
            .expect(HttpStatusCode.OK, done)

    });


    test('Downaload a single file compressed', (done) => {
        let fileName = "poutpout2.txt"

        let fn = directoryRes.add(fileName)
        fs.writeFileSync(fn.server, 'Learn Node FS module')

        let remoteDirectory = encodeURIComponent(fn.network);
        const url = path.join(endpoints.FS_DOWNZIP, remoteDirectory)

        request(app)
            .get(url)
            .expect("Content-Type", /application\/zip/)
            .expect("content-disposition", /attachment/)
            .expect("content-disposition", /filename/)
            .expect("content-disposition", new RegExp(fn.basenameNoExt + ".zip"))
            .expect(HttpStatusCode.OK, done)


    });

    test('Downaload a single file - Not found', async () => {

        let remoteDirectory = encodeURIComponent(directoryRes.add("Nota file.txt").network);
        const url = path.join(endpoints.FS_DOWNZIP, remoteDirectory)

        const resp = await request(app)
            .get(url)
            .expect(HttpStatusCode.NOT_FOUND)
            .expect("Content-Type", /application\/json/);

    });

    test('Downaload a single Linux hidden file', async () => {

        let fileName = ".hidden"
        let fn = directoryRes.add(fileName)
        fs.writeFileSync(fn.server, 'hidden file content')

        let remoteDirectory = encodeURIComponent(directoryRes.add(fileName).network);
        const url = path.join(endpoints.FS_DOWNZIP, remoteDirectory)

        const resp = await request(app)
            .get(url)
            .expect("Content-Type", /application\/zip/)
            .expect("content-disposition", /attachment/)
            .expect("content-disposition", /filename/)
            .expect("content-disposition", new RegExp(fn.basenameNoExt + ".zip"))
            .expect(HttpStatusCode.OK)
        //.expect("Content-Type", /text\/plain/);

    });
})