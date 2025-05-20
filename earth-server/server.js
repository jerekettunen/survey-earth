const express = require('express')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const User = require('./models/user')

// Create a function that sets up the server but doesn't start listening
const createServer = async () => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        // Lambda-optimized settings
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        keepAlive: true,
      })
      console.log('Connected to MongoDB')
    } catch (error) {
      console.error('MongoDB connection error:', error)
      throw error
    }
  } else {
    console.log('Reusing existing MongoDB connection')
  }

  // Create Express app
  const app = express()

  // Create Apollo Server
  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const apolloServer = new ApolloServer({
    schema,
    introspection: true,
    formatError: (error) => {
      console.log(error)
      return error
    },
  })

  // Start Apollo Server
  await apolloServer.start()

  // Apply middleware
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === 'production'
          ? [process.env.FRONTEND_URL || 'https://your-frontend-domain.com']
          : 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  app.use(express.json())

  // Set up the GraphQL endpoint
  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith('Bearer ')) {
          const token = auth.substring(7)
          try {
            const decodedToken = jwt.verify(
              token,
              process.env.JWT_SECRET || 'test-secret'
            )
            const currentUser = await User.findById(decodedToken.id)
            return { currentUser }
          } catch (error) {
            console.error('Error verifying token:', error.message)
            return {}
          }
        }
        return {}
      },
    })
  )
  app.use(
    '/',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith('Bearer ')) {
          const token = auth.substring(7)
          try {
            const decodedToken = jwt.verify(
              token,
              process.env.JWT_SECRET || 'test-secret'
            )
            const currentUser = await User.findById(decodedToken.id)
            return { currentUser }
          } catch (error) {
            console.error('Error verifying token:', error.message)
            return {}
          }
        }
        return {}
      },
    })
  )

  return { app, apolloServer }
}

module.exports = { createServer }
