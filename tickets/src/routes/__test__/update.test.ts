import request from 'supertest'
import mongoose from 'mongoose'

import { app } from '../../app'
import { natsWrapper } from '../../nats-wrapper'
import { Ticket } from '../../models/tickets'

const BASE_URL = '/api/tickets'

it('should return 401 if the user is not authenticated', async () => {
  const id = mongoose.Types.ObjectId().toHexString()
  request(app)
    .put(`${BASE_URL}/${id}`)
    .send({
      title: 'A title',
      price: 20,
    })
    .expect(401)
})

it('should return 404 if the provided id does not exist', async () => {
  const id = mongoose.Types.ObjectId().toHexString()
  request(app)
    .put(`${BASE_URL}/${id}`)
    .set('Cookie', global.getSigninCookie())
    .send({
      title: 'A title',
      price: 20,
    })
    .expect(404)
})

it('should return 401 if the user does not own the ticket', async () => {
  const createdResponse = await request(app)
    .post(BASE_URL)
    .set('Cookie', global.getSigninCookie())
    .send({
      title: 'A title',
      price: 20,
    })

  const beforeResponse = await request(app)
    .get(`${BASE_URL}/${createdResponse.body.id}`)
    .expect(200)

  await request(app)
    .put(`${BASE_URL}/${createdResponse.body.id}`)
    .set('Cookie', global.getSigninCookie())
    .send({
      title: 'Updated title',
      price: 22,
    })
    .expect(401)

  const afterResponse = await request(app)
    .get(`${BASE_URL}/${createdResponse.body.id}`)
    .expect(200)

  expect(afterResponse.body).toEqual(beforeResponse.body)
})

it('should return 400 if the user provides an invalid title or price', async () => {
  const signInCookie = global.getSigninCookie()

  const createdResponse = await request(app)
    .post(BASE_URL)
    .set('Cookie', signInCookie)
    .send({
      title: 'A title',
      price: 20,
    })

  await request(app)
    .put(`${BASE_URL}/${createdResponse.body.id}`)
    .set('Cookie', signInCookie)
    .send({
      title: '',
      price: 20,
    })
    .expect(400)

  await request(app)
    .put(`${BASE_URL}/${createdResponse.body.id}`)
    .set('Cookie', signInCookie)
    .send({
      title: 'A title',
      price: -20,
    })
    .expect(400)
})

it('should update the ticket provided valid inputs', async () => {
  const signInCookie = global.getSigninCookie()

  const createdResponse = await request(app)
    .post(BASE_URL)
    .set('Cookie', signInCookie)
    .send({
      title: 'A title',
      price: 20,
    })

  await request(app)
    .put(`${BASE_URL}/${createdResponse.body.id}`)
    .set('Cookie', signInCookie)
    .send({
      title: 'New title',
      price: 100,
    })
    .expect(200)

  const afterResponse = await request(app)
    .get(`${BASE_URL}/${createdResponse.body.id}`)
    .expect(200)

  expect(afterResponse.body.title).toEqual('New title')
  expect(afterResponse.body.price).toEqual(100)
})

it('should publish an event', async () => {
  const signInCookie = global.getSigninCookie()

  const createdResponse = await request(app)
    .post(BASE_URL)
    .set('Cookie', signInCookie)
    .send({
      title: 'A title',
      price: 20,
    })

  await request(app)
    .put(`${BASE_URL}/${createdResponse.body.id}`)
    .set('Cookie', signInCookie)
    .send({
      title: 'New title',
      price: 100,
    })
    .expect(200)

  await request(app)
    .get(`${BASE_URL}/${createdResponse.body.id}`)
    .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('should reject updated if the ticket is reserved', async () => {
  const signInCookie = global.getSigninCookie()

  const createdResponse = await request(app)
    .post(BASE_URL)
    .set('Cookie', signInCookie)
    .send({
      title: 'A title',
      price: 20,
    })

  const ticket = await Ticket.findById(createdResponse.body.id)
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() })
  await ticket!.save()

  await request(app)
    .put(`${BASE_URL}/${createdResponse.body.id}`)
    .set('Cookie', signInCookie)
    .send({
      title: 'New title',
      price: 100,
    })
    .expect(400)
})
