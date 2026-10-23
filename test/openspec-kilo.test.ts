import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const KILO_SKILLS_URL = new URL("../.kilocode/skills/", import.meta.url);
const KILO_COMMANDS_URL = new URL("../.kilo/command/", import.meta.url);
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

const EXPECTED_KILO_COMMANDS = ["opsx-explore", "opsx-propose", "opsx-update"];

const FORBIDDEN_KILO_SKILLS = [
  "openspec-apply-change",
  "openspec-archive-change",
  "openspec-bulk-archive-change",
  "openspec-continue-change",
  "openspec-ff-change",
  "openspec-new-change",
  "openspec-onboard",
  "openspec-sync-specs",
  "openspec-verify-change",
];

const FORBIDDEN_KILO_COMMANDS = [
  "opsx-apply",
  "opsx-archive",
  "opsx-bulk-archive",
  "opsx-continue",
  "opsx-ff",
  "opsx-new",
  "opsx-onboard",
  "opsx-sync",
  "opsx-verify",
];

async function readKiloSkill(dirName: string): Promise<string> {
  return readFile(new URL(`${dirName}/SKILL.md`, KILO_SKILLS_URL), "utf8");
}

async function readKiloCommand(name: string): Promise<string> {
  return readFile(new URL(`${name}.md`, KILO_COMMANDS_URL), "utf8");
}

test("Kilo ships exactly the planning skills in the current .kilocode layout", async () => {
  const entries = (await readdir(KILO_SKILLS_URL, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(entries, [...EXPECTED_KILO_SKILLS].sort());
  for (const dirName of EXPECTED_KILO_SKILLS) {
    const files = await readdir(new URL(`${dirName}/`, KILO_SKILLS_URL));
    assert.deepEqual(files, ["SKILL.md"]);
    const skill = await readKiloSkill(dirName);
    assert.match(skill, new RegExp(`^name: ${dirName}$`, "mu"));
    assert.match(skill, /^ {2}generatedBy: "\d+\.\d+\.\d+"$/mu);
    assert.match(skill, /^allowed-tools: Bash\(openspec:\*\)$/mu);
  }
});

test("Kilo commands cover exactly the planning opsx workflows", async () => {
  const entries = (await readdir(KILO_COMMANDS_URL)).sort();
  assert.deepEqual(
    entries,
    EXPECTED_KILO_COMMANDS.map((name) => `${name}.md`).sort(),
  );
  for (const name of EXPECTED_KILO_COMMANDS) {
    const command = await readKiloCommand(name);
    assert.ok(command.trim().length > 0, `${name}: empty command`);
    assert.ok(!command.startsWith("---"), `${name}: no frontmatter expected`);
  }
});

test("the planning boundary stays enforced in Kilo skills and commands", async () => {
  const propose = await readKiloSkill("openspec-propose");
  assert.match(propose, /^description: Propose a new OpenSpec change/mu);
  assert.match(
    propose,
    /\*\*Planning boundary\*\*: This workflow creates planning artifacts only\./u,
  );
  assert.match(propose, /Do not edit project code\./u);

  const update = await readKiloSkill("openspec-update-change");
  assert.match(update, /^description: Update an OpenSpec change/mu);
  assert.match(update, /Never edit code\./u);

  const explore = await readKiloSkill("openspec-explore");
  assert.match(explore, /^description: Enter OpenSpec explore mode/mu);
  assert.match(explore, /NEVER write code or implement features/u);

  const proposeCommand = await readKiloCommand("opsx-propose");
  assert.match(
    proposeCommand,
    /\*\*Planning boundary\*\*: This workflow creates planning artifacts only\./u,
  );
  const updateCommand = await readKiloCommand("opsx-update");
  assert.match(
    updateCommand,
    /Revise a change's existing planning artifacts and keep them coherent\. Never edit code\./u,
  );
  const exploreCommand = await readKiloCommand("opsx-explore");
  assert.match(
    exploreCommand,
    /Explore mode is for thinking, not implementing\./u,
  );
});

test("contract workflows do not leak into the Kilo planning tree", async () => {
  const skillDirs = (await readdir(KILO_SKILLS_URL)).sort();
  for (const name of FORBIDDEN_KILO_SKILLS) {
    assert.ok(!skillDirs.includes(name), `unexpected Kilo skill: ${name}`);
  }
  const commandFiles = (await readdir(KILO_COMMANDS_URL)).sort();
  for (const name of FORBIDDEN_KILO_COMMANDS) {
    assert.ok(
      !commandFiles.includes(`${name}.md`),
      `unexpected Kilo command: ${name}`,
    );
  }
});

test("tracked Kilo tree is exactly the planning subset in the current layout", async () => {
  const tracked = execFileSync(
    "git",
    ["ls-files", "-z", "--", ".kilo", ".kilocode"],
    { cwd: REPO_ROOT, encoding: "utf8" },
  )
    .split("\0")
    .filter(Boolean)
    .sort();
  const expected = [
    ...EXPECTED_KILO_SKILLS.map(
      (dirName) => `.kilocode/skills/${dirName}/SKILL.md`,
    ),
    ...EXPECTED_KILO_COMMANDS.map((name) => `.kilo/command/${name}.md`),
  ].sort();
  assert.deepEqual(tracked, expected);
  assert.equal(
    existsSync(new URL("../.kilo/skills/", import.meta.url)),
    false,
    "legacy .kilo/skills layout must not return",
  );
});

test("Kilo skills do not replace the pre-existing opencode skill tree", async () => {
  const opencodeSkill = await readFile(
    new URL("../.opencode/skills/openspec-propose/SKILL.md", import.meta.url),
    "utf8",
  );
  assert.match(opencodeSkill, /^name: openspec-propose$/mu);
});
