const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "admin",
  host:
    process.env.DB_HOST ||
    "us-east-1.ebcdf680-2d1c-4742-8224-d596859f5113.aws.yugabyte.cloud",
  database: process.env.DB_NAME || "nurses",
  password: process.env.DB_PASSWORD || "3pedA0JOIjl3WzaLia6OsESsAce98p",
  port: process.env.DB_PORT || 5433,
  ssl: {
    rejectUnauthorized: false, // Required for cloud-based databases
  },
});

module.exports = pool;
