import sqlite3 from "sqlite3";
import path from "path";

const DB_PATH = path.join(__dirname, "..", "data.db");
console.log("📂 SQLite DB Path:", DB_PATH);
export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("❌ Failed to connect to SQLite", err);
  } else {
    console.log("✅ Connected to SQLite");
  }
});

export function initDb() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS accounts (
        account_id TEXT PRIMARY KEY,
        name TEXT,
        industry TEXT,
        segment TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS reps (
        rep_id TEXT PRIMARY KEY,
        name TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS deals (
        deal_id TEXT PRIMARY KEY,
        account_id TEXT,
        rep_id TEXT,
        stage TEXT,
        amount REAL,
        created_at TEXT,
        closed_at TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS activities (
        activity_id TEXT PRIMARY KEY,
        deal_id TEXT,
        type TEXT,
        timestamp TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS targets (
        month TEXT PRIMARY KEY,
        target REAL
      )
    `);

    console.log("✅ Tables created / verified");
  });
}
