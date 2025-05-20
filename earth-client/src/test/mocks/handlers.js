import { graphql } from 'msw'

export const handlers = [
  graphql.mutation('Login', (req, res, ctx) => {
    const { username, password } = req.variables

    if (username === 'test@example.com' && password === 'password123') {
      return res(ctx.data({ login: { value: 'mock-jwt-token' } }))
    }

    return res(
      ctx.errors([
        {
          message: 'Invalid username or password',
          extensions: { code: 'BAD_USER_INPUT' },
        },
      ])
    )
  }),

  graphql.query('GetProjects', (req, res, ctx) => {
    return res(
      ctx.data({
        projects: [
          {
            id: 'project-1',
            name: 'Test Project',
            description: 'A test project',
            latitude: 60.1699,
            longitude: 24.9384,
            type: 'Research',
            status: 'Active',
            owner: { id: 'user-1', username: 'test@example.com' },
            collaborators: [],
          },
        ],
      })
    )
  }),
]
