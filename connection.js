require('dotenv').config();
const postgres = require('postgres');

const sql = postgres({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD
});

module.exports = sql;

// const postgres = require('postgres')

// const sql = postgres({
//   host: 'localhost',
//   port: 5432,
//   database: 'pijarfood',
//   username: 'postgres',
//   password: 'nfl8798',
//   PRIVATE_KEY : '324c29739bb157d5e4d3ddc5eef2e098'
//   /* options */
// }) // will use psql environment variables

// module.exports = sql
