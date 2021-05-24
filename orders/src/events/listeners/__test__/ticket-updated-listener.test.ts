import mongoose from 'mongoose'
import { TicketUpdatedEvent } from '@ars-tickets/common'

import { natsWrapper } from '../../../nats-wrapper'
import { TicketUpdatedListener } from '../ticket-updated-listener'
import { Ticket } from '../../../models/ticket'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client)

  // create and save a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 10,
  })

  await ticket.save()

  // create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'New Concert',
    price: 888,
    userId: mongoose.Types.ObjectId().toHexString(),
  }

  // create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { msg, data, ticket, listener }
}

it('should find, update and save a ticket', async () => {
  const { msg, data, ticket, listener } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it('should acknowledge the message', async () => {
  const { msg, data, listener } = await setup()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('should not acknowledge the event if skipped a version number', async () => {
  const {msg, data, listener} = await setup()
  data.version++

  await expect(listener.onMessage(data, msg)).rejects.toThrow()
  expect(msg.ack).not.toHaveBeenCalled()
}) 
