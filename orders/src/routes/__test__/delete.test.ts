import mongoose from 'mongoose'
import request from 'supertest'
import { Ticket } from '../../models/ticket'
import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order'
import { natsWrapper } from '../../nats-wrapper'

it('should mark an order as cancelled', async () => {
  // Create a ticket with the Ticket Model
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'A title',
    price: 20,
  })

  await ticket.save()

  const user = global.getSigninCookie()

  // Create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  // Cancel the order
  await request(app)
    .patch(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200)

  // Check that the order is cancelled
  const updatedOrder = await Order.findById(order.id)

  expect(updatedOrder!.status).toBe(OrderStatus.Cancelled)
})

it('Should emit an order cancelled event', async () => {
  // Create a ticket with the Ticket Model
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'A title',
    price: 20,
  })

  await ticket.save()

  const user = global.getSigninCookie()

  // Create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  // Cancel the order
  await request(app)
    .patch(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
