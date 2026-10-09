/** Delete the SQLite database file so the next run re-migrates and re-seeds. */
import fs from "node:fs";
import { getDbPath } from "@/lib/db";

const dbPath = getDbPath();
for (const suffix of ["", "-wal", "-shm"]) {
  const file = dbPath + suffix;
  if (fs.existsSync(file)) {
    fs.rmSync(file);
    console.log(`Removed ${file}`);
  }
}
console.log("Database reset. Run `npm run seed` to re-create and seed it.");
