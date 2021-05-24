import mongoose, { set } from 'mongoose'
import { TicketCreatedEvent } from '@ars-tickets/common'

import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'
import { Message } from 'node-nats-streaming'
import { TicketCreatedListener } from '../ticket-created-listener'

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client)

  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: 'Concert',
    price: 10,
    userId: mongoose.Types.ObjectId().toHexString(),
  }

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, data, msg }
}

it('should create and save a ticket', async () => {
  const { listener, data, msg } = await setup()

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  // make sure the ticket was created
  const ticket = await Ticket.findById(data.id)
  expect(ticket).toBeDefined()
  expect(ticket!.title).toBe(data.title)
  expect(ticket!.price).toBe(data.price)
})

it('should acknowledge the message', async () => {
  const { listener, data, msg } = await setup()

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  // make sure ack function is called
  expect(msg.ack).toHaveBeenCalled()
})
