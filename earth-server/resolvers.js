const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Project = require('./models/project')
const User = require('./models/user')
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
    addProject: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        })
      }
      const project = new Project({ ...args })
      const savedProject = await project.save()
      return savedProject
    },
    createUser: async (root, args) => {
      const saltRounds = 15
      const hashPassword = await bcrypt.hash(args.password, saltRounds)

      const user = new User({ ...args, password: hashPassword })
      const savedUser = await user.save()
      return savedUser
    },
    login: async (root, args) => {
      console.log('Login attempt with username:', args.username)
      const user = await User.findOne({ username: args.username })
      const passwordCorrect =
        user === null
          ? false
          : await bcrypt.compare(args.password, user.password)
      if (!(user && passwordCorrect)) {
        console.log('Wrong credentials')
        throw new GraphQLError('Wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }
      console.log('User found:', user)
      const userForToken = {
        username: user.username,
        id: user._id,
      }
      const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
        expiresIn: 60 * 60,
      })
      return { value: token }
    },
  },
}

module.exports = resolvers
