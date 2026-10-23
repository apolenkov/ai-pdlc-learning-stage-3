import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const AGENT_SKILLS_URL = new URL("../.agents/skills/", import.meta.url);
const KILO_COMMANDS_URL = new URL("../.kilo/command/", import.meta.url);
const REPO_ROOT = fileURLToPath(new URL("../", import.meta.url));

// Planning-only set for the analytical stage: create or continue a Change
// (propose), think through open branches (explore), and revise existing
// artifacts after review feedback (update). Apply/archive/sync stay out of
// the learner path on this stage.
const EXPECTED_SKILLS = [
  "openspec-explore",
  "openspec-propose",
  "openspec-update-change",
];

const EXPECTED_COMMANDS = ["opsx-explore", "opsx-propose", "opsx-update"];

const FORBIDDEN_SKILLS = [
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

const FORBIDDEN_COMMANDS = [
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

async function readSkill(dirName: string): Promise<string> {
  return readFile(new URL(`${dirName}/SKILL.md`, AGENT_SKILLS_URL), "utf8");
}

async function readCommand(name: string): Promise<string> {
  return readFile(new URL(`${name}.md`, KILO_COMMANDS_URL), "utf8");
}

test("OpenSpec skills live in the universal .agents/skills location", async () => {
  const entries = (await readdir(AGENT_SKILLS_URL, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(entries, [...EXPECTED_SKILLS].sort());
  const target = await readFile(
    new URL(".openspec-target", AGENT_SKILLS_URL),
    "utf8",
  );
  assert.equal(target.trim(), "agents");
  for (const dirName of EXPECTED_SKILLS) {
    const files = await readdir(new URL(`${dirName}/`, AGENT_SKILLS_URL));
    assert.deepEqual(files, ["SKILL.md"]);
    const skill = await readSkill(dirName);
    assert.match(skill, new RegExp(`^name: ${dirName}$`, "mu"));
    assert.match(skill, /^ {2}generatedBy: "\d+\.\d+\.\d+"$/mu);
    assert.match(skill, /^allowed-tools: Bash\(openspec:\*\)$/mu);
  }
});

test("Kilo commands cover exactly the planning opsx workflows", async () => {
  const entries = (await readdir(KILO_COMMANDS_URL)).sort();
  assert.deepEqual(
    entries,
    EXPECTED_COMMANDS.map((name) => `${name}.md`).sort(),
  );
  for (const name of EXPECTED_COMMANDS) {
    const command = await readCommand(name);
    assert.ok(command.trim().length > 0, `${name}: empty command`);
    assert.ok(!command.startsWith("---"), `${name}: no frontmatter expected`);
  }
});

test("the planning boundary stays enforced in universal skills and Kilo commands", async () => {
  const propose = await readSkill("openspec-propose");
  assert.match(propose, /^description: Propose a new OpenSpec change/mu);
  assert.match(
    propose,
    /\*\*Planning boundary\*\*: This workflow creates planning artifacts only\./u,
  );
  assert.match(propose, /Do not edit project code\./u);

  const update = await readSkill("openspec-update-change");
  assert.match(update, /^description: Update an OpenSpec change/mu);
  assert.match(update, /Never edit code\./u);

  const explore = await readSkill("openspec-explore");
  assert.match(explore, /^description: Enter OpenSpec explore mode/mu);
  assert.match(explore, /NEVER write code or implement features/u);

  const proposeCommand = await readCommand("opsx-propose");
  assert.match(
    proposeCommand,
    /\*\*Planning boundary\*\*: This workflow creates planning artifacts only\./u,
  );
  const updateCommand = await readCommand("opsx-update");
  assert.match(
    updateCommand,
    /Revise a change's existing planning artifacts and keep them coherent\. Never edit code\./u,
  );
  const exploreCommand = await readCommand("opsx-explore");
  assert.match(exploreCommand, /Explore mode is for thinking, not implementing\./u);
});

test("contract workflows do not leak into the planning tree", async () => {
  const skillDirs = (await readdir(AGENT_SKILLS_URL)).sort();
  for (const name of FORBIDDEN_SKILLS) {
    assert.ok(!skillDirs.includes(name), `unexpected skill: ${name}`);
  }
  const commandFiles = (await readdir(KILO_COMMANDS_URL)).sort();
  for (const name of FORBIDDEN_COMMANDS) {
    assert.ok(
      !commandFiles.includes(`${name}.md`),
      `unexpected Kilo command: ${name}`,
    );
  }
});

test("tracked integration tree is exactly the planning subset", async () => {
  const tracked = execFileSync(
    "git",
    ["ls-files", "-z", "--", ".agents", ".kilo", ".kilocode", ".opencode"],
    { cwd: REPO_ROOT, encoding: "utf8" },
  )
    .split("\0")
    .filter(Boolean)
    .sort();
  const expected = [
    ".agents/skills/.openspec-target",
    ...EXPECTED_SKILLS.map((dirName) => `.agents/skills/${dirName}/SKILL.md`),
    ...EXPECTED_COMMANDS.map((name) => `.kilo/command/${name}.md`),
  ].sort();
  assert.deepEqual(tracked, expected);
});

test("retired integration layouts do not return", () => {
  for (const legacy of [".kilo/skills", ".kilocode", ".opencode"]) {
    assert.equal(
      existsSync(new URL(`../${legacy}/`, import.meta.url)),
      false,
      `${legacy} must stay absent`,
    );
  }
});
