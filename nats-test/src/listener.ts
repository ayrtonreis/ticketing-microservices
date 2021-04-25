import { connect, Message } from 'node-nats-streaming'
import { randomBytes } from 'crypto'

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

  const options = stan
    .subscriptionOptions()
    .setManualAckMode(true)

  const subscription = stan.subscribe(
    'ticket:created',
    'orders-service-queue-group',
    options,
  )

  subscription.on('message', (msg: Message) => {
    const data = msg.getData()
    if (typeof data === 'string') {
      console.log('Message received 📩')
      console.log(`Received Event ${msg.getSequence()}, with data: ${data}`)
    }
    msg.ack()
  })
})

// watch for interrupt signals and terminate signals
// to gracefully shutdown the client
process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())