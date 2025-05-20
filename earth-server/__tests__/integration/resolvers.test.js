/* eslint-disable no-unused-vars */
const request = require('supertest')
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals')
const { createServer } = require('../../server')
const Project = require('../../models/project')
const User = require('../../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

let app
let server

beforeAll(async () => {
  // Create the Express app and Apollo Server
  const { app: expressApp, apolloServer } = await createServer()
  app = expressApp
  server = apolloServer
})

afterAll(async () => {
  // Shutdown the server
  await server.stop()
})

describe('GraphQL API Integration', () => {
  test('should return all projects for authenticated user', async () => {
    // Create a test user with proper password hashing
    const passwordHash = await bcrypt.hash('testpassword', 10)
    const user = new User({
      username: 'testuser@example.com',
      password: passwordHash,
    })
    await user.save()

    const project1 = await Project.create({
      name: 'Test Project 1',
      owner: user._id,
      description: 'First test project',
      latitude: 60.1699,
      longitude: 24.9384,
      type: 'Research',
      status: 'Active',
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

    const project2 = await Project.create({
      name: 'Test Project 2',
      owner: user._id,
      description: 'Second test project',
      latitude: 61.4978,
      longitude: 23.761,
      type: 'Monitoring',
      status: 'Active',
    })

    const token = jwt.sign(
      {
        username: user.username,
        id: user._id.toString(),
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    )
    const query = `
      query {
        projects {
          id
          name
          description
          latitude
          longitude
          type
          status
        }
      }
    `

    // Make the request
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({ query })

    // Check the response
    expect(response.status).toBe(200)
    expect(response.body.data.projects).toHaveLength(2)
    expect(response.body.data.projects[0].name).toBe('Test Project 2')
    expect(response.body.data.projects[0].latitude).toBe(61.4978)
    expect(response.body.data.projects[1].name).toBe('Test Project 1')
    expect(response.body.data.projects[1].latitude).toBe(60.1699)
  })

  test('should be able to create a new project', async () => {
    // Create and login a user
    const passwordHash = await bcrypt.hash('testpassword', 10)
    const user = new User({
      username: 'projectcreator@example.com',
      password: passwordHash,
    })
    await user.save()

    const token = jwt.sign(
      { username: user.username, id: user._id.toString() },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    )

    // GraphQL mutation to create a project
    const mutation = `
      mutation {
        addProject(
          name: "New Test Project",
          description: "Created via test",
          latitude: 65.0121,
          longitude: 25.4651,
          type: "Monitoring"
        ) {
          id
          name
          description
          latitude
          longitude
        }
      }
    `

    // Make the request
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({ query: mutation })

    // Check the response
    expect(response.status).toBe(200)
    expect(response.body.data.addProject).toBeTruthy()
    expect(response.body.data.addProject.name).toBe('New Test Project')
    expect(response.body.data.addProject.latitude).toBe(65.0121)

    // Verify the project was actually saved to the database
    const projectId = response.body.data.addProject.id
    const savedProject = await Project.findById(projectId)
    expect(savedProject).toBeTruthy()
    expect(savedProject.name).toBe('New Test Project')
  })
})
