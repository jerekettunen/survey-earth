const typeDefs = `
scalar DateTime

type Project {
    id: ID!
    name: String!
    description: String
    latitude: Float!
    longitude: Float!
    type: String
    startDate: DateTime
    endDate: DateTime
    createdAt: DateTime
    owner: User!
    collaborators: [Collaborator!]!
    status: String
  }
  
  type Collaborator {
    user: User!
    role: String!
    addedAt: DateTime
  }

type User {
  id: ID!
  username: String!
  password: String!
  ownedProjects: [Project!]!
  joinedProjects: [Project!]!
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
