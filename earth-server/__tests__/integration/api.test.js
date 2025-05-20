/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const request = require('supertest')
const {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} = require('@jest/globals')
const { createServer } = require('../../server')
const User = require('../../models/user')
const Project = require('../../models/project')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

jest.mock('../../utils/SentinelHub', () => ({
  getAvailableImages: jest.fn().mockResolvedValue([
    {
      id: 'S2A_MSIL2A_20250115T102421_N0204_R065_T34VCE_20250115T134711',
      date: '2025-01-15T10:24:21Z',
      cloudCoverage: 12.5,
      source: 'sentinel-2-l2a',
      bandCombination: 'TRUE_COLOR',
    },
    {
      id: 'S2B_MSIL2A_20250127T102359_N0204_R065_T34VCE_20250127T141042',
      date: '2025-01-27T10:23:59Z',
      cloudCoverage: 8.2,
      source: 'sentinel-2-l2a',
      bandCombination: 'TRUE_COLOR',
    },
  ]),
  generateImageUrl: jest
    .fn()
    .mockResolvedValue('data:image/jpeg;base64,mockImageData'),
  _resetAuthTokenCache: jest.fn(),
}))

let app
let server
let testUser
let adminUser
let userToken
let adminToken

beforeAll(async () => {
  // Create the Express app and Apollo Server instance
  const { app: expressApp, apolloServer } = await createServer()
  app = expressApp
  server = apolloServer
})

afterAll(async () => {
  // Shutdown the server
  if (server) {
    await server.stop()
  }
})

// Create test users and tokens before each test
beforeEach(async () => {
  // Create a regular test user
  const passwordHash = await bcrypt.hash('password123', 10)
  testUser = new User({
    username: `user-${Date.now()}@example.com`, // Ensure unique email
    password: passwordHash,
  })
  await testUser.save()

  // Create an admin user
  adminUser = new User({
    username: `admin-${Date.now()}@example.com`,
    password: passwordHash,
  })
  await adminUser.save()

  // Generate tokens
  userToken = jwt.sign(
    { username: testUser.username, id: testUser._id.toString() },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  )

  adminToken = jwt.sign(
    { username: adminUser.username, id: adminUser._id.toString() },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  )
})

describe('Authentication API', () => {
  test('should allow user login with valid credentials', async () => {
    const loginMutation = `
      mutation {
        login(
          username: "${testUser.username}",
          password: "password123"
        ) {
          value
        }
      }
    `

    const response = await request(app)
      .post('/graphql')
      .send({ query: loginMutation })

    expect(response.status).toBe(200)
    expect(response.body.data.login).toBeTruthy()
    expect(response.body.data.login.value).toBeTruthy()
  })

  test('should reject login with invalid password', async () => {
    const loginMutation = `
      mutation {
        login(
          username: "${testUser.username}", 
          password: "wrongpassword"
        ) {
          value
        }
      }
    `

    const response = await request(app)
      .post('/graphql')
      .send({ query: loginMutation })

    expect(response.status).toBe(200)
    expect(response.body.errors).toBeTruthy()
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT')
  })
})

describe('Project API', () => {
  test('should create a new project when authenticated', async () => {
    const createProjectMutation = `
      mutation {
        addProject(
          name: "API Test Project",
          description: "Created via API test",
          latitude: 60.1699,
          longitude: 24.9384,
          type: "Research"
        ) {
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

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ query: createProjectMutation })

    expect(response.status).toBe(200)
    expect(response.body.data.addProject).toBeTruthy()
    expect(response.body.data.addProject.name).toBe('API Test Project')
    expect(response.body.data.addProject.status).toBe('Active')
  })

  test('should not create project without authentication', async () => {
    const createProjectMutation = `
      mutation {
        addProject(
          name: "Unauthorized Project",
          description: "This should fail",
          latitude: 60.1699,
          longitude: 24.9384,
          type: "Research"
        ) {
          id
          name
        }
      }
    `

    const response = await request(app)
      .post('/graphql')
      .send({ query: createProjectMutation })

    expect(response.status).toBe(200)
    expect(response.body.errors).toBeTruthy()
    expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED')
  })

  test('should fetch all projects for authenticated user', async () => {
    // Create test projects
    const project1 = await Project.create({
      name: 'Test Project 1',
      owner: testUser._id,
      description: 'First test project',
      latitude: 60.1699,
      longitude: 24.9384,
      type: 'Research',
      status: 'Active',
    })

    // Wait for 1 second to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const project2 = await Project.create({
      name: 'Test Project 2',
      owner: testUser._id,
      description: 'Second test project',
      latitude: 61.4978,
      longitude: 23.761,
      type: 'Monitoring',
      status: 'Active',
    })

    const projectsQuery = `
      query {
        projects {
          id
          name
          description
          type
          status
          latitude
          longitude
        }
      }
    `

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ query: projectsQuery })

    expect(response.status).toBe(200)
    expect(response.body.data.projects).toHaveLength(2)
    expect(response.body.data.projects[0].name).toBe('Test Project 2')
    expect(response.body.data.projects[1].name).toBe('Test Project 1')
  })

  test('should update a project when owner is authenticated', async () => {
    // Create a project to update
    const project = await Project.create({
      name: 'Project To Update',
      owner: testUser._id,
      description: 'Original description',
      latitude: 60.1699,
      longitude: 24.9384,
      type: 'Research',
      status: 'Active',
    })

    const updateProjectMutation = `
      mutation {
        updateProject(
          id: "${project._id}",
          name: "Updated Project Name",
          description: "Updated description"
        ) {
          id
          name
          description
        }
      }
    `

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ query: updateProjectMutation })

    expect(response.status).toBe(200)
    expect(response.body.data.updateProject).toBeTruthy()
    expect(response.body.data.updateProject.name).toBe('Updated Project Name')

    // Verify database update
    const updatedProject = await Project.findById(project._id)
    expect(updatedProject.name).toBe('Updated Project Name')
    expect(updatedProject.description).toBe('Updated description')
  })
})

describe('Collaborator API', () => {
  test('should add a collaborator to a project', async () => {
    // Create a project
    const project = await Project.create({
      name: 'Collaboration Project',
      owner: testUser._id,
      description: 'Project for testing collaboration',
      latitude: 60.1699,
      longitude: 24.9384,
      type: 'Research',
      status: 'Active',
    })

    const addCollaboratorMutation = `
      mutation {
        addCollaborator(
          projectId: "${project._id}",
          email: "${adminUser.username}",
          role: "Editor"
        ) {
          id
          name
          collaborators {
            user {
              username
            }
            role
          }
        }
      }
    `

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ query: addCollaboratorMutation })

    expect(response.status).toBe(200)
    expect(response.body.data.addCollaborator).toBeTruthy()
    expect(response.body.data.addCollaborator.collaborators).toHaveLength(1)
    expect(
      response.body.data.addCollaborator.collaborators[0].user.username
    ).toBe(adminUser.username)
    expect(response.body.data.addCollaborator.collaborators[0].role).toBe(
      'Editor'
    )
  })

  test('should remove a collaborator from a project', async () => {
    // Create a project with a collaborator
    const project = await Project.create({
      name: 'Remove Collaborator Project',
      owner: testUser._id,
      description: 'Project for testing collaboration removal',
      latitude: 60.1699,
      longitude: 24.9384,
      type: 'Research',
      status: 'Active',
      collaborators: [
        {
          user: adminUser._id,
          role: 'Editor',
          addedAt: new Date(),
        },
      ],
    })

    const removeCollaboratorMutation = `
      mutation {
        removeCollaborator(
          projectId: "${project._id}",
          userId: "${adminUser._id}"
        ) {
          id
          name
          collaborators {
            user {
              username
            }
          }
        }
      }
    `

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ query: removeCollaboratorMutation })

    expect(response.status).toBe(200)
    expect(response.body.data.removeCollaborator).toBeTruthy()
    expect(response.body.data.removeCollaborator.collaborators).toHaveLength(0)
  })
})

describe('Satellite Image API', () => {
  test('should fetch available satellite images for a project', async () => {
    // Create a project
    const project = await Project.create({
      name: 'Satellite Image Project',
      owner: testUser._id,
      description: 'Project for testing satellite imagery',
      latitude: 60.1699,
      longitude: 24.9384,
      type: 'Research',
      status: 'Active',
    })

    const availableImagesQuery = `
      query {
        getAvailableImagesForProject(
          projectId: "${project._id}",
          from: "2025-01-01",
          to: "2025-05-01",
          maxCloudCoverage: 30
        ) {
          id
          date
          cloudCoverage
          source
          bandCombination
        }
      }
    `

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ query: availableImagesQuery })

    // With our mock in place, we should now get successful data
    expect(response.status).toBe(200)
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.getAvailableImagesForProject).toHaveLength(2)
    expect(response.body.data.getAvailableImagesForProject[0].id).toBe(
      'S2A_MSIL2A_20250115T102421_N0204_R065_T34VCE_20250115T134711'
    )
  })
})
