import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFile(resolve(root, path), "utf8");

test("late R3 entry preserves the shared request, intent, and personal branch boundary", async () => {
  const readme = await read("README.md");
  assert.match(readme, /отдельн(?:ый|ому) поздн(?:ий|ему) старт/u);
  assert.match(readme, /R1–R3.*один запрос и один рабочий intent/su);
  assert.match(readme, /request-and-answers\.md/u);
  assert.match(readme, /intent-template\.md/u);
  assert.match(readme, /examples\/clear-calculation-result\.md/u);
  assert.match(readme, /intents\/clear-calculation-result\.md/u);
  assert.match(readme, /R3 не обязательна.*следующий шаг R4/su);
  assert.match(readme, /ручном планировании без модели/u);
  assert.match(readme, /создайте fork.*в интерфейсе GitLab/su);
  assert.match(
    readme,
    /git clone https:\/\/gitlab\.example\.invalid\/your_login\/sdd-guide-credit-calculator-stage-3\.git/u,
  );
  assert.match(readme, /`origin`.*ваш fork/su);
  assert.match(readme, /git push -u origin course\/your_login\/stage-3-base/u);
  assert.match(readme, /git push -u origin course\/your_login\/stage-3-reset-years/u);
  assert.doesNotMatch(readme, /git clone https:\/\/gitlab\.example\.invalid\/example-group\//u);
  assert.doesNotMatch(readme, /git clone https:\/\/github\.example\.invalid\//u);
  assert.doesNotMatch(readme, /git remote add/u);
  assert.match(readme, /course\/your_login\/stage-3-base/u);
  assert.match(readme, /course\/your_login\/stage-3-reset-years/u);
  assert.match(readme, /new change add-reset-and-years-term --schema spec-driven/u);
  assert.match(readme, /add-reset-and-years-term/u);
  assert.match(readme, /Код и runtime-тесты не меняются, Apply не выполняется/u);
  assert.match(readme, /planning MR имеет source.*stage-3-reset-years.*target.*stage-3-base/u);
  assert.match(readme, /не закрывайте задачи и не запускайте Apply/u);
  // Основной маршрут — браузер и VS Code; терминальные эквиваленты свёрнуты в один блок.
  assert.match(readme, /Git: Clone/u);
  assert.match(readme, /Create new branch/u);
  assert.match(readme, /Source Control/u);
  assert.match(readme, /Publish Branch/u);
  assert.ok(
    readme.indexOf("Git: Clone") < readme.indexOf("git clone https://gitlab.example.invalid"),
  );
  const terminalBlock =
    /<details><summary>Развернуть точные команды<\/summary>([\s\S]*?)<\/details>/u.exec(readme);
  assert.ok(terminalBlock);
  for (const command of [
    /git clone https:\/\/gitlab\.example\.invalid\/your_login\/sdd-guide-credit-calculator-stage-3\.git/u,
    /git push -u origin course\/your_login\/stage-3-base/u,
    /git push -u origin course\/your_login\/stage-3-reset-years/u,
  ]) {
    assert.match(terminalBlock[1], command);
  }
  assert.doesNotMatch(readme, /\.kilocode/u);
});

test("contributing guide names the canonical personal base branch", async () => {
  const contributing = await read("CONTRIBUTING.md");
  assert.match(contributing, /course\/your_login\/stage-3-base/u);
  assert.doesNotMatch(contributing, /stage-3-import-base/u);
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
  assert.match(transfer, /отметка руководителя проекта/iu);
  assert.match(transfer, /отметка аналитика/iu);
  assert.match(transfer, /отметка технического руководителя/iu);
  assert.match(transfer, /отметка архитектора, если изменение архитектурное или есть спор/iu);
  assert.match(transfer, /course\/<login>\//u);
  assert.match(transfer, /Исходный путь: `specification\.md`/u);
  assert.match(transfer, /точную фиксацию.*полный SHA/su);
  assert.match(transfer, /организатор/u);
  assert.doesNotMatch(
    transfer,
    /Этот шаблон нужен только для основного непрерывного маршрута/u,
  );
  assert.doesNotMatch(traceability, /репозиторий и полный SHA baseline/u);
  assert.match(traceability, /организатор/u);
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

test("manual R3 keeps the agreed reset and year-term behavior planning-only", async () => {
  const [readme, design, agents] = await Promise.all([
    read("README.md"),
    read("DESIGN.md"),
    read("AGENTS.md"),
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
  assert.match(readme, /На этой ступени можно остановиться на ручном планировании без модели/u);
  assert.match(readme, /Apply не выполняется/u);
  assert.match(agents, /один запрос и один intent.*историей Git/su);
  assert.match(agents, /не создавайте отдельный intent для каждого урока/u);
  assert.match(agents, /Apply, правки приложения\/runtime-тестов, закрытие tasks и архивирование Change запрещены/u);
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
      /(?<!course\/(?:your_login|<login>)\/)stage-3-(?:base|reset-years)\b/u,
    );
  }
  assert.doesNotMatch(contributing, /stage-3-import-base/u);
  assert.match(contributing, /course\/your_login\/stage-3-base/u);
  // SHA фиксируется по реальной потребности происхождения и передачи, не при каждом коммите.
  assert.match(agents, /один запрос и один intent.*историей Git/su);
  assert.match(agents, /Автоматическая проверка и ИИ не заменяют людей/u);
  assert.doesNotMatch(agents, /полный SHA из Git/u);
  assert.match(agents, /SHA фиксируйте для происхождения, передачи или по требованию/u);
});
