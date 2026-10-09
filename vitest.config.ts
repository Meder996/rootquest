import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    server: {
      deps: {
        // node:sqlite is a new Node.js builtin that Vite's builtin list does
        // not know yet — keep it external so Node loads it natively.
        external: ["node:sqlite"],
      },
    },
    env: {
      NODE_ENV: "test",
      JWT_SECRET: "vitest-secret-key",
      DATABASE_PATH: path.join(__dirname, ".data", "vitest.sqlite"),
    },
  },
  resolve: {
    alias: {
      "@": path.join(__dirname, "."),
      // Vite cannot resolve the experimental node:sqlite builtin — use a shim.
      "node:sqlite": path.join(__dirname, "tests", "shims", "node-sqlite.ts"),
    },
  },
});
