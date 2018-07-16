/* eslint-disable no-unused-vars */
// General imports
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

import { getServer, getApollo } from '../../testHelpers/integrationSetup';

describe('Upload API works', () => {
  let server;
  let apollo;

  beforeAll(async () => {
    server = await getServer();
    apollo = getApollo();
  });

  it('Has GraphiQL endpoint', done =>
    chai
      .request(server)
      .get('/graphiql')
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal({});
        done();
      })
      .catch(err => {
        console.error(err);
        throw err;
      }));
});
