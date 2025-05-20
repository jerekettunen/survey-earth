require('dotenv').config()
const { createServer } = require('./server')

// Start the server
const startServer = async () => {
  try {
    // We'll handle MongoDB connection in server.js for Lambda compatibility
    const { app } = await createServer()
    const PORT = process.env.PORT || 4000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer()
}

// Export the createServer function for testing
module.exports = { createServer }
