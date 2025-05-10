const router = require('express').Router()

const Project = require('../models/project')

router.get('/', async (request, response) => {
  const projects = await Project.find({})
  response.json(projects)
})

router.post('/', async (request, response) => {
  // Client side validation with zod
  const body = request.body
  console.log('body', body)
  if (!body.name || !body.description || !body.latitude || !body.longitude) {
    return response.status(400).json({ error: 'missing required fields' })
  }

  const project = new Project(body)

  const savedProject = await project.save()
  response.status(201).json(savedProject)
})

module.exports = router
