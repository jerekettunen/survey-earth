const typeDefs = `
type Project {
  id: ID!
  name: String!
  description: String
  latitude: Float!
  longitude: Float!
}

type Query {
  projects: [Project!]!
}

type Mutation {
  addProject(
    name: String!
    description: String
    latitude: Float!
    longitude: Float!
  ): Project
}
`

module.exports = typeDefs
