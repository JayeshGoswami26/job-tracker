import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

function open(): Database.Database {
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  const db = new Database(path.join(dir, "tracker.db"));
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      applied TEXT NOT NULL,
      status TEXT NOT NULL,
      followUp TEXT NOT NULL DEFAULT '',
      contact TEXT NOT NULL DEFAULT '',
      link TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      rejectReason TEXT NOT NULL DEFAULT '',
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);
  return db;
}

// Cached on globalThis so hot reloads in development do not open new connections.
const g = globalThis as unknown as { __trackerDb?: Database.Database };
export const db: Database.Database = g.__trackerDb ?? (g.__trackerDb = open());
