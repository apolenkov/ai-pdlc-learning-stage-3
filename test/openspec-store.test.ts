import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const root = process.cwd();

test("root OpenSpec config points to the shared product store", async () => {
  const config = await readFile(join(root, "openspec", "config.yaml"), "utf8");

  assert.match(config, /^schema:\s*spec-driven\s*$/m);
  assert.match(config, /^store:\s*sdd-credit-calculator-product-meta\s*$/m);
});

test("educational OpenSpec snapshots keep their own roots", async () => {
  for (const snapshot of ["03-openspec", "03-ai"]) {
    const config = await readFile(join(root, snapshot, "openspec", "config.yaml"), "utf8");
    assert.doesNotMatch(config, /^store:/m, `${snapshot} must not silently redirect to the Store`);
  }
});

test("OpenCode receives Store-aware OpenSpec workflows", async () => {
  for (const skill of ["openspec-apply-change", "openspec-archive-change"]) {
    const content = await readFile(join(root, ".opencode", "skills", skill, "SKILL.md"), "utf8");
    assert.match(content, /Store selection:/);
    assert.match(content, /generatedBy:\s*"1\.12\.0"/);
  }
});
