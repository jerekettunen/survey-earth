const typeDefs = `
type Project {
  id: ID!
  name: String!
  description: String
  latitude: Float!
  longitude: Float!
  type: String
  startDate: String
  endDate: String
  createdAt: String
}

type User {
  id: ID!
  username: String!
  password: String!
}

type Token {
  value: String!
}

type Query {
  projects: [Project!]!
  project(id: ID!): Project 
}

type Mutation {
  addProject(
    name: String!
    description: String
    latitude: Float!
    longitude: Float!
    type: String
    startDate: String
    endDate: String
  ): Project
  updateProject(
    id: ID!
    name: String
    description: String
    latitude: Float
    longitude: Float
    type: String
    startDate: String
    endDate: String
    createdAt: String
  ): Project
  createUser(
    username: String!
    password: String!
  ): User
  login(
    username: String!
    password: String!
  ): Token
}
`

module.exports = typeDefs
