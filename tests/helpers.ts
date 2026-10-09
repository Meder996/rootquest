import fs from "node:fs";
import { getDb, getDbPath, resetDbConnection } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";
import { resetRateLimits } from "@/lib/rate-limit";

/** Wipe the test database and re-run migrations. */
export function resetTestDatabase(): void {
  resetDbConnection();
  const dbPath = getDbPath();
  for (const suffix of ["", "-wal", "-shm"]) {
    const file = dbPath + suffix;
    if (fs.existsSync(file)) fs.rmSync(file);
  }
  getDb(); // runs migrations
  resetRateLimits();
}

/** Reset and seed the test database. */
export async function seedTestDatabase(
  options: { includeUsers?: boolean } = {}
): Promise<void> {
  resetTestDatabase();
  await seedDatabase({ includeUsers: options.includeUsers ?? false });
}
