import mongoose from 'mongoose'
import request from 'supertest'

import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { Order } from '../../models/order'
import { OrderStatus } from '@ars-tickets/common'


it('should return an error if the ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getSigninCookie())
    .send({ ticketId: ticketId })
    .expect(404)
})

it('should return an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({
    title: 'A title',
    price: 20,
  })

  await ticket.save()

  const order = Order.build({
    ticket,
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    // This is not important for this service.
    // The expiration service will take care of this later.
    expiresAt: new Date(),
  })

  await order.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getSigninCookie())
    .send({ ticketId: ticket.id })
    .expect(400)
})

it('should reserve a ticket', async () => {
  const ticket = Ticket.build({
    title: 'A title',
    price: 20,
  })

  await ticket.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getSigninCookie())
    .send({ ticketId: ticket.id })
    .expect(201)
})


it.todo('should emit an order created event')
