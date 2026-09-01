import { readdirSync, readFileSync } from "node:fs";
import { extname, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const ignoredDirectories = new Set([".git", ".playwright-cli", "dist", "node_modules"]);
const textExtensions = new Set([".css", ".html", ".json", ".md", ".ts", ".yaml", ".yml"]);
const errors: string[] = [];

const forbiddenFiles = [
  /(^|\/)\.env($|\.)/,
  /(^|\/)\.workspace\//,
  /(^|\/)id_rsa$/,
  /\.(?:key|pem)$/
];

const sensitivePatterns = [
  { label: "закрытый ключ", pattern: new RegExp(["BEGIN", "PRIVATE", "KEY"].join("[ -]"), "i") },
  { label: "API-ключ", pattern: new RegExp("\\b" + "sk" + "-[A-Za-z0-9]{20,}\\b") },
  { label: "GitHub-токен", pattern: new RegExp("\\b" + "gh" + "[pousr]_[A-Za-z0-9]{20,}\\b") },
  { label: "Bearer credential", pattern: new RegExp("\\bBearer\\s+[A-Za-z0-9._~+/=-]{20,}", "i") },
  { label: "корпоративный адрес", pattern: new RegExp("\\b[a-z0-9.-]+\\." + "corp-example" + "\\.com\\b", "i") }
];

function collect(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return [];
    const absolute = resolve(directory, entry.name);
    return entry.isDirectory() ? collect(absolute) : [absolute];
  });
}

const files = collect(root);
for (const file of files) {
  const name = relative(root, file);
  if (name === ".env.example") continue;
  if (forbiddenFiles.some((pattern) => pattern.test(name))) {
    errors.push(`запрещённый файл: ${name}`);
  }
  if (!textExtensions.has(extname(file))) continue;
  const content = readFileSync(file, "utf8");
  for (const { label, pattern } of sensitivePatterns) {
    if (pattern.test(content)) errors.push(`${name}: ${label}`);
  }
}

for (const directory of ["01-template-git", "01-ai", "02-review", "02-ai", "03-openspec", "03-ai"]) {
  for (const source of ["src/app.ts", "src/calculator.ts"]) {
    const content = readFileSync(resolve(root, directory, source), "utf8");
    if (/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\b/.test(content)) {
      errors.push(`${directory}/${source}: найден сетевой API`);
    }
  }
}

if (errors.length > 0) {
  throw new Error(`Проверка приватности не пройдена:\n- ${errors.join("\n- ")}`);
}

console.log("Проверка приватности пройдена: секреты, корпоративные адреса и сетевые API не найдены.");
