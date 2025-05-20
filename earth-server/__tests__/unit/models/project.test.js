const { describe, test, expect } = require('@jest/globals')
const mongoose = require('mongoose')
const Project = require('../../../models/project')

describe('Project Model', () => {
  test('should create a valid project', async () => {
    const ownerId = new mongoose.Types.ObjectId()
    const project = new Project({
      name: 'Test Project',
      owner: ownerId,
      description: 'A test project description',
      latitude: 60.1699,
      longitude: 24.9384,
      type: 'Research',
      status: 'Active',
    })

    await expect(project.validate()).resolves.not.toThrow()
  })

  test('should require a name', async () => {
    const ownerId = new mongoose.Types.ObjectId()
    const project = new Project({
      owner: ownerId,
      description: 'A test project description',
      latitude: 60.1699,
      longitude: 24.9384,
      type: 'Research',
      status: 'Active',
    })

    await expect(project.validate()).rejects.toThrow(/name.*required/)
  })

  test('should require an owner', async () => {
    const project = new Project({
      name: 'Test Project',
      description: 'A test project description',
      latitude: 60.1699,
      longitude: 24.9384,
      type: 'Research',
      status: 'Active',
    })

    await expect(project.validate()).rejects.toThrow(/owner.*required/)
  })

  test('should require latitude', async () => {
    const ownerId = new mongoose.Types.ObjectId()
    const project = new Project({
      name: 'Test Project',
      owner: ownerId,
      description: 'A test project description',
      longitude: 24.9384,
      type: 'Research',
      status: 'Active',
    })

    await expect(project.validate()).rejects.toThrow(/latitude.*required/)
  })

  test('should require longitude', async () => {
    const ownerId = new mongoose.Types.ObjectId()
    const project = new Project({
      name: 'Test Project',
      owner: ownerId,
      description: 'A test project description',
      latitude: 60.1699,
      type: 'Research',
      status: 'Active',
    })

    await expect(project.validate()).rejects.toThrow(/longitude.*required/)
  })

  test('should validate latitude range', async () => {
    const ownerId = new mongoose.Types.ObjectId()
    const invalidProject = new Project({
      name: 'Test Project',
      owner: ownerId,
      description: 'A test project description',
      latitude: 91, // Invalid: beyond 90°
      longitude: 24.9384,
      type: 'Research',
      status: 'Active',
    })

    await expect(invalidProject.validate()).rejects.toThrow(/latitude.*between/)
  })

  test('should validate longitude range', async () => {
    const ownerId = new mongoose.Types.ObjectId()
    const invalidProject = new Project({
      name: 'Test Project',
      owner: ownerId,
      description: 'A test project description',
      latitude: 60.1699,
      longitude: 181, // Invalid: beyond 180°
      type: 'Research',
      status: 'Active',
    })

    await expect(invalidProject.validate()).rejects.toThrow(
      /longitude.*between/
    )
  })

  test('should only allow valid project types', async () => {
    const ownerId = new mongoose.Types.ObjectId()
    const invalidProject = new Project({
      name: 'Test Project',
      owner: ownerId,
      description: 'A test project description',
      latitude: 60.1699,
      longitude: 24.9384,
      type: 'InvalidType', // Invalid type
      status: 'Active',
    })

    await expect(invalidProject.validate()).rejects.toThrow(
      /type.*not a valid enum value/
    )
  })

  test('should only allow valid project statuses', async () => {
    const ownerId = new mongoose.Types.ObjectId()
    const invalidProject = new Project({
      name: 'Test Project',
      owner: ownerId,
      description: 'A test project description',
      latitude: 60.1699,
      longitude: 24.9384,
      type: 'Research',
      status: 'InvalidStatus', // Invalid status
    })

    await expect(invalidProject.validate()).rejects.toThrow(
      /status.*not a valid enum value/
    )
  })

  test('should set default status to Active if not provided', async () => {
    const ownerId = new mongoose.Types.ObjectId()
    const project = new Project({
      name: 'Test Project',
      owner: ownerId,
      description: 'A test project description',
      latitude: 60.1699,
      longitude: 24.9384,
      type: 'Research',
      // No status provided
    })

    await expect(project.validate()).resolves.not.toThrow()
    expect(project.status).toBe('Active')
  })

  test('should allow collaborators to be added', async () => {
    const ownerId = new mongoose.Types.ObjectId()
    const collaboratorId = new mongoose.Types.ObjectId()

    const project = new Project({
      name: 'Test Project',
      owner: ownerId,
      description: 'A test project description',
      latitude: 60.1699,
      longitude: 24.9384,
      type: 'Research',
      status: 'Active',
      collaborators: [
        {
          user: collaboratorId,
          role: 'Editor',
        },
      ],
    })

    await expect(project.validate()).resolves.not.toThrow()
    expect(project.collaborators).toHaveLength(1)
    expect(project.collaborators[0].user).toEqual(collaboratorId)
    expect(project.collaborators[0].role).toBe('Editor')
  })
})
