/**
 * Seed the database with the initial content library:
 * 40 prefixes, 60 roots, 30 suffixes, 500+ example words,
 * 1000+ quiz questions, 12 lessons, and 11 achievements.
 *
 * Also creates default accounts:
 *   admin@rootquest.app   / Admin1234!   (admin)
 *   student@rootquest.app / Student1234! (student)
 */
import { getDbPath } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

async function main() {
  console.log(`Seeding database at ${getDbPath()} ...`);
  const summary = await seedDatabase({ includeUsers: true });
  console.log("\nSeed complete:");
  console.log(
    `  word parts:    ${summary.wordParts} (${summary.prefixes} prefixes, ${summary.roots} roots, ${summary.suffixes} suffixes)`
  );
  console.log(`  example words: ${summary.words}`);
  console.log(`  questions:     ${summary.questions}`);
  console.log(`  lessons:       ${summary.lessons}`);
  console.log(`  achievements:  ${summary.achievements}`);
  console.log("\nDemo accounts:");
  console.log("  admin@rootquest.app   / Admin1234!   (admin)");
  console.log("  student@rootquest.app / Student1234! (student)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
