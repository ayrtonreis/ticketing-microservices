import request from 'supertest'

import { app } from '../../app'
import { Ticket } from '../../models/tickets'
import { natsWrapper } from '../../nats-wrapper'

it('should have a POST /api/tickets', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({})

  expect(response.status).not.toEqual(404)
})

it('should only be accessed if the user is signed in', async () => {
  await request(app)
    .post('/api/tickets')
    .send({})
    .expect(401)
})

it('should return a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getSigninCookie())
    .send({})

  expect(response.status).not.toEqual(401)
})

it('should return an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getSigninCookie())
    .send({
      title: '',
      price: 10,
    })
    .expect(400)

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getSigninCookie())
    .send({
      price: 10,
    })
    .expect(400)
})

it('should return an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getSigninCookie())
    .send({
      title: 'title',
      price: -10,
    })
    .expect(400)

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getSigninCookie())
    .send({
      title: 'title',
    })
    .expect(400)
})

it('should create a ticket with valid inputs', async () => {
  const countTickets = await Ticket.countDocuments({})
  expect(countTickets).toEqual(0)

  const title = 'title'
  const price = 20

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getSigninCookie())
    .send({ title, price })
    .expect(201)

  const tickets = await Ticket.find({})
  expect(tickets.length).toEqual(1)
  expect(tickets[0].title).toEqual(title)
  expect(tickets[0].price).toEqual(price)
})

it('should publish an event', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getSigninCookie())
    .send({ title: 'title', price: 20 })
    .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
