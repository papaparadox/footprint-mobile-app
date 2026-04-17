require("dotenv").config();
const { Pool } = require("pg");

const connectionString = process.env.NODE_ENV === "test"
    ? process.env.TEST_DB_URL
    : process.env.DB_URL;

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

module.exports = pool;