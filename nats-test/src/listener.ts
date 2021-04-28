import { connect } from 'node-nats-streaming'
import { randomBytes } from 'crypto'

import { TicketCreatedListener } from './events/ticket-created-listener'

const stan = connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
})

console.clear()

stan.on('connect', () => {
  console.log('Listener connected to NATS')

  stan.on('close', () => {
    console.log('NATS connection closed 👋')
    process.exit()
  })

  new TicketCreatedListener(stan).listen()
})

// watch for interrupt signals and terminate signals
// to gracefully shutdown the client
process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())

