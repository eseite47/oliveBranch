import React from 'react'
import ReactDOM from 'react-dom'

import './styles/index.css'
import App from './components/App'
import { AUTH_TOKEN } from './constants'

// 1
import registerServiceWorker from './registerServiceWorker'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { BrowserRouter } from 'react-router-dom'
import { ApolloLink, split } from 'apollo-client-preset'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

// 2
const httpLink = new HttpLink({ uri: 'http://localhost:4000' })

const middlewareAuthLink = new ApolloLink((operation, forward) => {
	const token = localStorage.getItem(AUTH_TOKEN)
	const authorizationHeader = token ? `Bearer ${token}` : null
	operation.setContext({
	  headers: {
		authorization: authorizationHeader
	  }
	})
	return forward(operation)
  })
  
  const httpLinkWithAuthToken = middlewareAuthLink.concat(httpLink)

// 3

/*
You’re instantiating a WebSocketLink that knows the subscriptions endpoint. 
The subscriptions endpoint in this case is similar to the HTTP endpoint, except that it uses the ws instead of http protocol. 
Notice that you’re also authenticating the websocket connection with the user’s token that you retrieve from localStorage
*/

const wsLink = new WebSocketLink({
	uri: `ws://localhost:4000`,
	options: {
	  reconnect: true,
	  connectionParams: {
		authToken: localStorage.getItem(AUTH_TOKEN),
	  }
	}
})

/*
split is used to “route” a request to a specific middleware link. 
It takes three arguments, the first one is a test function which returns a boolean. 
The remaining two arguments are again of type ApolloLink. 
If test returns true, the request will be forwarded to the link passed as the second argument. If false, to the third one. 
*/
  
const link = split(
	({ query }) => {
		const { kind, operation } = getMainDefinition(query)
		return kind === 'OperationDefinition' && operation === 'subscription'
	},
	wsLink,
	httpLinkWithAuthToken,
)

const client = new ApolloClient({
	link,
	cache: new InMemoryCache()
})

// 4
ReactDOM.render(
	<BrowserRouter>
		<ApolloProvider client={client}>
			<App />
		</ApolloProvider>
	</BrowserRouter>,
	document.getElementById('root'),
)

registerServiceWorker()