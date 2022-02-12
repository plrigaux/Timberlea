

import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { app } from '../app'
import { endpoints, HttpStatusCode } from '../common/constants'
import { ChangeDir_Response } from '../common/interfaces'


describe('GET test', () => {
    it('should return 200 & valid response if request param list is empity', async () => {
        const res = await request(app)
            .get(`/api/v1/hello`)


        expect(res.statusCode).toEqual(404)
        //expect(res.body).toHaveProperty('post')
    })

    it("test PWD", async () => {

        const resp = await request(app)
            .get(endpoints.FS_PWD)
            .expect(HttpStatusCode.OK)
            .expect("Content-Type", /json/)


        let respData: ChangeDir_Response = resp.body
        expect(resp.statusCode).toEqual(HttpStatusCode.OK)

        //expect(respData.parent).toContain("server")

    })
})