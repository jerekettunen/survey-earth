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
    project: async (root, args) => {
      return Project.findById(args.id)
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
