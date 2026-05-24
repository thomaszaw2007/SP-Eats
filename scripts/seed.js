const fs = require("fs");
const path = require("path");
const pool = require("../src/models/db");

const seedPath = path.join(__dirname, "../seed.sql");
const SQLSTATEMENT = fs.readFileSync(seedPath, "utf8");

pool.query(SQLSTATEMENT, (error) => {
  if (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }

  console.log("Seed data inserted successfully.");
  process.exit(0);
});