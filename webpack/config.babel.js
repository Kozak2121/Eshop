'use strict'; // eslint-disable-line

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
// const MinifyPlugin = require('babel-minify-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

const parallelUglifyPlugin = new ParallelUglifyPlugin({
  uglifyES: {
    compress: {
      warnings: false
    }
  }
});

const nodeEnv = process.env.NODE_ENV || 'development';
const isDev = nodeEnv !== 'production';

const WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');
const webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(
  require('./WIT.config')
).development(isDev);

// Disable CSSModules here
const CSSModules = true;
// Enable build process terminated while there's an eslint error
const eslint = false;
// Enable build process terminated while there's an stylelint error
const stylelint = false;
// Register vendors here
const vendor = [
  'react',
  'react-dom',
  'redux',
  'react-redux',
  'redux-thunk',
  'react-hot-loader',
  'react-router-dom',
  'history',
  'react-router-redux',
  'react-helmet',
  'axios',
  'redbox-react',
  'chalk',
  'lodash',
  'antd'
];

// Setting the plugins for development/prodcution
const getPlugins = () => {
  // Common
  const plugins = [
    new ExtractTextPlugin({
      filename: '[name].[contenthash:8].css',
      allChunks: true,
      disable: isDev, // Disable css extracting on development
      ignoreOrder: CSSModules
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
        // Javascript lint
        eslint: { failOnError: eslint },
        debug: isDev,
        minimize: !isDev
      }
    }),
    new webpack.NormalModuleReplacementPlugin(/\/chunks/, './asyncChunks'),
    // Style lint
    new StyleLintPlugin({ failOnError: stylelint }),
    // Setup enviorment variables for client
    new webpack.EnvironmentPlugin({ NODE_ENV: JSON.stringify(nodeEnv) }),
    // Setup global variables for client
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false,
      __SSR__: true,
      __DEV__: isDev
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    webpackIsomorphicToolsPlugin
  ];

  if (isDev) {
    // For development
    plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      // Prints more readable module names in the browser console on HMR updates
      new webpack.NamedModulesPlugin(),
      new webpack.IgnorePlugin(/webpack-stats\.json$/) // eslint-disable-line comma-dangle
    );
  } else {
    plugins.push(
      // For production
      //  new MinifyPlugin({}, { test: /\.jsx?$/, comments: false }),
      parallelUglifyPlugin,
      new webpack.HashedModuleIdsPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: Infinity
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new CompressionPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.jsx?$|\.css$|\.less$|\.(scss|sass|less)$|\.html$/,
        threshold: 10240,
        minRatio: 0.8
      }) // eslint-disable-line comma-dangle
    );
  }

  return plugins;
};

// Setting the entry for development/prodcution
const getEntry = () => {
  // For development
  let entry = [
    'react-hot-loader/patch',
    'webpack-hot-middleware/client?reload=true',
    './src/client/index.js'
  ];

  // For prodcution
  if (!isDev) {
    entry = {
      main: './src/client/index.js',
      // Register vendors here
      vendor
    };
  }

  return entry;
};

const lessToJs = require('less-vars-to-js');

const themeVariables = lessToJs(
  fs.readFileSync(
    path.join(__dirname, '../../src/client/common/styles/variables.less'),
    'utf8'
  )
);

// Setting webpack config
module.exports = {
  name: 'client',
  target: 'web',
  cache: isDev,
  devtool: isDev ? 'cheap-module-eval-source-map' : 'hidden-source-map',
  context: path.join(process.cwd()),
  entry: getEntry(),
  output: {
    path: path.join(process.cwd(), './public/assets'),
    publicPath: '/assets/',
    // Don't use chunkhash in development it will increase compilation time
    filename: isDev ? '[name].js' : '[name].[chunkhash:8].js',
    chunkFilename: isDev ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
    pathinfo: isDev
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        enforce: 'pre',
        exclude: /node_modules/,
        loader: 'eslint',
        options: {
          fix: true
        }
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        options: {
          cacheDirectory: isDev,
          babelrc: false,
          presets: [['env', { modules: false }], 'react', 'stage-0', 'flow'],
          plugins: [
            'transform-runtime',
            'react-hot-loader/babel',
            'lodash',
            [
              'import',
              {
                libraryName: 'antd',
                style: true
              }
            ]
          ],
          env: { production: { plugins: ['transform-remove-console'] } }
        }
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader'
      },
      {
        test: /\.css$/,
        /* use: [ 'style-loader', 'css-loader' ] */
        loader: ExtractTextPlugin.extract({
          fallback: 'style',
          use: [
            {
              loader: 'css',
              options: {
                importLoaders: 1,
                sourceMap: true,
                modules: CSSModules,
                // "context" and "localIdentName" need to be the same with server config,
                // or the style will flick when page first loaded
                context: path.join(process.cwd(), './src'),
                localIdentName: '[name]__[local]--[hash:base64:5]',
                minimize: !isDev
              }
            },
            { loader: 'postcss', options: { sourceMap: true } }
          ]
        })
      },
      {
        test: /\.(scss|sass)$/,
        /*     use: [{
               loader: "style-loader" // creates style nodes from JS strings
             }, {
               loader: "css-loader" // translates CSS into CommonJS
             }, {
               loader: "sass-loader" // compiles Sass to CSS
             }] */
        loader: ExtractTextPlugin.extract({
          fallback: 'style',
          use: [
            {
              loader: 'css',
              options: {
                importLoaders: 2,
                sourceMap: true,
                modules: CSSModules,
                context: path.join(process.cwd(), './src'),
                // localIdentName: '[name]__[local]--[hash:base64:5]',
                localIdentName: '[local]',
                minimize: !isDev
              }
            },
            { loader: 'postcss', options: { sourceMap: true } },
            {
              loader: 'sass',
              options: {
                outputStyle: 'expanded',
                sourceMap: true,
                sourceMapContents: !isDev
              }
            }
          ]
        })
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style',
          use: [
            { loader: 'css' },
            /* { loader: 'postcss', options: { sourceMap: true } }, */
            {
              loader: 'less',
              options: {
                modifyVars: themeVariables
              }
            }
          ]
        })
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.(woff2?|ttf|eot|svg)$/,
        loader: 'url',
        options: { limit: 10000 }
      },
      {
        test: webpackIsomorphicToolsPlugin.regular_expression('images'),
        // Any image below or equal to 10K will be converted to inline base64 instead
        use: [
          {
            loader: 'url',
            options: { limit: 10240 }
          },
          // Using for image optimization
          {
            loader: 'image-webpack',
            options: { bypassOnDebug: true }
          }
        ]
      }
    ]
  },
  plugins: getPlugins(),
  resolveLoader: {
    // Use loaders without the -loader suffix
    moduleExtensions: ['-loader']
  },
  resolve: {
    modules: ['src', 'node_modules'],
    descriptionFiles: ['package.json'],
    extensions: ['.js', '.jsx', '.json']
  },
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  // https://webpack.github.io/docs/configuration.html#node
  // https://github.com/webpack/node-libs-browser/tree/master/mock
  node: {
    fs: 'empty',
    vm: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};
