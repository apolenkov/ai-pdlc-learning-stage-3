import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const KILO_SKILLS_URL = new URL("../.kilo/skills/", import.meta.url);
const REPO_ROOT = fileURLToPath(new URL("../", import.meta.url));

// Planning-only set for the analytical stage: create or continue a Change
// (propose), think through open branches (explore), and revise existing
// artifacts after review feedback (update). Apply/archive/sync stay out of
// the learner path on this stage.
const EXPECTED_KILO_SKILLS = [
  "openspec-explore",
  "openspec-propose",
  "openspec-update-change",
];

async function readKiloSkill(dirName: string): Promise<string> {
  return readFile(new URL(`${dirName}/SKILL.md`, KILO_SKILLS_URL), "utf8");
}

test("Kilo ships exactly the planning skills as real SKILL.md files", async () => {
  const entries = (await readdir(KILO_SKILLS_URL, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(entries, [...EXPECTED_KILO_SKILLS].sort());
  for (const dirName of EXPECTED_KILO_SKILLS) {
    const skill = await readKiloSkill(dirName);
    assert.match(skill, new RegExp(`^name: ${dirName}$`, "mu"));
    assert.match(skill, /^ {2}generatedBy: "\d+\.\d+\.\d+"$/mu);
    assert.match(skill, /^allowed-tools: Bash\(openspec:\*\)$/mu);
  }
});

test("native openspec-propose is a planning-only Kilo skill, not a directory stub", async () => {
  const skill = await readKiloSkill("openspec-propose");
  assert.match(skill, /^description: Propose a new change/mu);
  assert.match(skill, /openspec new change/u);
  assert.match(skill, /openspec status --change/u);
  assert.match(skill, /This workflow creates planning artifacts only/u);
  assert.match(skill, /Do not edit project code/u);
});

test("tracked .kilo tree carries only the planning SKILL.md files", async () => {
  const tracked = execFileSync("git", ["ls-files", "-z", "--", ".kilo"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean)
    .sort();
  assert.deepEqual(
    tracked,
    EXPECTED_KILO_SKILLS.map(
      (dirName) => `.kilo/skills/${dirName}/SKILL.md`,
    ).sort(),
  );
  assert.equal(
    existsSync(new URL("../.kilocode/skills/", import.meta.url)),
    false,
  );
  for (const dirName of EXPECTED_KILO_SKILLS) {
    const files = await readdir(new URL(`${dirName}/`, KILO_SKILLS_URL));
    assert.deepEqual(files, ["SKILL.md"]);
  }
});

test("Kilo skills do not replace the pre-existing opencode skill tree", async () => {
  const opencodeSkill = await readFile(
    new URL("../.opencode/skills/openspec-propose/SKILL.md", import.meta.url),
    "utf8",
  );
  assert.match(opencodeSkill, /^name: openspec-propose$/mu);
});
