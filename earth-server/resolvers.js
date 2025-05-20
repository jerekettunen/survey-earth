const { GraphQLError, GraphQLScalarType, Kind } = require('graphql')
const { getAvailableImages, generateImageUrl } = require('./utils/SentinelHub')
const {
  convertGeoJSONToBBox,
  createBBoxFromLatLong,
} = require('./utils/geoUtils')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Project = require('./models/project')
const User = require('./models/user')
const {
  requireAuth,
  requireProjectAdmin,
  requireProjectEditor,
} = require('./utils/middleware')

const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO-8601 formatted date string',
  serialize(value) {
    // Convert dates to ISO strings when sending to client
    return value instanceof Date ? value.toISOString() : value
  },
  parseValue(value) {
    return new Date(value)
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value)
    }
    return null
  },
})

// Base resolvers without authentication checks
const baseResolvers = {
  Query: {
    projects: async (root, args, context) => {
      const projects = await Project.find({
        $or: [
          { owner: context.currentUser._id },
          { 'collaborators.user': context.currentUser._id },
        ],
      }).sort({ createdAt: -1 })
      return projects.map((project) => project.toJSON())
    },

    project: async (root, args, context) => {
      const project = await Project.findById(args.id)
      if (!project) return null

      const isOwner =
        project.owner.toString() === context.currentUser._id.toString()
      const isCollaborator = project.collaborators.some(
        (c) =>
          c.user && c.user.toString() === context.currentUser._id.toString()
      )

      if (!isOwner && !isCollaborator) {
        throw new GraphQLError('Not authorized to access this project', {
          extensions: { code: 'FORBIDDEN' },
        })
      }

      return project.toJSON()
    },
    getAvailableImagesForProject: async (root, args) => {
      const { projectId, from, to, maxCloudCoverage = 30 } = args

      // Get project
      const project = await Project.findById(projectId)
      if (!project) {
        throw new GraphQLError('Project not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      // Get bounding box (either from project boundary or lat/long)
      let bbox
      if (project.boundary) {
        bbox = convertGeoJSONToBBox(project.boundary)
      } else {
        bbox = createBBoxFromLatLong(project.latitude, project.longitude)
      }

      try {
        const images = await getAvailableImages({
          bbox,
          fromDate: from,
          toDate: to,
          maxCloudCoverage,
          bandCombination: 'TRUE_COLOR',
        })

        return images.map((img) => ({
          ...img,
          projectId,
        }))
      } catch (error) {
        console.error(
          `Error fetching satellite images for project ${projectId}:`,
          error
        )
        throw new GraphQLError('Failed to fetch satellite images', {
          extensions: { code: 'API_ERROR' },
        })
      }
    },
    getSatelliteImage: async (root, args) => {
      const { imageId, projectId, bandCombination = 'TRUE_COLOR' } = args

      // Get project
      const project = await Project.findById(projectId)
      if (!project) {
        throw new GraphQLError('Project not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      // Get bounding box
      let bbox
      if (project.boundary) {
        bbox = convertGeoJSONToBBox(project.boundary)
      } else {
        bbox = createBBoxFromLatLong(project.latitude, project.longitude)
      }

      try {
        // Generate image URL with the requested band combination
        const url = await generateImageUrl({
          imageId,
          bbox,
          bandCombination,
        })

        // Generate thumbnail
        const thumbnail = await generateImageUrl({
          imageId,
          bbox,
          bandCombination,
          width: 128,
          height: 128,
        })

        return {
          id: imageId,
          date: imageId.split('_')[0], // Extract date from ID
          url,
          thumbnail,
          source: 'sentinel-2-l2a',
          bandCombination,
          projectId,
        }
      } catch (error) {
        console.error('Error generating satellite image URL:', error)
        throw new GraphQLError('Failed to generate satellite image', {
          extensions: { code: 'API_ERROR' },
        })
      }
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
    deleteProject: async (root, args) => {
      const response = await Project.findByIdAndDelete(args.id)
      if (!response) {
        throw new GraphQLError('Project not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }
      return response.toJSON()
    },
    addCollaborator: async (root, args) => {
      const project = await Project.findById(args.projectId)
      if (!project) {
        throw new GraphQLError('Project not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }
      const user = await User.findOne({ username: args.email })
      if (!user) {
        throw new GraphQLError('User not found with that email', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      const existingCollaborator = project.collaborators.some(
        (collab) =>
          collab.user && collab.user.toString() === user._id.toString()
      )
      if (existingCollaborator) {
        throw new GraphQLError('User already a collaborator', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }
      const collaborator = {
        user: user._id,
        role: args.role || 'Viewer',
        addedAt: new Date(),
      }
      project.collaborators.push(collaborator)
      await project.save()
      return project.toJSON()
    },
    removeCollaborator: async (root, args) => {
      const project = await Project.findById(args.projectId)
      if (!project) {
        throw new GraphQLError('Project not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }
      const collaboratorIndex = project.collaborators.findIndex(
        (collab) => collab.user.toString() === args.userId
      )
      if (collaboratorIndex === -1) {
        throw new GraphQLError('Collaborator not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }
      project.collaborators.splice(collaboratorIndex, 1)
      await project.save()
      return project.toJSON()
    },
    updateCollaboratorRole: async (root, args) => {
      const project = await Project.findById(args.projectId)
      if (!project) {
        throw new GraphQLError('Project not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }
      const collaborator = project.collaborators.find(
        (collab) => collab.user.toString() === args.userId
      )
      if (!collaborator) {
        throw new GraphQLError('Collaborator not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }
      collaborator.role = args.role
      await project.save()
      return project.toJSON()
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
      if (!user) {
        console.log('User not found:', args.username)
        throw new GraphQLError('Wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const passwordCorrect = await bcrypt.compare(args.password, user.password)
      if (!passwordCorrect) {
        console.log('Password incorrect for user:', args.username)
        throw new GraphQLError('Wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      console.log('Password correct, generating token')
      const userForToken = {
        username: user.username,
        id: user._id.toString(),
      }
      const token = jwt.sign(
        userForToken,
        process.env.JWT_SECRET || 'test-secret',
        {
          expiresIn: 60 * 60,
        }
      )
      console.log('Token generated successfully')
      return { value: token }
    },
  },
}

// Apply middleware to resolvers
const resolvers = {
  Query: {
    projects: requireAuth(baseResolvers.Query.projects),
    project: requireAuth(baseResolvers.Query.project),
    getAvailableImagesForProject: requireAuth(
      baseResolvers.Query.getAvailableImagesForProject
    ),
    getSatelliteImage: requireAuth(baseResolvers.Query.getSatelliteImage),
  },

  Mutation: {
    addProject: requireAuth(baseResolvers.Mutation.addProject),

    updateProject: requireProjectEditor(baseResolvers.Mutation.updateProject),

    deleteProject: requireProjectAdmin(baseResolvers.Mutation.deleteProject),

    addCollaborator: requireProjectAdmin(
      baseResolvers.Mutation.addCollaborator
    ),
    removeCollaborator: requireProjectAdmin(
      baseResolvers.Mutation.removeCollaborator
    ),
    updateCollaboratorRole: requireProjectAdmin(
      baseResolvers.Mutation.updateCollaboratorRole
    ),

    // Non-protected mutations
    createUser: baseResolvers.Mutation.createUser,
    login: baseResolvers.Mutation.login,
  },
}

const customResolvers = {
  DateTime: DateTimeScalar,

  Project: {
    id: (project) => project?._id?.toString() || null,
    owner: async (project) => {
      // Add detailed logging
      console.log('Resolving project owner:', {
        projectId: project?._id?.toString(),
        ownerRef: project?.owner,
      })

      // If owner is just an ID reference (not populated)
      if (!project || !project.owner) {
        console.error('Project has no owner reference:', project?._id)
        return {
          id: 'no-owner',
          username: 'Unknown Owner',
          ownedProjects: [],
          joinedProjects: [],
        }
      }

      try {
        // Handle both populated and unpopulated cases
        if (typeof project.owner === 'object' && !project.owner.username) {
          const ownerId = project.owner.toString()
          console.log(`Looking up owner: ${ownerId}`)

          const owner = await User.findById(ownerId)
          if (!owner) {
            console.error(`Owner not found for ID: ${ownerId}`)
            return {
              id: ownerId,
              username: 'Deleted User',
              ownedProjects: [],
              joinedProjects: [],
            }
          }

          return {
            id: ownerId,
            username: owner.username,
            ownedProjects: [],
            joinedProjects: [],
          }
        }

        // Already populated - ensure ID is a string
        const ownerId = project.owner._id.toString()
        console.log(`Owner already populated: ${ownerId}`)

        return {
          id: ownerId, // Use _id directly, don't let it go through User.id resolver
          username: project.owner.username,
          ownedProjects: [],
          joinedProjects: [],
        }
      } catch (error) {
        console.error('Error resolving owner:', error)
        return {
          id: 'error-' + Date.now(),
          username: 'Error User',
          ownedProjects: [],
          joinedProjects: [],
        }
      }
    },
    collaborators: async (project) => {
      // Handle null/undefined collaborators by returning empty array
      if (!project.collaborators) {
        console.log(
          'Project has no collaborators array:',
          project.id || project._id
        )
        return []
      }

      // Filter out any null values before processing
      const validCollaborators = project.collaborators.filter(
        (collab) => collab && collab.user
      )

      // Process valid collaborators
      const collaboratorPromises = validCollaborators.map(async (collab) => {
        try {
          // If user is just an ID reference (not populated)
          if (typeof collab.user === 'object' && !collab.user.username) {
            const userId = collab.user.toString()
            const user = await User.findById(userId)

            // If user doesn't exist, skip this collaborator
            if (!user) {
              console.log(`Referenced user ${userId} not found`)
              return null
            }

            return {
              user: {
                id: userId,
                username: user.username,
                ownedProjects: [],
                joinedProjects: [],
              },
              role: collab.role || 'viewer',
              addedAt: collab.addedAt || new Date(),
            }
          }

          // User is populated - use directly
          return {
            user: {
              id: collab.user._id.toString(),
              username: collab.user.username,
              ownedProjects: [],
              joinedProjects: [],
            },
            role: collab.role || 'viewer',
            addedAt: collab.addedAt || new Date(),
          }
        } catch (error) {
          console.error('Error processing collaborator:', error)
          return null
        }
      })

      // Remove any nulls that might have been returned due to errors
      const resolvedCollaborators = await Promise.all(collaboratorPromises)
      return resolvedCollaborators.filter(Boolean)
    },
    satelliteImages: async (project, { from, to, maxCloudCoverage = 30 }) => {
      // Default to last 3 months if dates not specified
      const toDate = to || new Date().toISOString()
      const fromDate =
        from || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

      // Get bounding box
      let bbox
      if (project.boundary) {
        bbox = convertGeoJSONToBBox(project.boundary)
      } else {
        bbox = createBBoxFromLatLong(project.latitude, project.longitude)
      }

      try {
        const images = await getAvailableImages({
          bbox,
          fromDate,
          toDate,
          maxCloudCoverage,
        })

        return images.map((img) => ({
          ...img,
          projectId: project._id.toString(),
        }))
      } catch (error) {
        console.error(
          `Error fetching satellite images for project ${project._id}:`,
          error
        )
        // Return empty array instead of throwing to avoid breaking the entire project query
        return []
      }
    },
    latestSatelliteImage: async (
      project,
      { bandCombination = 'TRUE_COLOR' }
    ) => {
      // Get bbox
      let bbox
      if (project.boundary) {
        bbox = convertGeoJSONToBBox(project.boundary)
      } else {
        bbox = createBBoxFromLatLong(project.latitude, project.longitude)
      }

      // Get last 30 days of images
      const toDate = new Date().toISOString()
      const fromDate = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString()

      try {
        const images = await getAvailableImages({
          bbox,
          fromDate,
          toDate,
          maxCloudCoverage: 30,
        })

        if (images.length === 0) {
          return null
        }

        // Sort by date (newest first) and get first
        const latestImage = images.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        )[0]

        // Generate URL with the requested band combination
        const url = await generateImageUrl({
          imageId: latestImage.id,
          bbox,
          bandCombination,
        })

        // Generate thumbnail
        const thumbnail = await generateImageUrl({
          imageId: latestImage.id,
          bbox,
          bandCombination,
          width: 128,
          height: 128,
        })

        return {
          ...latestImage,
          url,
          thumbnail,
          bandCombination,
          projectId: project._id.toString(),
        }
      } catch (error) {
        console.error(
          `Error fetching latest satellite image for project ${project._id}:`,
          error
        )
        return null
      }
    },
  },

  User: {
    id: (user) => {
      if (!user) {
        console.error('NULL USER OBJECT received in User.id resolver')
        return 'missing-user-id'
      }

      // Check for both _id and id fields!
      if (user._id) {
        return user._id.toString()
      }

      // If we only have id (from a previous resolver), use that
      if (user.id) {
        console.log('Using existing id field:', user.id)
        return user.id
      }

      console.error('User object with no id fields:', JSON.stringify(user))
      return 'no-id-' + Math.random().toString(36).substring(2, 7)
    },
    password: () => null, // Never return actual password
    ownedProjects: async (user) => {
      const projects = await Project.find({ owner: user._id })
      return projects.map((p) => ({
        id: p._id.toString(),
      }))
    },
    joinedProjects: async (user) => {
      const projects = await Project.find({ 'collaborators.user': user._id })
      return projects.map((p) => ({
        id: p._id.toString(),
      }))
    },
  },

  Collaborator: {
    user: async (collab) => {
      console.log(
        'Collaborator.user resolver called with:',
        JSON.stringify(collab)
      )

      if (!collab || !collab.user) {
        console.error('NULL COLLABORATOR OBJECT in Collaborator.user resolver')
        // Return placeholder user instead of null to satisfy non-nullable requirement
        return {
          id: 'missing-user-id',
          username: 'Unknown User',
          ownedProjects: [],
          joinedProjects: [],
        }
      }

      try {
        // Check if the user object is already resolved with username
        if (typeof collab.user === 'object' && collab.user.username) {
          console.log('User already resolved:', collab.user.id)
          return {
            id: collab.user.id,
            username: collab.user.username,
            ownedProjects: [],
            joinedProjects: [],
          }
        }

        // This is for MongoDB ObjectId references
        if (
          typeof collab.user === 'object' &&
          collab.user.toString &&
          !collab.user.username
        ) {
          const userId = collab.user.toString()
          console.log(`Finding user with ID: ${userId}`)

          const user = await User.findById(userId)
          if (!user) {
            console.log(`No user found with ID: ${userId}`)
            return {
              id: userId,
              username: 'Deleted User',
              ownedProjects: [],
              joinedProjects: [],
            }
          }

          return {
            id: userId,
            username: user.username,
            ownedProjects: [],
            joinedProjects: [],
          }
        }

        if (typeof collab.user === 'string') {
          const user = await User.findById(collab.user)
          if (!user) return null

          return {
            id: collab.user,
            username: user.username,
            ownedProjects: [],
            joinedProjects: [],
          }
        }

        // Unknown type - log and return placeholder
        console.error('Unhandled collaborator user type:', typeof collab.user)
        return {
          id: 'type-error-' + Date.now(),
          username: 'Type Error User',
          ownedProjects: [],
          joinedProjects: [],
        }
      } catch (err) {
        console.error('Error processing collaborator user:', err)
        return {
          id: 'error-user-' + Date.now(),
          username: 'Error User',
          ownedProjects: [],
          joinedProjects: [],
        }
      }
    },
  },
}

// Merge all resolvers and export
module.exports = {
  ...resolvers,
  ...customResolvers,
}
