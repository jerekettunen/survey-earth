const typeDefs = `
scalar DateTime

enum BandCombination {
  TRUE_COLOR    # RGB (B04, B03, B02)
  FALSE_COLOR   # NIR, Red, Green (B08, B04, B03)
}

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

type SatelliteImage {
  id: ID!
  date: DateTime!
  url: String
  thumbnail: String
  cloudCoverage: Float
  source: String!
  bandCombination: BandCombination!
  projectId: ID!
}

extend type Project {
  satelliteImages(from: DateTime, to: DateTime, maxCloudCoverage: Float): [SatelliteImage!]!
  latestSatelliteImage(bandCombination: BandCombination = TRUE_COLOR): SatelliteImage
}

type Query {
  projects: [Project!]!
  project(id: ID!): Project 
}

extend type Query {
  getAvailableImagesForProject(
    projectId: ID!, 
    from: DateTime, 
    to: DateTime, 
    maxCloudCoverage: Float = 30
  ): [SatelliteImage!]!
  
  getSatelliteImage(
    imageId: ID!, 
    projectId: ID!, 
    bandCombination: BandCombination = TRUE_COLOR, 
    customBands: [String!]
  ): SatelliteImage
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
  addCollaborator(
    projectId: ID!
    email: String!
    role: String!
  ): Project
  removeCollaborator(
    projectId: ID!
    userId: ID!
  ): Project
  updateCollaboratorRole(
    projectId: ID!
    userId: ID!
    role: String!
  ): Project
  deleteProject(id: ID!): Project
  deleteUser(id: ID!): User
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
