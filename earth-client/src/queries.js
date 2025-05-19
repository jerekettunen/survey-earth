import { gql } from '@apollo/client'

const PROJECT_FIELDS = gql`
  fragment ProjectFields on Project {
    id
    name
    description
    latitude
    longitude
    type
    status
    startDate
    endDate
    createdAt
    owner {
      id
      username
    }
    collaborators {
      user {
        id
        username
      }
      role
    }
  }
`

export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      description
      latitude
      longitude
    }
  }
`

export const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      ...ProjectFields
    }
  }
  ${PROJECT_FIELDS}
`

export const ADD_PROJECT = gql`
  mutation AddProject(
    $name: String!
    $description: String
    $latitude: Float!
    $longitude: Float!
    $type: String
    $startDate: String
    $endDate: String
  ) {
    addProject(
      name: $name
      description: $description
      latitude: $latitude
      longitude: $longitude
      type: $type
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      name
      description
      latitude
      longitude
    }
  }
`

export const UPDATE_PROJECT = gql`
  mutation UpdateProject(
    $id: ID!
    $name: String
    $description: String
    $latitude: Float
    $longitude: Float
    $type: String
    $startDate: String
    $endDate: String
  ) {
    updateProject(
      id: $id
      name: $name
      description: $description
      latitude: $latitude
      longitude: $longitude
      type: $type
      startDate: $startDate
      endDate: $endDate
    ) {
      ...ProjectFields
    }
  }
  ${PROJECT_FIELDS}
`

export const CREATE_USER = gql`
  mutation CreateUser($username: String!, $password: String!) {
    createUser(username: $username, password: $password) {
      id
      username
    }
  }
`
export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      id
      name
    }
  }
`
export const ADD_COLLABORATOR = gql`
  mutation AddCollaborator($projectId: ID!, $email: String!, $role: String!) {
    addCollaborator(projectId: $projectId, email: $email, role: $role) {
      id
      name
      collaborators {
        user {
          id
          username
        }
        role
      }
    }
  }
`
export const REMOVE_COLLABORATOR = gql`
  mutation RemoveCollaborator($projectId: ID!, $userId: ID!) {
    removeCollaborator(projectId: $projectId, userId: $userId) {
      id
      name
      collaborators {
        user {
          id
          username
        }
        role
      }
    }
  }
`
export const UPDATE_COLLABORATOR_ROLE = gql`
  mutation UpdateCollaboratorRole(
    $projectId: ID!
    $userId: ID!
    $role: String!
  ) {
    updateCollaboratorRole(
      projectId: $projectId
      userId: $userId
      role: $role
    ) {
      id
      name
      collaborators {
        user {
          id
          username
        }
        role
      }
    }
  }
`
