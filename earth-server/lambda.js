const { createServer } = require('./server')
const serverless = require('serverless-http')

// Global variable to maintain connection between Lambda invocations
let cachedServer

exports.handler = async (event, context) => {
  console.log('Lambda starting with event type:', typeof event)
  console.log('Environment variables check:', {
    NODE_ENV: process.env.NODE_ENV,
    hasMongoURI: !!process.env.MONGODB_URI,
    hasJWT: !!process.env.JWT_SECRET,
    hasBucket: !!process.env.S3_THUMB_BUCKET_NAME,
    hasCloudfront: !!process.env.CLOUDFRONT_DOMAIN,
  })
  // Keep MongoDB connection alive between invocations
  context.callbackWaitsForEmptyEventLoop = false

  if (!cachedServer) {
    console.log('Cold start: Creating new server instance')
    const { app } = await createServer()
    cachedServer = serverless(app)
  }

  return cachedServer(event, context)
}
