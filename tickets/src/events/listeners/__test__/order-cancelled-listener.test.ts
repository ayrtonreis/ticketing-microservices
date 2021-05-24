import mongoose from 'mongoose'
import { OrderCancelledEvent } from '@ars-tickets/common'
import { Message } from 'node-nats-streaming'

import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/tickets'
import { OrderCancelledListener } from '../order-cancelled-listener'

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)
  const orderId = mongoose.Types.ObjectId().toHexString()

  const ticket = Ticket.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 20,
  })

  ticket.set({ orderId })
  await ticket.save()

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, msg, data, ticket, orderId }
}

it('should update the ticket, publish an event and acknowledge the message', async () => {
  const { listener, msg, data, ticket } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)
  expect(updatedTicket!.orderId).not.toBeDefined()

  expect(msg.ack).toHaveBeenCalled()
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
