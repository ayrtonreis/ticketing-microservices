import { app } from '../../app'
import request from 'supertest'
import mongoose from 'mongoose'

const BASE_URL = '/api/tickets'

it('should return 404 if ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()

  const response = await request(app)
    .get(`${BASE_URL}/${id}`)
    .send()
    .expect(404)
})

it('should return the ticket if it is found', async () => {
  const title = 'concert'
  const price = 20

  const createdResponse = await request(app)
    .post(BASE_URL)
    .set('Cookie', global.getSigninCookie())
    .send({ title, price })
    .expect(201)

  const fetchedResponse = await request(app)
    .get(`${BASE_URL}/${createdResponse.body.id}`)
    .expect(200)

  expect(fetchedResponse.body.title).toEqual(title)
  expect(fetchedResponse.body.price).toEqual(price)
})