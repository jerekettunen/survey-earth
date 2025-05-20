const { createServer } = require('./server')
const serverless = require('serverless-http')

// Global variable to maintain connection between Lambda invocations
let cachedServer

exports.handler = async (event, context) => {
  // Keep MongoDB connection alive between invocations
  context.callbackWaitsForEmptyEventLoop = false

  if (!cachedServer) {
    console.log('Cold start: Creating new server instance')
    const { app } = await createServer()
    cachedServer = serverless(app)
  }

  return cachedServer(event, context)
}
