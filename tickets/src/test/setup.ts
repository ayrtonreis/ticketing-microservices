import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

jest.mock('../nats-wrapper')

declare global {
  namespace NodeJS {
    interface Global {
      getSigninCookie(): string[]
    }
  }
}

let mongo: any

beforeAll(async () => {
  process.env.JWT_KEY = 'test_jwt_key'

  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

beforeEach(async () => {
  jest.clearAllMocks()
  const collections = await mongoose.connection.db.collections()

  for (const collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  await mongo.stop()
  await mongoose.connection.close()
})

global.getSigninCookie = () => {
  // Build a JWT payload. { id, email }
  const payload = {
    id: mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  }

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!)

  // Build session Object { jwt }
  const session = { jwt: token }

  // Turn that session into json
  const sessionJSON = JSON.stringify(session)

  // Take JSON and turn it into base 64
  const base64 = Buffer.from(sessionJSON).toString('base64')

  // return a string: the cookie with the encoded data
  return [`express:sess=${base64}`]
}