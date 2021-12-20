import fs from 'fs'
import os from 'os'
import path from 'path'
import request from 'supertest'
import { app } from '../app'
import { endpoints, fileServerErrors, HttpStatusCode, uploadFile } from '../common/constants'
import { FileUpload_Response } from '../common/interfaces'
import { testUtils as tu } from './testUtils'

const testDirMain = "fileServer"
const testDir = "upload file dir"
const dir = path.join(os.tmpdir(), testDirMain, testDir)

beforeAll(() => {
    tu.createDir(dir)
});

afterAll(() => {
    //tu.removeDir(dir)
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
            .field(uploadFile.DESTINATION_FOLDER, dir)
            .attach(fileName, file)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/);


        const responseBody: FileUpload_Response = resp.body

        expect(responseBody.error).toBeFalsy()
        //console.log('body', resp.body)
    });

    test('Upload single file - Already exists', async () => {
        
        const file = `${__dirname}/datafiles/agile.png`
        console.log(file)
        expect(fs.existsSync(file)).toBeTruthy()

        const fileName = "bob"

        tu.createFile(`${fileName}${path.parse(file).ext}`, dir, "File data, file data file data")

        const resp = await request(app)
            .post(endpoints.FS_UPLOAD)
            .field("companyName", "supertest")
            .field(uploadFile.DESTINATION_FOLDER, dir)
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
            .field(uploadFile.DESTINATION_FOLDER, dir + "/noexitsFolder")
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

        tu.createFile(`baba`, dir, "File data, file data file data")
        
        
        const fileName = path.parse(file).name

        const resp = await request(app)
            .post(endpoints.FS_UPLOAD)
            .field("companyName", "supertest")
            .field(uploadFile.DESTINATION_FOLDER, dir + "/baba")
            .attach(fileName, file)
            .expect(HttpStatusCode.CONFLICT)
            .expect("Content-Type", /json/);


        const responseBody: FileUpload_Response = resp.body

        expect(responseBody.error).toBeTruthy()
        expect(responseBody.message).toEqual(fileServerErrors.DESTINATION_FOLDER_NOT_DIRECTORY)
        //console.log('body', resp.body)
    });
})
