import { Message } from 'node-nats-streaming'
import { Listener, OrderCreatedEvent, Subjects } from '@ars-tickets/common'

import { Ticket } from '../../models/tickets'
import { queueGroupName } from './queueGroupName'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id)

    if (!ticket) {
      throw Error('Ticket not found')
    }

    // mark the ticket as been reserved by setting the orderId property
    ticket.set({ orderId: data.id })

    // save the ticket
    await ticket.save()
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      orderId: ticket.orderId,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
    })

    // acknowledge the message
    msg.ack()
  }
}
