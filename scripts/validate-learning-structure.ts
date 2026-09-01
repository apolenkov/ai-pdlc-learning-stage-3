import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

type AiBoundary = {
  humanDecisionRequired: boolean;
  secretsAllowed: boolean;
  corporateDataAllowed: boolean;
};

type Variant = {
  id: string;
  directory: string;
  kind: "base" | "ai";
  baseVariant?: string;
  inherits: string[];
  acceptanceProfile: string;
  openspecCli: boolean;
  aiBoundary?: AiBoundary;
};

type LearningContract = {
  schemaVersion: number;
  acceptanceProfiles: Record<string, string[]>;
  variants: Variant[];
};

const root = resolve(import.meta.dirname, "..");
const contract = JSON.parse(
  readFileSync(resolve(root, "learning-contract.json"), "utf8")
) as LearningContract;

const errors: string[] = [];

function requireFile(relativePath: string): void {
  if (!existsSync(resolve(root, relativePath))) {
    errors.push(`Нет обязательного файла: ${relativePath}`);
  }
}

function requireText(relativePath: string, fragments: string[]): void {
  requireFile(relativePath);
  if (!existsSync(resolve(root, relativePath))) return;

  const content = readFileSync(resolve(root, relativePath), "utf8");
  for (const fragment of fragments) {
    if (!content.includes(fragment)) {
      errors.push(`${relativePath}: нет фрагмента «${fragment}»`);
    }
  }
}

if (contract.schemaVersion !== 1) {
  errors.push("Поддерживается только learning-contract schemaVersion 1");
}

const expectedIds = ["1", "1-ai", "2", "2-ai", "3", "3-ai"];
const actualIds = contract.variants.map(({ id }) => id);
if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
  errors.push(`Ожидались варианты ${expectedIds.join(", ")}, получены ${actualIds.join(", ")}`);
}

for (const variant of contract.variants) {
  for (const file of ["README.md", "index.html", "src/app.ts", "src/calculator.ts", "test/calculator.test.ts"]) {
    requireFile(`${variant.directory}/${file}`);
  }

  if (!contract.acceptanceProfiles[variant.acceptanceProfile]) {
    errors.push(`${variant.id}: неизвестный профиль приёмки ${variant.acceptanceProfile}`);
  }

  if (variant.kind === "ai") {
    const base = contract.variants.find(({ id }) => id === variant.baseVariant);
    if (!base) {
      errors.push(`${variant.id}: не найден базовый вариант ${variant.baseVariant ?? ""}`);
      continue;
    }
    if (base.acceptanceProfile !== variant.acceptanceProfile) {
      errors.push(`${variant.id}: критерии человека отличаются от ${base.id}`);
    }
    if (
      variant.aiBoundary?.humanDecisionRequired !== true ||
      variant.aiBoundary.secretsAllowed !== false ||
      variant.aiBoundary.corporateDataAllowed !== false
    ) {
      errors.push(`${variant.id}: границы ИИ заданы неполно`);
    }
  }
}

const manualHeadings = [
  "## Цель и границы",
  "## Требования и сценарии",
  "## Проектные замечания",
  "## Открытые вопросы",
  "## Условия готовности"
];

for (const directory of ["01-template-git", "01-ai", "02-review", "02-ai"]) {
  requireText(`${directory}/specification.md`, manualHeadings);
}

for (const directory of ["01-template-git", "01-ai"]) {
  requireText(`${directory}/README.md`, ["OpenSpec CLI", "не используется"]);
}

for (const directory of ["01-ai", "02-ai", "03-ai"]) {
  requireText(`${directory}/README.md`, ["Критерии человеческой приёмки совпадают"]);
}

for (const directory of ["02-review", "02-ai"]) {
  requireText(`${directory}/README.md`, [
    "ревью аналитика",
    "техническое ревью",
    "pull_request_template.md",
    "npm run validate:structure",
    "npm run validate:links"
  ]);

  const readme = readFileSync(resolve(root, directory, "README.md"), "utf8");
  if (readme.indexOf("ревью аналитика") > readme.indexOf("техническое ревью")) {
    errors.push(`${directory}/README.md: техническое ревью указано раньше ревью аналитика`);
  }
}

requireText(".github/pull_request_template.md", [
  "сначала получено ревью аналитика",
  "затем получено техническое ревью",
  "Ревью аналитика:",
  "Техническое ревью:"
]);

for (const directory of ["03-openspec", "03-ai"]) {
  const change = `${directory}/openspec/changes/archive/2026-08-31-add-credit-calculator`;
  for (const relativePath of [
    `${change}/proposal.md`,
    `${change}/specs/credit-calculator/spec.md`,
    `${change}/design.md`,
    `${change}/tasks.md`,
    `${directory}/openspec/specs/credit-calculator/spec.md`
  ]) {
    requireFile(relativePath);
  }
  requireText(`${directory}/README.md`, ["proposal", "specs", "design", "tasks"]);
}

requireText("01-template-git/README.md", ["41 738 ₽"]);
requireText("01-template-git/specification.md", ["41 738 ₽"]);
requireText("01-template-git/test/calculator.test.ts", ["41_738"]);

if (errors.length > 0) {
  throw new Error(`Структура учебного маршрута не прошла проверку:\n- ${errors.join("\n- ")}`);
}

console.log("Структура учебного маршрута корректна: 6/6 вариантов.");
