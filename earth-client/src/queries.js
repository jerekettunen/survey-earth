import { gql } from '@apollo/client'

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
      id
      name
      description
      latitude
      longitude
    }
  }
`

export const ADD_PROJECT = gql`
  mutation AddProject(
    $name: String!
    $description: String
    $latitude: Float!
    $longitude: Float!
  ) {
    addProject(
      name: $name
      description: $description
      latitude: $latitude
      longitude: $longitude
    ) {
      id
      name
      description
      latitude
      longitude
    }
  }
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
