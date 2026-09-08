import { defineConfig } from "vitest/config";
import path from "node:path";

// Deliberately minimal — this milestone's tests are pure-function (the
// exclusion-tier resolver, comboMatch's filtering) not component tests, so
// no jsdom environment or Preact plugin is needed yet. Reuses the same "@"
// alias as vite.config.ts so test files can import with the same paths as
// application code.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
