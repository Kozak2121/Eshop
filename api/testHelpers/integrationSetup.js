import chai from 'chai';
import chaiHttp from 'chai-http';
import WebSocket from 'ws';
import { getOperationAST } from 'graphql';
import { createApolloFetch } from 'apollo-fetch';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { ApolloLink } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';

let server;
let apollo;

beforeAll(async () => {
  chai.use(chaiHttp);
  const fetch = createApolloFetch({
    uri: `http://localhost:3004/graphql`
  });
  const cache = new InMemoryCache();
  const link = ApolloLink.split(
    operation => {
      const operationAST = getOperationAST(
        operation.query,
        operation.operationName
      );
      return !!operationAST && operationAST.operation === 'subscription';
    },
    new WebSocketLink({
      uri: `ws://localhost:3004/graphql`,
      webSocketImpl: WebSocket
    }),
    new BatchHttpLink({ fetch })
  );

  apollo = new ApolloClient({
    link: ApolloLink.from([link]),
    cache
  });
});

afterAll(() => {
  if (server) {
    server.close();
  }
});

export const getServer = async () =>
  (server = require('../test-server').server);
export const getApollo = () => apollo;
