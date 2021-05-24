import mongoose from 'mongoose'
import request from 'supertest'
import { Ticket } from '../../models/ticket'
import { app } from '../../app'

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 20,
  })

  await ticket.save()

  return ticket
}

it('should fetch orders for a particular user', async () => {
  // Create 3 tickets
  const ticketOne = await buildTicket()
  const ticketTwo = await buildTicket()
  const ticketThree = await buildTicket()

  const userOne = global.getSigninCookie()
  const userTwo = global.getSigninCookie()

  // Create 1 order as User #1
  await request(app)
    .post('/api/orders/')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201)

  // Create 2 orders as User #2
  const { body: orderA } = await request(app)
    .post('/api/orders/')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201)

  const { body: orderB } = await request(app)
    .post('/api/orders/')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201)

  // Make request to get orders for User #2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200)

  // Make sure we only got the orders for User #2
  expect(response.body.length).toBe(2)

  // Check that we fetched the correct orders
  expect(response.body[0].id).toBe(orderA.id)
  expect(response.body[1].id).toBe(orderB.id)

  // Check that the orders are connected to the right tickets
  expect(response.body[0].ticket.id).toBe(ticketTwo.id)
  expect(response.body[1].ticket.id).toBe(ticketThree.id)
})
