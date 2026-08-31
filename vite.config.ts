import { resolve } from "node:path";
import { defineConfig } from "vite";

const stages = [
  "01-template-git",
  "01-ai",
  "02-review",
  "02-ai",
  "03-openspec",
  "03-ai"
] as const;

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/apolenkov/sdd-credit-calculator-example/" : "/",
  build: {
    rollupOptions: {
      input: Object.fromEntries([
        ["index", resolve(import.meta.dirname, "index.html")],
        ...stages.map((stage) => [stage, resolve(import.meta.dirname, stage, "index.html")])
      ])
    }
  }
}));
