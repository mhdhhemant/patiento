import { split  } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { backendGraphqlServerURL} from './conf/config'
import { auth } from './Auth/Auth';


const { getAccessToken } = auth;

const wsLink = new WebSocketLink({
  uri: `wss://${backendGraphqlServerURL}`,
  options: {
    reconnect: true,
    timeout: 30000,
    lazy:true,
    connectionParams:
     {
      headers: { 'Authorization': `Bearer ${getAccessToken()}`}
    }
  }
});

// Create an http link:
const httpLink = new HttpLink({
  uri: `https://${backendGraphqlServerURL}`,
  credentials: 'same-origin'
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
//  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      'Authorization': `Bearer ${getAccessToken()}`
    }
  }
});


// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink),
);

export default   new ApolloClient({
  link: link,
  cache: new InMemoryCache()
});
