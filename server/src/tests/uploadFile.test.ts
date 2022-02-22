import fs from 'fs-extra'
import os from 'os'
import path from 'path'
import request from 'supertest'
import { app } from '../app'
import { endpoints, fileServerErrors, HttpStatusCode, uploadFile } from '../common/constants'
import { FileUpload_Response } from '../common/interfaces'
import { Resolver, ResolverPath } from '../filePathResolver'
import { testUtils as tu } from './testUtils'

const testDirMain = "fileServer"
const testDir = "upload file dir"
const uploadDirectory = path.join(os.tmpdir(), testDirMain, testDir)
const uploadDirectoryRes = Resolver.instance.createResolverPath(tu.TEMP, testDirMain, testDir) as ResolverPath

beforeAll(() => {
    tu.createDir(uploadDirectory)
});

afterAll(() => {
    tu.removeDir(uploadDirectory)
});

describe('Upload file', () => {

    test('Upload single file', async () => {

        const file = `${__dirname}/datafiles/agile.png`

        const fileName = path.parse(file).name
        console.log(file)
        expect(fs.existsSync(file)).toBeTruthy()

        const resp = await request(app)
            .post(endpoints.FS_UPLOAD)
            .field("companyName", "supertest")
            .field(uploadFile.DESTINATION_FOLDER, uploadDirectory)
            .attach(fileName, file)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);


        const responseBody: FileUpload_Response = resp.body

        expect(responseBody.error).toBeFalsy()
        //console.log('body', resp.body)
    });

    test.only('Upload single file - Already exists', async () => {

        const file = `${__dirname}/datafiles/agile.png`
        console.log(file)
        expect(fs.existsSync(file)).toBeTruthy()

        const fileName = "bob"

        tu.createFile(`${fileName}${path.parse(file).ext}`, uploadDirectoryRes.getPathServer(), "File data, file data file data")

        const resp = await request(app)
            .post(endpoints.FS_UPLOAD)
            .field("companyName", "supertest")
            .field(uploadFile.DESTINATION_FOLDER, uploadDirectoryRes.getPathNetwork())
            .attach(fileName, file)
            .expect(HttpStatusCode.CONFLICT)
            .expect("Content-Type", /json/);


        const responseBody: FileUpload_Response = resp.body

        expect(responseBody.error).toBeTruthy()
        expect(responseBody.message).toEqual(fileServerErrors.FILE_ALREADY_EXIST)
        //console.log('body', resp.body)
    });

    test('Upload single file - Destination folder doesn\'t exist', async () => {

        const file = `${__dirname}/datafiles/agile.png`
        console.log(file)
        expect(fs.existsSync(file)).toBeTruthy()

        const fileName = path.parse(file).name

        const resp = await request(app)
            .post(endpoints.FS_UPLOAD)
            .field("companyName", "supertest")
            .field(uploadFile.DESTINATION_FOLDER, uploadDirectory + "/noexitsFolder")
            .attach(fileName, file)
            .expect(HttpStatusCode.NOT_FOUND)
            .expect("Content-Type", /json/);


        const responseBody: FileUpload_Response = resp.body

        expect(responseBody.error).toBeTruthy()
        expect(responseBody.message).toEqual(fileServerErrors.DESTINATION_FOLDER_DOESNT_EXIST)
        //console.log('body', resp.body)
    });

    test('Upload single file - Destination folder not a directory', async () => {

        const file = `${__dirname}/datafiles/agile.png`
        console.log(file)
        expect(fs.existsSync(file)).toBeTruthy()

        tu.createFile(`baba`, uploadDirectory, "File data, file data file data")


        const fileName = path.parse(file).name

        const resp = await request(app)
            .post(endpoints.FS_UPLOAD)
            .field("companyName", "supertest")
            .field(uploadFile.DESTINATION_FOLDER, uploadDirectory + "/baba")
            .attach(fileName, file)
            .expect(HttpStatusCode.CONFLICT)
            .expect("Content-Type", /json/);


        const responseBody: FileUpload_Response = resp.body

        expect(responseBody.error).toBeTruthy()
        expect(responseBody.message).toEqual(fileServerErrors.DESTINATION_FOLDER_NOT_DIRECTORY)
        //console.log('body', resp.body)
    });

    test('Upload multiple files', async () => {

        const file1 = `${__dirname}/datafiles/agile.png`
        const file2 = `${__dirname}/datafiles/waterfall.png`

        const fileName1 = path.parse(file1).name
        const fileName2 = path.parse(file2).name

        const path1 = path.join(uploadDirectory, path.parse(file1).base)
        const path2 = path.join(uploadDirectory, path.parse(file2).base)

        fs.emptyDirSync(uploadDirectory)

        console.log(file1, file2)

        expect(fs.existsSync(file1)).toBeTruthy()
        expect(fs.existsSync(file2)).toBeTruthy()

        const resp = await request(app)
            .post(endpoints.FS_UPLOAD)
            .field("companyName", "supertest")
            .field(uploadFile.DESTINATION_FOLDER, uploadDirectory)
            .attach(fileName1, file1)
            .attach(fileName2, file2)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);


        const responseBody: FileUpload_Response = resp.body

        expect(responseBody.error).toBeFalsy()


        //console.log(path1, path2)

        expect(fs.existsSync(path1)).toBeTruthy()
        expect(fs.existsSync(path2)).toBeTruthy()


        console.log('body', resp.body)
    });
})
