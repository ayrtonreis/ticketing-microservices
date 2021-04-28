import * as nats from 'node-nats-streaming'
import { TicketCreatedPublisher } from './events/ticket-created-publisher'

// NATS convention: stan is NATS backwards (an instance of NATS)
const stan = nats.connect('ticketing', 'client-id', {
  url: 'http://localhost:4222',
})

console.clear()

stan.on('connect', async () => {
  console.log('Publisher connected to NATS! 🚀')

  const publisher = new TicketCreatedPublisher(stan)
  await publisher.publish({
    id: 'id-123',
    title: 'concert',
    price: 0,
  })

  // const data = JSON.stringify({
  //   id: '1234',
  //   title: 'Concert',
  //   price: 20,
  // })
  //
  // stan.publish('ticket:created', data, () => console.log('Event published ⭐️'))
})

