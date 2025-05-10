// const { GraphQLError } = require('graphql')
// const jwt = require('jsonwebtoken')
const Project = require('./models/project')

// const { PubSub } = require('graphql-subscriptions')
// const pubsub = new PubSub()

const resolvers = {
  Query: {
    projects: async () => {
      return Project.find({})
    },
  },
  Mutation: {
    addProject: async (root, args) => {
      const project = new Project({ ...args })
      const savedProject = await project.save()
      return savedProject
    },
  },
}

module.exports = resolvers
