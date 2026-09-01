import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const ignored = new Set([".git", ".playwright-cli", "dist", "node_modules"]);
const checkedExtensions = new Set([".html", ".md"]);
const errors: string[] = [];

function collect(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    const absolute = resolve(directory, entry.name);
    return entry.isDirectory() ? collect(absolute) : [absolute];
  });
}

function localTarget(rawTarget: string): string | undefined {
  const target = rawTarget.trim().replace(/^<|>$/g, "");
  if (
    target === "" ||
    target.startsWith("#") ||
    target.startsWith("http://") ||
    target.startsWith("https://") ||
    target.startsWith("mailto:") ||
    target.startsWith("data:") ||
    target.startsWith("javascript:")
  ) {
    return undefined;
  }
  return target.split(/[?#]/, 1)[0];
}

function validateTarget(source: string, rawTarget: string): void {
  const target = localTarget(rawTarget);
  if (!target) return;

  const absolute = target.startsWith("/")
    ? resolve(root, target.slice(1))
    : resolve(dirname(source), target);
  const candidate = absolute.endsWith("/") ? resolve(absolute, "index.html") : absolute;

  if (!candidate.startsWith(root) || !statExists(candidate)) {
    errors.push(`${source.slice(root.length + 1)} → ${rawTarget}`);
  }
}

function statExists(candidate: string): boolean {
  try {
    const stats = statSync(candidate);
    return stats.isFile() || (stats.isDirectory() && statExists(resolve(candidate, "index.html")));
  } catch {
    return false;
  }
}

for (const file of collect(root).filter((candidate) => checkedExtensions.has(extname(candidate)))) {
  const content = readFileSync(file, "utf8");
  const targets = [
    ...content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g),
    ...content.matchAll(/(?:href|src)=["']([^"']+)["']/g)
  ];
  for (const match of targets) validateTarget(file, match[1]);
}

if (errors.length > 0) {
  throw new Error(`Найдены несуществующие локальные ссылки:\n- ${errors.join("\n- ")}`);
}

console.log("Локальные ссылки корректны.");
