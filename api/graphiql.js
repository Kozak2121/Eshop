import { graphiqlExpress } from 'graphql-server-express';

const port = process.env.PORT || 3004;
const subscriptionsUrl = `ws://localhost:${port}`;

export default graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: subscriptionsUrl,
  query: '{\n}'
});
