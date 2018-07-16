/* @flow */

import path from 'path';
import morgan from 'morgan';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import hpp from 'hpp';
import favicon from 'serve-favicon';
import React from 'react';
import http from 'http';
import createHistory from 'history/createMemoryHistory';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
// import { matchPath, Switch } from 'react-router-dom';

import { StaticRouter } from 'react-router';
import { Provider } from 'react-redux';
import chalk from 'chalk';
import bodyParser from 'body-parser';
import { graphqlExpress } from 'graphql-server-express';
import { ApolloProvider } from 'react-apollo';
import { ApolloLink } from 'apollo-link';
import { LoggingLink } from 'apollo-logger';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { createApolloFetch } from 'apollo-fetch';
import { InMemoryCache } from 'apollo-cache-inmemory';
import cookiesMiddleware from 'universal-cookie-express';

import App from '../client/app';
import graphiqlMiddleware from './graphiql';
// import './mongodb';
import modules from './modules';
import clientModules from '../client/modules';
import schema from './schema';
import configureStore from '../client/common/utils/createReduxStore';
import Html from '../client/html';
import { host, portForTests } from '../client/config/index';
import createApolloClient from '../client/common/utils/createApolloClient';
import addGraphQLSubscriptions from './subscriptions';

const app = express();

app.use(cookiesMiddleware());
// Using helmet to secure Express with various HTTP headers
app.use(helmet());
// Prevent HTTP parameter pollution.
app.use(hpp());
// Compress all requests
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

for (const applyMiddleware of modules.middlewares) {
  applyMiddleware(app);
}

app.use(
  '/graphql',
  graphqlExpress(async (req, res, next) => {
    try {
      const query = req.query.query || req.body.query;
      if (query && query.length > 4000) {
        throw new Error('Query too large.');
      }
      return {
        schema,
        context: await modules.createContext(req, res)
      };
    } catch (e) {
      next(e);
    }
  })
);
app.use('/graphiql', (...args) => graphiqlMiddleware(...args));
app.use((req, res, next) => {
  if (req.originalUrl === '/') {
    express.static('assets')(req, res, next);
  } else {
    express.static('dist')(req, res, next);
  }
});

// Use morgan for http request debug (only show error)
app.use(morgan('dev', { skip: (req, res) => res.statusCode < 400 }));
app.use(favicon(path.join(process.cwd(), './public/favicon.ico')));
app.use(express.static(path.join(process.cwd(), './public')));
// Run express as webpack dev server
/*
if (__DEV__) {
  const webpack = require('webpack');
  const webpackConfig = require('../../tools/webpack/config.babel');

  const compiler = webpack(webpackConfig);

  app.use(
    require('webpack-dev-middleware')(compiler, {
      publicPath: webpackConfig.output.publicPath,
      hot: true,
      stats: { colors: true },
      quiet: true,
      serverSideRender: true
    })
  );
  app.use(require('webpack-hot-middleware')(compiler));
}
*/

// Register server-side rendering middleware
app.get('*', (req, res) => {
  // if (process.env.__DEV__) webpackIsomorphicTools.refresh();

  const apiUrl = 'http://localhost:3004/graphql';
  const fetch = createApolloFetch({
    uri: apiUrl,
    constructOptions: modules.constructFetchOptions
  });
  fetch.batchUse(({ options }, next) => {
    try {
      options.credentials = 'include';
      options.headers = req.headers;
    } catch (e) {
      console.error(e);
    }

    next();
  });

  const cache = new InMemoryCache();
  const link = new BatchHttpLink({ fetch });
  const client = createApolloClient({
    link: ApolloLink.from([new LoggingLink()].concat([link])),
    cache
  });

  const history = createHistory();
  const store = configureStore(history, {});

  const apolloState = Object.assign({}, cache.extract());

  const token = req.universalCookies.get('x-token')
    ? req.universalCookies.get('x-token')
    : null;
  const refreshToken = req.universalCookies.get('x-refresh-token')
    ? req.universalCookies.get('x-refresh-token')
    : null;

  // eslint-disable-next-line no-shadow
  const renderHtml = (store, htmlContent /* , loadableState */) => {
    const html = renderToStaticMarkup(
      <Html
        store={store}
        htmlContent={htmlContent}
        state={apolloState}
        token={token}
        refreshToken={refreshToken}
        /* loadableState={loadableState} */
      />
    );
    return `<!doctype html>${html}`;
  };

  // If __SSR__ = false, disable server side rendering
  /*  if (!__SSR__) {
    res.send(renderHtml(store));
    return;
  } */

  // Here's the method for loading data from server-side
  /* const loadBranchData = (): Promise<*> | Object => {
    const promises = [];

    routes.some(route => {
      const match = matchPath(req.path, route);

      if (match && route.loadData)
      // $FlowFixMe: the params of pre-load actions are dynamic
        promises.push(route.loadData(store.dispatch, match.params));

      return match;
    });

    return Promise.all(promises);
  }; */

  (async () => {
    try {
      // Load data from server-side first
      //  await loadBranchData();
      // Setup React-Router server-side rendering
      const routerContext = {};
      const component = clientModules.getWrappedRoot(
        <Provider store={store}>
          <ApolloProvider client={client}>
            <StaticRouter location={req.url} context={routerContext}>
              <App />
            </StaticRouter>
          </ApolloProvider>
        </Provider>,
        req || undefined
      );
      //   await getDataFromTree(component);
      // const loadableState = await getLoadableState(component);
      const htmlContent = renderToString(component);

      // Check if the render result contains a redirect, if so we need to set
      // the specific status and redirect header and end the response
      if (routerContext.url) {
        res.status(301).setHeader('Location', routerContext.url);
        res.end();
        return;
      }
      // Checking is page is 404
      const status = routerContext.status === '404' ? 404 : 200;
      // Pass the route and initial state into html template
      res
        .status(status)
        .send(renderHtml(store, htmlContent /* , loadableState */));
    } catch (err) {
      res.status(404).send('Not Found :(');
      console.error(`==> 😭  Rendering routes error: ${err}`);
    }
  })();
});

let server = http.createServer(app);
try {
  addGraphQLSubscriptions(server);
} catch (error) {
  console.log(error);
}
const url = `http://${host}:${portForTests}`;
server.listen(portForTests, () => {
  console.info(`API is now running on ${url}`);
  // Open Google Chrome
  // require('../../tools/openBrowser/index')(url);
});
server.on('close', () => {
  server = undefined;
});
if (!portForTests) {
  console.error(
    chalk.red('==> 😭  OMG!!! No PORT environment variable has been specified')
  );
}

export { server };
