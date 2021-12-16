

import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { app } from '../server'

let server: Express


beforeAll(async () => {
    server = app
})

describe('GET test', () => {
    it('should return 200 & valid response if request param list is empity', done => {
        request(server)
            .get(`/api/v1/hello`)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) done(err)
                expect(res.body).toMatchObject({ 'message': 'Hello, stranger!' })
                done()
            })
    })
})