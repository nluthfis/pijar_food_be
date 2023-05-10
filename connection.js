const postgres = require("postgres");

const sql = postgres({
  host: "localhost",
  port: 5432,
  database: "pijarfood",
  username: "postgres",
  password: "080798"
  /* options */
}); // will use psql environment variables

module.exports = sql