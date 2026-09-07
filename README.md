# Ступень 3: отдельный старт с OpenSpec

Это готовый учебный репозиторий для тех, кто начинает сразу с R3. Здесь уже есть приложение и подтверждённый baseline. Репозиторий не заменяет личную историю R1→R2→R3 и не требует клонировать или импортировать результаты ступеней 1–2.

В основном непрерывном маршруте ученик остаётся в одной своей папке: создаёт следующую ветку от принятого R2, настраивает OpenSpec и переносит весь договор из `specification.md`. Команды ниже относятся только к отдельному позднему старту.

Учебная цель — вручную подготовить и согласовать активный Change `add-reset-and-years-term`. Код и runtime-тесты не меняются, Apply не выполняется. Условия учебного продукта:

- сохранить ввод целого срока в месяцах;
- добавить режим «месяцы / годы» без расчёта при переключении;
- в режиме лет использовать шаг `0,5 года`, default `20 лет` и перевод `0,5 → 6`, `20 → 240` месяцев;
- reset сохраняет режим, возвращает `3 000 000 ₽`, `16%` и `240 месяцев` либо `20 лет`, очищает ошибки и результаты до «—» и не запускает расчёт.

## 1. Подготовьте отдельный checkout

Действие выполняет ученик. Замените `your_login`; для повтора добавьте согласованный суффикс.

```bash
git clone https://github.com/apolenkov/sdd-guide-credit-calculator-stage-3.git
cd sdd-credit-calculator-example
git switch -c course/your_login/stage-3-base
npm ci
git status --short --branch
npm run check
git switch -c course/your_login/stage-3-reset-years
git status --short --branch
```

Ожидаемый результат: личная неизменяемая base-ветка создана от проверенного эталона, рабочая ветка Change — от неё. `npm run check` подтверждает только существующий baseline, не будущие reset и режим лет. При ошибке остановитесь и сохраните исходный exit code и текст: не подставляйте другую `main`, не применяйте `force` и не сбрасывайте незнакомые изменения.

## 2. Сверьте baseline

Прочитайте `AGENTS.md`, `openspec/config.yaml`, main spec, `src/app.ts`, `src/calculator.ts`, `test/calculator.test.ts` и шаблон матрицы. Код читается только как доказательство текущего поведения.

```bash
mkdir -p docs/course
cp docs/templates/requirements-traceability.md docs/course/requirements-traceability.md
```

Baseline содержит только подтверждённое поведение. Всё новое остаётся в активном Change с pending task и точной проверкой. Если код противоречит тексту, зафиксируйте разрыв и остановитесь; не реализуйте функцию ради зелёной документальной проверки.

## 3. Подготовьте Change вручную

R3 — ручное упражнение. Используйте native CLI и [официальную справку OpenSpec CLI](https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md); ИИ не обязателен.

```bash
npm exec openspec -- status --json
if [ -d openspec/changes/add-reset-and-years-term ]; then
  printf '%s\n' 'Продолжаем существующий add-reset-and-years-term'
else
  npm exec openspec -- new change add-reset-and-years-term --schema spec-driven
fi
npm exec openspec -- status --change add-reset-and-years-term --json
npm exec openspec -- instructions proposal --change add-reset-and-years-term --json
npm exec openspec -- instructions specs --change add-reset-and-years-term --json
npm exec openspec -- instructions design --change add-reset-and-years-term --json
npm exec openspec -- instructions tasks --change add-reset-and-years-term --json
```

Проверка каталога создаёт Change ровно один раз. Если он уже существует частично, команда `new change` не вызывается: продолжайте по `status` и `instructions`, не создавая дубликат. Нужны `proposal.md`, delta spec, `design.md` и `tasks.md`. Для каждого нового требования сохраните scenario, отдельную task `- [ ]` и проверяемый результат. Не переносите reset и режим лет в main spec как реализованный baseline, не закрывайте tasks и не запускайте Apply.

## 4. Проверьте и сохраните planning-результат

```bash
npm exec openspec -- status --change add-reset-and-years-term --json
npm exec openspec -- validate add-reset-and-years-term --strict
npm run check
git diff --check
git diff
git status --short
```

Пересчитайте требования, сценарии и pending tasks по файлам. Зелёный `validate` доказывает структуру, но не полноту договора и не реализацию.

После содержательного review добавьте только planning-документы, прочитайте staged diff и получите SHA из Git:

```bash
git add docs/course/requirements-traceability.md \
  openspec/changes/add-reset-and-years-term
git diff --cached
git status --short
git commit -m "docs: propose reset and year-based term"
planning_sha=$(git rev-parse HEAD)
git cat-file -e "$planning_sha^{commit}"
git show --stat --oneline "$planning_sha"
```

Push и PR выполняйте только с разрешения владельца назначения. Для общего эталона сначала отправьте личную `course/your_login/stage-3-base`, затем рабочую ветку; planning PR имеет source `course/your_login/stage-3-reset-years` и base `course/your_login/stage-3-base`, не общую `main`. В собственном репозитории следуйте правилам его владельца. Два человеческих review должны относиться к одному актуальному SHA. ИИ-review и CLI их не заменяют.

## Необязательное дополнение 3-ИИ

После сохранённого R3 создайте от него ветку `course/your_login/stage-3-ai-payment-summary`. В ней можно попросить OpenCode создать **новый** `add-payment-summary` в текущем настроенном проекте. Не переустанавливайте OpenCode и не повторяйте основной Change. Используйте [готовое сообщение 3‑ИИ](ai/request.md) либо эквивалентный текст ниже.

```bash
git switch -c course/your_login/stage-3-ai-payment-summary
git status --short --branch
```

```text
Прочитай AGENTS.md, README.md, main specs, весь активный
add-reset-and-years-term и docs/course/requirements-traceability.md.
Проверь папку, ветку и git status; ничего не сбрасывай.

Создай или продолжи отдельный OpenSpec Change add-payment-summary:
после расчёта показать общую сумму выплат и переплату; обе величины
считать из неокруглённого платежа, а отображать в целых рублях.
При ошибке и reset все результаты возвращаются к «—».

Подготовь proposal, delta specs, design и tasks без Apply. Сохрани
add-reset-and-years-term целиком. Для каждого будущего поведения оставь
pending task и проверку. Покажи файлы и пересчёт сценариев и задач.
Не меняй приложение, runtime-тесты или main specs и не делай commit/push.
```

Проверьте фактические файлы и верните конкретное замечание при расхождении формулы, reset, сценариев или tasks. После исправления повторите проверку. Сохраните 3‑ИИ отдельным коммитом; разрешённый PR имеет source `course/your_login/stage-3-ai-payment-summary` и base `course/your_login/stage-3-reset-years`, не общую `main`.

## Передача в R4

R4 выполняется в отдельном личном product-meta checkout. Передаются полный planning SHA, все фактические main specs (включая допустимый пустой набор), все активные Changes целиком и их pending tasks. Planning SHA фиксирует источник требований, service pin — версию приложения; они проверяются независимо. Репозитории или SHA могут совпасть либо различаться, и один SHA нельзя подменять другим.

В product-meta planning хранится в Store; `.workspace` — закреплённый read-only контекст, не место редактирования требований или кода. Подробный договор — в [практикуме передачи](docs/developer-handoff.md).

Завершённая R3 означает согласованный planning-пакет. Runtime-проверки baseline сохраняются, но реализация будущих задач не требуется для завершения ступени.
