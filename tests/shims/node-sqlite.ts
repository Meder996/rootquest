/**
 * Test-only shim for the experimental `node:sqlite` builtin.
 *
 * Vite's module resolver does not recognize `node:sqlite` as a builtin (it is
 * not in Node's `module.builtinModules` list yet), so in Vitest we alias the
 * import to this shim, which loads the real builtin through createRequire.
 * The Next.js app itself imports `node:sqlite` directly and is unaffected.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const mod = require("node:sqlite") as typeof import("node:sqlite");

export const DatabaseSync = mod.DatabaseSync;
export default mod;
