const { GraphQLError } = require('graphql')
const Project = require('../models/project')

// Authentication middleware
const requireAuth = (next) => async (root, args, context, info) => {
  if (!context.currentUser) {
    throw new GraphQLError('Not authenticated', {
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    })
  }

  return next(root, args, context, info)
}

// Check if user has required permission level for the project
const requireProjectPermission =
  (requiredRole) => (next) => async (root, args, context, info) => {
    if (!context.currentUser) {
      throw new GraphQLError('Not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      })
    }

    // Only apply to operations that have a project id
    if (args.id) {
      const project = await Project.findById(args.id)
      if (!project) {
        throw new GraphQLError('Project not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      // Check if user is the owner (always has admin rights)
      const isOwner =
        project.owner.toString() === context.currentUser._id.toString()

      if (isOwner) {
        // Owner has all permissions
        context.project = project
        return next(root, args, context, info)
      }

      // Check collaborator permissions
      const collaborator = project.collaborators.find(
        (c) =>
          c.user && c.user.toString() === context.currentUser._id.toString()
      )

      if (!collaborator) {
        throw new GraphQLError('Not authorized to access this project', {
          extensions: { code: 'FORBIDDEN' },
        })
      }

      // Check role-based permissions
      const userRole = collaborator.role

      // Admin can do everything
      if (userRole === 'admin') {
        context.project = project
        return next(root, args, context, info)
      }

      // Editor can edit but not delete
      if (requiredRole === 'editor' && userRole === 'editor') {
        context.project = project
        return next(root, args, context, info)
      }

      // If we got here, the user doesn't have sufficient permissions
      throw new GraphQLError(
        `You need ${requiredRole} permission for this action`,
        {
          extensions: { code: 'FORBIDDEN' },
        }
      )
    }

    return next(root, args, context, info)
  }

module.exports = {
  requireAuth,
  requireProjectPermission,
  // Convenience methods for common permission levels
  requireProjectEditor: requireProjectPermission('editor'),
  requireProjectAdmin: requireProjectPermission('admin'),
}
