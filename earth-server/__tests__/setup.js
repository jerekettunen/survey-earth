const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')
const { beforeAll, afterAll, afterEach } = require('@jest/globals')

let mongoServer

// Setup before all tests
beforeAll(async () => {
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  // Only connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri)
    console.log('Connected to in-memory MongoDB')
  }
})

// Cleanup after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  if (mongoServer) {
    await mongoServer.stop()
  }
  console.log('Disconnected from in-memory MongoDB')
})

// Reset the database between tests
afterEach(async () => {
  if (mongoose.connection.readyState !== 0 && mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections()

    for (let collection of collections) {
      await collection.deleteMany({})
    }
  }
})
