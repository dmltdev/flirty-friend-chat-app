import { URL, fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/__tests__/**/*.{js,ts}", "**/*.test.{js,ts}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      include: ["src/lib/utils/**/*.{js,ts}"],
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
    },
  },
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
