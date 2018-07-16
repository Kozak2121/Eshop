import Comment from './models';
import schemaGraphql from './schema.graphql';
import createResolvers from './resolvers';

import Feature from '../connector';

export default new Feature({
  schema: schemaGraphql,
  createResolversFunc: createResolvers,
  createContextFunc: () => {
    const comment = new Comment();
    return {
      Comment: comment
    };
  }
});
