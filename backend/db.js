const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbPath = process.env.DATABASE_URL || path.join(__dirname, 'database.sqlite');
const needInit = !fs.existsSync(dbPath);

const db = new Database(dbPath);

if (needInit) {
  const migration = fs.readFileSync(path.join(__dirname, 'migration.sql'), 'utf8');
  db.exec(migration);
  console.log('DB initialized.');
}

module.exports = db;
