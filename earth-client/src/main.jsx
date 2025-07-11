import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  split,
  from,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('user-token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      console.error(`[GraphQL error]: ${message}`)

      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED') {
        localStorage.removeItem('user-token')
        // Use window.location instead of referencing client
        setTimeout(() => {
          window.location.href = '/login'
        }, 0)
      }
    })
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
  }
})

const httpLink = createHttpLink({
  uri: `${API_URL}/graphql`,
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: API_URL.replace('http://', 'ws://').replace('https://', 'wss://'),
  })
)

const httpAuthLink = from([errorLink, authLink, httpLink])

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpAuthLink
)

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
})

const clearCacheAndRedirect = () => {
  localStorage.removeItem('user-token')
  client.clearStore().then(() => {
    window.location.href = '/login'
  })
}

window.clearApolloCache = clearCacheAndRedirect

ReactDOM.createRoot(document.getElementById('root')).render(
  <ApolloProvider client={client}>
    <Router>
      <App />
    </Router>
  </ApolloProvider>
)
