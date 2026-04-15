require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("./connect");

const sql = fs.readFileSync(path.join(__dirname, "setup.sql"), "utf8");

pool.query(sql)
  .then(() => {
    console.log("All tables created successfully");
    pool.end();
  })
  .catch((err) => {
    console.error("Full error:", err);
    pool.end();
  });