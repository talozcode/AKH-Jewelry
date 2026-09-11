import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Node environment, no React plugin — phase 1 deliberately tests pure
// logic only (webhook decisions, checkout guards, auth comparisons), not
// components. See CLAUDE.md's "Tests" section for why.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
