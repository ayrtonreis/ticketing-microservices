import * as nats from 'node-nats-streaming'

// NATS convention: stan is NATS backwards (an instance of NATS)
const stan = nats.connect('ticketing', 'client-id', {
  url: 'http://localhost:4222',
})

console.clear()

stan.on('connect', () => {
  console.log('Publisher connected to NATS! 🚀')

  const data = JSON.stringify({
    id: '1234',
    title: 'Concert',
    price: 20,
  })

  stan.publish('ticket:created', data, () => console.log('Event published ⭐️'))
})

