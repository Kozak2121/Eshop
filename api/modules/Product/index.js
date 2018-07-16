import Product from './models';
import schemaGraphql from './schema.graphql';
import createResolvers from './resolvers';
import Feature from '../connector';

export default new Feature({
  schema: schemaGraphql,
  createResolversFunc: createResolvers,
  createContextFunc: () => {
    const product = new Product();
    return {
      Product: product
    };
  }
});
