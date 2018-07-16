import { makeExecutableSchema, addErrorLoggingToSchema } from 'graphql-tools';
import { PubSub } from 'graphql-subscriptions';
import { addApolloLogging } from 'apollo-logger';

import modules from './modules';
import rootSchema from './root-schema.graphql';
import { logger } from './winston';

const pubsub = addApolloLogging(new PubSub());

const schema = [rootSchema].concat(modules.schemas);

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers: modules.createResolvers(pubsub)
});

addErrorLoggingToSchema(executableSchema, {
  log: e => {
    logger.error(e);
  }
});
export default executableSchema;
