import DataLoader from 'dataloader';

import Post from './models';
import * as schemaGraphql from './schema.graphql';
import createResolvers from './resolvers';

import Feature from '../connector';

export default new Feature({
  schema: schemaGraphql,
  createResolversFunc: createResolvers,
  createContextFunc: () => {
    const post = new Post();
    return {
      Post: post,
      loaders: {
        getCommentsForPostIds: new DataLoader(post.getCommentsForPostIds)
      }
    };
  }
});
