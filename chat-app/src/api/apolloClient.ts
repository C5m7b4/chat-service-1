import { ApolloClient, InMemoryCache } from '@apollo/client';

const apolloClient = new ApolloClient({
  uri: `${process.env.API_GATEWAY_URI}/graphql`,
  cache: new InMemoryCache(),
  credentials: 'include',
});

export default apolloClient;
