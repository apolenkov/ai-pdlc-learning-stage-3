import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFile(resolve(root, path), "utf8");

test("standalone stage 3 uses a personal base and stops before Apply", async () => {
  const readme = await read("README.md");
  assert.match(readme, /отдельн(?:ый|ому) поздн(?:ий|ему) старт/u);
  assert.match(readme, /не требует клонировать или импортировать результаты ступеней 1–2/u);
  assert.doesNotMatch(readme, /git -C \.\.\/sdd-guide-credit-calculator-stage-2/u);
  assert.match(readme, /создайте fork.*в интерфейсе GitHub/su);
  assert.match(
    readme,
    /git clone https:\/\/github\.example\.invalid\/your_login\/sdd-guide-credit-calculator-stage-3\.git/u,
  );
  assert.match(readme, /`origin`.*ваш fork/su);
  assert.match(readme, /git push -u origin course\/your_login\/stage-3-base/u);
  assert.match(readme, /git push -u origin course\/your_login\/stage-3-reset-years/u);
  assert.doesNotMatch(readme, /git clone https:\/\/github\.example\.invalid\/apolenkov\//u);
  assert.doesNotMatch(readme, /git remote add/u);
  assert.match(readme, /course\/your_login\/stage-3-base/u);
  assert.match(readme, /course\/your_login\/stage-3-reset-years/u);
  assert.match(readme, /new change add-reset-and-years-term --schema spec-driven/u);
  assert.match(readme, /add-reset-and-years-term/u);
  assert.match(readme, /Код и runtime-тесты не меняются, Apply не выполняется/u);
  assert.match(readme, /planning PR имеет source.*stage-3-reset-years.*base.*stage-3-base/u);
  assert.match(readme, /не закрывайте задачи и не запускайте Apply/u);
  assert.match(readme, /stage-3-ai-payment-summary/u);
  assert.match(readme, /source.*stage-3-ai-payment-summary.*base.*stage-3-reset-years/u);
  assert.match(readme, /один личный checkout, созданный на R1/u);
  assert.match(readme, /не клонируется/u);
  assert.match(readme, /уже выводятся в baseline/u);
  assert.match(readme, /51 ₽, общую сумму 102 ₽ и переплату 1 ₽/u);
  assert.match(readme, /51 ₽, общая сумма 101 ₽ и переплата 0 ₽/u);
  assert.match(readme, /Новых полей результата не добавлять/u);
  assert.doesNotMatch(readme, /показать общую сумму выплат и переплату/u);
  // Основной маршрут — браузер и VS Code; терминальные эквиваленты свёрнуты в один блок.
  assert.match(readme, /Git: Clone/u);
  assert.match(readme, /Create new branch/u);
  assert.match(readme, /Source Control/u);
  assert.match(readme, /Publish Branch/u);
  assert.ok(
    readme.indexOf("Git: Clone") < readme.indexOf("git clone https://github.example.invalid"),
  );
  const terminalBlock =
    /<details><summary>Развернуть точные команды<\/summary>([\s\S]*?)<\/details>/u.exec(readme);
  assert.ok(terminalBlock);
  for (const command of [
    /git clone https:\/\/github\.example\.invalid\/your_login\/sdd-guide-credit-calculator-stage-3\.git/u,
    /git push -u origin course\/your_login\/stage-3-base/u,
    /git push -u origin course\/your_login\/stage-3-reset-years/u,
  ]) {
    assert.match(terminalBlock[1], command);
  }
  assert.doesNotMatch(readme, /\.kilocode/u);
});

test("the cumulative contract maps current and pending behavior without claiming implementation", async () => {
  const [config, traceability, transfer] = await Promise.all([
    read("openspec/config.yaml"),
    read("docs/templates/requirements-traceability.md"),
    read("docs/templates/stage-2-transfer.md"),
  ]);
  const storeOnly = /^store:\s*sdd-credit-calculator-product-meta\s*$/mu.test(config);
  if (storeOnly) {
    await assert.rejects(access(resolve(root, "openspec/specs")), /ENOENT/u);
    await assert.rejects(access(resolve(root, "openspec/changes")), /ENOENT/u);
  } else {
    const baseline = await read("openspec/specs/credit-calculator/spec.md");
    assert.match(baseline, /Ошибка очищает предыдущий результат/u);
    assert.doesNotMatch(baseline, /Сброс формы|Срок в годах|20 лет/u);
  }
  assert.match(traceability, /3 000 000 \/ 16 \/ 240/u);
  assert.match(traceability, /переключатель.*месяцы.*годы/iu);
  assert.match(traceability, /шаг `0,5`, default `20`, перевод `0,5→6` и `20→240`/u);
  assert.match(traceability, /Reset в выбранном режиме/u);
  assert.match(traceability, /режим сохранён/u);
  assert.match(traceability, /незавершённая реализация/u);
  assert.match(transfer, /Полный SHA принятого R2/u);
  assert.match(transfer, /SHA одного diff, к которому относятся оба review/u);
  assert.match(transfer, /course\/<login>\//u);
  assert.match(transfer, /не клонирует standalone-репозиторий/u);
  assert.match(transfer, /организатор/u);
  assert.doesNotMatch(
    transfer,
    /Этот шаблон нужен только для основного непрерывного маршрута/u,
  );
  assert.doesNotMatch(traceability, /репозиторий и полный SHA baseline/u);
  assert.match(traceability, /организатор/u);
  assert.match(traceability, /51\/102\/1/u);
  assert.match(traceability, /51\/101\/0/u);
  assert.match(traceability, /Main specs: `<ACTUAL_PATHS_OR_EXPLICIT_EMPTY>`/u);
  assert.match(traceability, /Active Changes: `<ALL_ACTIVE_CHANGE_PATHS>`/u);
  assert.match(traceability, /Источник планирования \(SHA\)/u);
  assert.match(traceability, /Service pin/u);
});

test("developer handoff separates repo-local and Store planning from code authorization", async () => {
  const handoff = await read("docs/developer-handoff.md");
  assert.match(handoff, /instructions apply --change add-reset-and-years-term --json/u);
  assert.match(handoff, /course_source=\.\.\/sdd-guide-credit-calculator-stage-1/u);
  assert.match(handoff, /course_source=\.\.\/sdd-guide-credit-calculator-stage-2/u);
  assert.match(handoff, /git -C "\$course_source" show "\$\{source_sha\}:specification\.md"/u);
  assert.match(handoff, /Сквозной R3: planning-only/u);
  assert.match(handoff, /не запускайте `npm exec`, `npm ci` или runtime-check/iu);
  assert.match(handoff, /store doctor sdd-credit-calculator-product-meta --json/u);
  assert.match(handoff, /все фактические main specs и все активные Changes/u);
  assert.match(handoff, /Пустые main specs фиксируются пустым inventory/u);
  assert.match(handoff, /store-only-config\.yaml/u);
  assert.match(handoff, /\.workspace\/services\/credit-calculator.*read-only/u);
  assert.match(handoff, /До отдельного разрешения не запускайте Apply/u);
  assert.match(handoff, /Общая `main` этого R3-примера остаётся repo-local/u);
  assert.match(handoff, /ни равенство, ни неравенство не является условием приёмки/u);
  assert.doesNotMatch(
    handoff,
    /sdd-credit-calculator-(?:stage-[12]-example|product-meta-example)/u,
  );
});

test("package metadata uses the current repository name", async () => {
  const [manifest, lockfile] = await Promise.all([read("package.json"), read("package-lock.json")]);
  for (const content of [manifest, lockfile]) {
    assert.match(content, /"name": "sdd-guide-credit-calculator-stage-3"/u);
    assert.doesNotMatch(content, /"name": "sdd-credit-calculator-example"/u);
  }
});

test("stage 3 AI adds payment summary without replacing the manual change", async () => {
  const [readme, design, agentRequest] = await Promise.all([
    read("README.md"),
    read("DESIGN.md"),
    read("ai/request.md"),
  ]);
  for (const content of [readme, design]) {
    assert.match(content, /3 000 000/u);
    assert.match(content, /16%?/u);
    assert.match(content, /240/u);
    assert.match(content, /0,5/u);
    assert.match(content, /20 лет/u);
    assert.match(content, /переключ|режим «месяцы/iu);
  }
  assert.match(readme, /reset сохраняет режим.*240 месяцев.*20 лет/su);
  assert.match(design, /обоих режимах/u);
  assert.match(readme, /не запускает расчёт/u);
  assert.match(readme, /сохранить ввод целого срока в месяцах/u);
  assert.match(readme, /добавить режим «месяцы \/ годы»/u);
  assert.match(readme, /\[готовое сообщение 3‑ИИ\]\(ai\/request\.md\)/u);
  assert.match(agentRequest, /stage-3-ai-payment-summary.*stage-3-reset-years/su);
  assert.match(agentRequest, /фактически существующие main specs/u);
  assert.match(agentRequest, /stage-2-transfer\.md.*только как дополнительное.*standalone-входа этот файл не нужен/su);
  assert.match(agentRequest, /ВЕСЬ активный Change.*add-reset-and-years-term/su);
  assert.match(agentRequest, /add-payment-summary/u);
  assert.match(agentRequest, /существует хотя бы частично.*до любых записей.*только read-only/su);
  assert.match(agentRequest, /покажи status.*перечисли существующие\s+и недостающие артефакты/su);
  assert.match(agentRequest, /На этом\s+закончи ответ и ничего не меняй, пока я явно не подтвержу/su);
  assert.match(agentRequest, /После подтверждения\s+сохрани существующие решения, продолжи тот же Change и не вызывай new\s+повторно/su);
  assert.match(agentRequest, /STOP\. Больше ничего не меняй.*Ничего не удаляй и не создавай заново.*Дождись моего явного подтверждения продолжить ЭТОТ ЖЕ Change/su);
  assert.match(agentRequest, /неокруглённого платежа/u);
  assert.match(agentRequest, /При ошибке и reset все три результата возвращаются к «—»/u);
  assert.match(agentRequest, /уже выводятся в baseline/u);
  assert.match(agentRequest, /51, сумму 102 и переплату 1/u);
  assert.match(agentRequest, /51, сумму 101 и переплату 0/u);
  assert.match(agentRequest, /Новых полей результата не добавляй/u);
  assert.doesNotMatch(agentRequest, /показать общую сумму выплат и переплату/u);
  assert.match(agentRequest, /не запускай Apply/u);
  assert.match(agentRequest, /source `course\/your_login\/stage-3-ai-payment-summary`.*base `course\/your_login\/stage-3-reset-years`/su);
  assert.doesNotMatch(agentRequest, /очистка предыдущего результата при ошибке остаётся\s+подтверждённым baseline/u);
  // 3-ИИ: Kilo Code в VS Code — основной планировщик; OpenCode — свёрнутая альтернатива.
  assert.match(readme, /Kilo Code/u);
  assert.match(readme, /\.kilo\/skills/u);
  assert.match(readme, /openspec-propose/u);
  assert.match(readme, /<summary>[^<]*OpenCode[^<]*<\/summary>/u);
  assert.match(agentRequest, /Kilo/u);
  assert.match(agentRequest, /\.kilo\/skills/u);
  assert.doesNotMatch(agentRequest, /\.kilocode/u);
});

test("baseline spec stays 3 requirements and 6 scenarios; personal branches are fully prefixed", async () => {
  const [spec, agents, contributing] = await Promise.all([
    read("openspec/specs/credit-calculator/spec.md"),
    read("AGENTS.md"),
    read("CONTRIBUTING.md"),
  ]);
  assert.equal((spec.match(/^### Requirement:/gmu) ?? []).length, 3);
  assert.equal((spec.match(/^#### Scenario:/gmu) ?? []).length, 6);
  for (const doc of [agents, contributing]) {
    assert.doesNotMatch(
      doc,
      /(?<!course\/(?:your_login|<login>)\/)stage-3-(?:base|reset-years|ai-payment-summary)\b/u,
    );
  }
  assert.doesNotMatch(contributing, /stage-3-import-base/u);
  assert.match(contributing, /course\/your_login\/stage-3-base/u);
  // Полный SHA — опциональное provenance по требованию организаторов, не обязанность при каждом коммите.
  assert.match(agents, /Kilo/u);
  assert.doesNotMatch(agents, /полный SHA из Git/u);
  assert.match(agents, /полный SHA[^\n]*организатор/u);
});
