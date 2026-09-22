import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");

test("kilo native integration ships the openspec propose skill", async () => {
  const skill = await readFile(
    resolve(root, ".kilocode/skills/openspec-propose/SKILL.md"),
    "utf8",
  );
  assert.match(skill, /^name:\s*openspec-propose\s*$/mu);
});
