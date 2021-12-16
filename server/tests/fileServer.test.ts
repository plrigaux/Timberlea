

import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { app } from '../app'
import { endpoints } from '../common/constants'


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
            .expect(200)  
            .expect("Content-Type", /json/)  
        

        expect(resp.statusCode).toEqual(200)
        expect(resp.body.remoteDirectory).toContain("server")
       
    })
})