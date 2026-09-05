import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFile(resolve(root, path), "utf8");

test("stage 3 imports the learner's own stage 2 contract and stops before Apply", async () => {
  const readme = await read("README.md");
  assert.match(readme, /show <FULL_R2_SHA>:specification\.md > specification\.md/u);
  assert.match(readme, /docs\/course\/stage-2-transfer\.md/u);
  assert.match(readme, /course\/your_login\/stage-3-import-base/u);
  assert.match(readme, /course\/your_login\/stage-3-reset-years/u);
  assert.match(readme, /add-reset-and-years-term/u);
  assert.match(readme, /код калькулятора не меняется, Apply не запускается/u);
  assert.match(readme, /planning PR.*личную.*stage-3-import-base/u);
  assert.match(readme, /Tasks остаются незавершёнными, Change — активным/u);
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
  assert.match(traceability, /переключатель.*месяцы.*годы/u);
  assert.match(traceability, /шаг `0,5`, default `20`, перевод `0,5→6` и `20→240`/u);
  assert.match(traceability, /reset.*обоих режимах/u);
  assert.match(traceability, /pending implementation/u);
  assert.match(transfer, /Полный SHA принятого коммита/u);
  assert.match(transfer, /два актуальных review/u);
});

test("developer handoff separates repo-local and Store planning from code authorization", async () => {
  const handoff = await read("docs/developer-handoff.md");
  assert.match(handoff, /instructions apply --change add-reset-and-years-term --json/u);
  assert.match(handoff, /COURSE_SOURCE=\.\.\/sdd-credit-calculator-stage-1-example/u);
  assert.match(handoff, /COURSE_SOURCE=\.\.\/sdd-credit-calculator-stage-2-example/u);
  assert.match(handoff, /git -C "\$COURSE_SOURCE" show <FULL_SOURCE_SHA>:specification\.md/u);
  assert.match(handoff, /store doctor sdd-credit-calculator-product-meta --json/u);
  assert.match(handoff, /--change limit-credit-amount --json --store sdd-credit-calculator-product-meta/u);
  assert.match(handoff, /docs\/templates\/store-only-config\.yaml openspec\/config\.yaml/u);
  assert.match(handoff, /\.workspace\/services\/credit-calculator.*read-only/u);
  assert.match(handoff, /не запускай Apply до моего\s+отдельного разрешения/u);
  assert.match(handoff, /Общая `main` R3 остаётся repo-local/u);
});

test("stage 3 guidance preserves the fixed synthetic exercise values", async () => {
  const [readme, design, agentRequest] = await Promise.all([
    read("README.md"),
    read("DESIGN.md"),
    read("ai/request.md"),
  ]);
  for (const content of [readme, design, agentRequest]) {
    assert.match(content, /3 000 000/u);
    assert.match(content, /16%?/u);
    assert.match(content, /240/u);
    assert.match(content, /0,5/u);
    assert.match(content, /20 лет/u);
    assert.match(content, /переключател/u);
    assert.match(content, /обоих режимах/u);
  }
  assert.match(readme, /не запускает расчёт/u);
  assert.match(readme, /ввод целого срока в месяцах сохраняется/u);
});
