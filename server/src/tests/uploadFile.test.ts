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
        console.log(file)
        expect(fs.existsSync(file)).toBeTruthy()

        const resp = await request(app)
            .post(endpoints.FS_UPLOAD)
            .field("companyName", "supertest")
            .field(uploadFile.DESTINATION_FOLDER, dir)
            .attach('mouf', file)
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

        tu.createFile("agile.png", dir, "File data, file data file data")

        const resp = await request(app)
            .post(endpoints.FS_UPLOAD)
            .field("companyName", "supertest")
            .field(uploadFile.DESTINATION_FOLDER, dir)
            .attach('mouf', file)
            .expect(HttpStatusCode.CONFLICT)
            .expect("Content-Type", /json/);


        const responseBody: FileUpload_Response = resp.body

        expect(responseBody.error).toBeTruthy()
        expect(responseBody.message).toEqual(fileServerErrors.FILE_ALREADY_EXIST)
        //console.log('body', resp.body)
    });
})
