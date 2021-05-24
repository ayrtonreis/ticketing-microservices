import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

import { OrderCreatedListener } from '../order-created-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/tickets'
import { OrderCreatedEvent, OrderStatus } from '@ars-tickets/common'

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client)

  // create and save a ticket
  const ticket = Ticket.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 10,
  })

  await ticket.save()

  // create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    ticket: { id: ticket.id, price: ticket.price },
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, ticket, data, msg }
}

it('should set the userId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)
  expect(updatedTicket!.orderId).toBe(data.id)
})

it('should acknowledge the message', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('should publish a ticket updated event', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

  expect(ticketUpdatedData.orderId).toBe(data.id)
})
