const config = require('./utils/config')
const express = require('express')
const app = express()

const cors = require('cors')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const middleware = require('./utils/middleware')

const projectRouter = require('./controllers/projects')

mongoose.set('strictQuery', false)

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB')
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())

app.use('/api/projects', projectRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/tests')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
