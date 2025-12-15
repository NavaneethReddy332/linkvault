import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log("Running migrations...");

  // Create users table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_id TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      avatar TEXT,
      created_at INTEGER NOT NULL,
      banned_until INTEGER
    )
  `);
  console.log("Created users table");

  // Create sessions table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    )
  `);
  console.log("Created sessions table");

  // Create groups table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("Created groups table");

  // Create links table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      note TEXT,
      group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL
    )
  `);
  console.log("Created links table");

  console.log("Migrations complete!");
}

migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
