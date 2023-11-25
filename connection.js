const mongoose = require('mongoose');
const config = require('./src/config');
const { dbHost, dbName, dbPassword, dbPort, dbUser, maUser, maPassword, maServer } = config;

mongoose.set('strictQuery', false);
const mongodbAtlas = `mongodb://${maUser}:${maPassword}@${maServer}/${dbName}?replicaSet=atlas-munim4-shard-0&ssl=true&authSource=admin`;

const localConnection = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?authSource=admin`;

mongoose.connect(mongodbAtlas, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 60000,
  socketTimeoutMS: 60000,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', async () => {
  console.log('database connect');
});

module.exports = db;
