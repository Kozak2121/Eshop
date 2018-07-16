import mongoose from 'mongoose';

const dbURI = 'mongodb://localhost:27017/eshop';

mongoose.Promise = require('bluebird');

mongoose.connect(dbURI, { useMongoClient: true });

// When successfully connected
mongoose.connection.on('connected', () => {
  console.log(`Mongoose default connection open to ${dbURI}`);
});

// If the connection throws an error
mongoose.connection.on('error', err => {
  console.log(`Mongoose default connection error: ${err}`);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose default connection disconnected');
});
