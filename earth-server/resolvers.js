const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Project = require('./models/project')
const User = require('./models/user')
const {
  requireAuth,
  requireProjectAdmin,
  requireProjectEditor,
} = require('./middleware/auth')

// Base resolvers without authentication checks
const baseResolvers = {
  Query: {
    projects: async (root, args, context) => {
      const projects = await Project.find({
        $or: [
          { owner: context.currentUser._id },
          { collaborators: context.currentUser._id },
        ],
      })
      return projects.map((project) => project.toJSON())
    },

    project: async (root, args) => {
      const project = await Project.findById(args.id)
      if (!project) return null
      return project.toJSON()
    },
  },

  Mutation: {
    addProject: async (root, args, context) => {
      const project = new Project({
        ...args,
        owner: context.currentUser._id,
      })
      console.log('Creating project with data:', project)
      const savedProject = await project.save()
      return savedProject.toJSON()
    },

    updateProject: async (root, args) => {
      try {
        const { id, ...updateData } = args
        const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        })

        if (!updatedProject) {
          throw new GraphQLError('Project not found', {
            extensions: { code: 'NOT_FOUND' },
          })
        }

        return updatedProject.toJSON()
      } catch (error) {
        throw new GraphQLError(`Failed to update project: ${error.message}`, {
          extensions: { code: 'DATABASE_ERROR' },
        })
      }
    },

    createUser: async (root, args) => {
      const saltRounds = 10
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
          extensions: { code: 'BAD_USER_INPUT' },
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

// Apply middleware to resolvers
const resolvers = {
  Query: {
    projects: requireAuth(baseResolvers.Query.projects),
    project: baseResolvers.Query.project, // No auth required for viewing a project
  },

  Mutation: {
    // Only needs authentication, no project permissions
    addProject: requireAuth(baseResolvers.Mutation.addProject),

    // Requires editor permissions (or higher)
    updateProject: requireProjectEditor(baseResolvers.Mutation.updateProject),

    // Requires admin permissions
    deleteProject: requireProjectAdmin(baseResolvers.Mutation.deleteProject),

    // Non-protected mutations
    createUser: baseResolvers.Mutation.createUser,
    login: baseResolvers.Mutation.login,
  },
}

module.exports = resolvers
