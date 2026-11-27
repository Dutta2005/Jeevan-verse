import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["src/components/ui/**", "src/**/*.d.ts"],
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/components/ui/**",
        "src/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/main.tsx",
      ],
      reporter: ["text", "html", "json-summary"],
      thresholds: {
        statements: 99,
        branches: 95,
        functions: 99,
        lines: 99,
      },
    },
  },
});
