# Ступень 3: отдельный старт с OpenSpec

Это готовый учебный репозиторий для тех, кто начинает сразу с R3. Здесь уже есть приложение и подтверждённое исходное состояние. Репозиторий не заменяет личную историю R1→R2→R3 и не требует клонировать или импортировать результаты ступеней 1–2.

Основной сквозной маршрут — один личный checkout, созданный на R1: в нём ученик создаёт следующую ветку от принятого R2, настраивает OpenSpec и переносит весь договор из `specification.md`. На сквозном маршруте этот репозиторий не клонируется, а шаблоны `docs/templates` из него не заполняются — там действуют материалы основного курса.

Шаги ниже относятся только к отдельному позднему старту. Он выполняется в браузере и VS Code: fork и PR — в интерфейсе GitHub, clone, ветки и коммиты — в VS Code. Точные команды терминала для сверки и восстановления собраны в одном блоке [«Через терминал»](#через-терминал--точные-команды) — не выполняйте оба варианта подряд.

Учебная цель — вручную подготовить и согласовать активный Change `add-reset-and-years-term`. Код и runtime-тесты не меняются, Apply не выполняется. Условия учебного продукта:

- сохранить ввод целого срока в месяцах;
- добавить режим «месяцы / годы» без расчёта при переключении;
- в режиме лет использовать шаг `0,5 года`, default `20 лет` и перевод `0,5 → 6`, `20 → 240` месяцев;
- reset сохраняет режим, возвращает `3 000 000 ₽`, `16%` и `240 месяцев` либо `20 лет`, очищает ошибки и результаты до «—» и не запускает расчёт.

## 1. Подготовьте отдельный checkout

Действие выполняет ученик в браузере и VS Code.

Откройте
[`sdd-guide-credit-calculator-stage-3`](https://github.com/apolenkov/sdd-guide-credit-calculator-stage-3)
в браузере и создайте fork кнопкой **Fork** в интерфейсе GitHub. Откройте свой
fork и скопируйте его HTTPS-адрес. Замените `your_login` своим корпоративным
логином; для повтора добавьте согласованный суффикс.

В VS Code вызовите **Git: Clone Repository** (палитра команд или кнопка
**Clone Repository** в **Source Control**), вставьте HTTPS-адрес своего fork и
выберите папку учебных проектов. Откройте клонированную папку.

Создайте личную неизменяемую base-ветку: нажмите имя текущей ветки в строке
состояния слева внизу → **Create new branch** → введите
`course/your_login/stage-3-base`. Ветка создаётся от `main` проверенного
эталона.

Во встроенном терминале VS Code (**Terminal** → **New Terminal**) установите
зависимости и проверьте исходное состояние:

```bash
npm ci
npm run check
```

`npm run check` подтверждает только существующее поведение, не будущие reset и
режим лет.

Тем же действием в строке состояния создайте рабочую ветку Change
`course/your_login/stage-3-reset-years` — от только что созданной личной base.

Ожидаемый результат: `origin` указывает на ваш fork, личная неизменяемая
base-ветка создана от проверенного эталона, рабочая ветка Change — от неё.
Второй remote для этого маршрута не нужен. При ошибке остановитесь и сохраните
исходный exit code и текст: не подставляйте другую `main`, не применяйте
`force` и не сбрасывайте незнакомые изменения.

## 2. Сверьте baseline

Прочитайте `AGENTS.md`, `openspec/config.yaml`, main spec, `src/app.ts`, `src/calculator.ts`, `test/calculator.test.ts` и шаблон матрицы. Код читается только как доказательство текущего поведения.

В проводнике VS Code создайте папку `docs/course` и скопируйте в неё файл `docs/templates/requirements-traceability.md` (терминальный эквивалент — в блоке «Через терминал»).

Исходное состояние содержит только подтверждённое поведение. Всё новое остаётся в активном Change с незавершённой задачей и точной проверкой. Если код противоречит тексту, зафиксируйте разрыв и остановитесь; не реализуйте функцию ради зелёной документальной проверки.

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

Проверка каталога создаёт Change ровно один раз. Если он уже существует частично, команда `new change` не вызывается: продолжайте по `status` и `instructions`, не создавая дубликат. Нужны `proposal.md`, delta spec, `design.md` и `tasks.md`. Для каждого нового требования сохраните scenario, отдельную task `- [ ]` и проверяемый результат. Не переносите reset и режим лет в main spec как реализованное поведение, не закрывайте задачи и не запускайте Apply.

## 4. Проверьте и сохраните результат планирования

Во встроенном терминале VS Code проверьте Change и рабочее дерево:

```bash
npm exec openspec -- status --change add-reset-and-years-term --json
npm exec openspec -- validate add-reset-and-years-term --strict
npm run check
git diff --check
git status --short
```

Пересчитайте требования, сценарии и незавершённые задачи по файлам. Зелёный `validate` доказывает структуру, но не полноту договора и не реализацию.

После содержательного review сохраните только документы планирования через **Source Control** (значок ветки на левой панели): прочитайте весь diff — двойной щелчок по файлу открывает сравнение — добавьте в staged только `docs/course/requirements-traceability.md` и `openspec/changes/add-reset-and-years-term` кнопкой **+** у файла, ещё раз прочитайте staged diff, введите сообщение `docs: propose reset and year-based term` и нажмите **Commit**.

Отправьте обе личные ветки в ваш fork: выберите каждую ветку в строке состояния и нажмите **Publish Branch** (или **Push**) — обе уходят через уже настроенный `origin`. Откройте PR внутри этого fork: planning PR имеет source `course/your_login/stage-3-reset-years` и base `course/your_login/stage-3-base`, не общую `main`. После двух review PR можно смёржить в личную base-ветку fork; в общую `main` не сливайте. В собственном репозитории следуйте правилам его владельца. Два человеческих review должны относиться к одному актуальному diff. ИИ-review и CLI их не заменяют. Полный SHA планирования запишите из блока «Через терминал», только если его требуют для передачи или организаторы.

## Необязательное дополнение 3-ИИ

После сохранённого R3 создайте от него ветку `course/your_login/stage-3-ai-payment-summary` тем же действием **Create new branch** в строке состояния VS Code.

Основной инструмент шага — расширение **Kilo Code** в VS Code: репозиторий уже содержит native-skills в `.kilo/skills`, дополнительная инициализация не нужна — Kilo подхватывает их при открытии папки. Набор ограничен планированием: `openspec-propose` создаёт Change со всеми артефактами, `openspec-update-change` пересобирает существующие артефакты после правок, `openspec-explore` помогает обдумать открытые вопросы. Apply, archive и sync на этой ступени не предусмотрены ни skills, ни правилами.

В чате Kilo попросите создать **новый** `add-payment-summary` в текущем проекте. Не переустанавливайте инструмент и не повторяйте основной Change. Используйте [готовое сообщение 3‑ИИ](ai/request.md) либо эквивалентный текст ниже.

<details><summary>Продвинутый вариант: OpenCode</summary>

Тот же сценарий работает в уже настроенном OpenCode-проекте: дерево `.opencode/skills` тоже лежит в репозитории. Ограничения ступени не зависят от инструмента — только planning, без Apply и без commit/push; сообщение агенту то же — [готовое сообщение 3‑ИИ](ai/request.md). Ветку `course/your_login/stage-3-ai-payment-summary` можно создать и командой `git switch -c` из блока «Через терминал».

</details>

```text
Прочитай AGENTS.md, README.md, main specs, весь активный
add-reset-and-years-term и docs/course/requirements-traceability.md.
Проверь папку, ветку и git status; ничего не сбрасывай.

Создай или продолжи отдельный OpenSpec Change add-payment-summary.
Общая сумма выплат и переплата уже выводятся в baseline и сейчас
считаются от округлённого платежа: при 101 ₽, 0% и 2 месяцах
приложение показывает платёж 51 ₽, общую сумму 102 ₽ и переплату 1 ₽.
Change исправляет формулу: обе величины считать из неокруглённого
платежа и отображать в целых рублях — для того же ввода ожидается
платёж 51 ₽, общая сумма 101 ₽ и переплата 0 ₽.
Новых полей результата не добавлять.
При ошибке и reset все три результата возвращаются к «—».

Подготовь proposal, delta specs, design и tasks без Apply. Сохрани
add-reset-and-years-term целиком. Для каждого будущего поведения оставь
незавершённую задачу и проверку. Покажи файлы и пересчёт сценариев и задач.
Не меняй приложение, runtime-тесты или main specs и не делай commit/push.
```

Проверьте фактические файлы и верните конкретное замечание при расхождении формулы, reset, сценариев или tasks. После исправления повторите проверку. Сохраните 3‑ИИ отдельным коммитом через **Source Control**; разрешённый PR имеет source `course/your_login/stage-3-ai-payment-summary` и base `course/your_login/stage-3-reset-years`, не общую `main`.

## Через терминал · точные команды

Основной маршрут выше выполняется в браузере и VS Code. Команды ниже — для сверки состояния, восстановления и тех, кто сознательно работает в терминале.

<details><summary>Развернуть точные команды</summary>

Clone fork, проверка `origin` и обе личные ветки (эквивалент шага 1):

```bash
git clone https://github.example.invalid/your_login/sdd-guide-credit-calculator-stage-3.git
cd sdd-guide-credit-calculator-stage-3
git remote get-url origin
git switch -c course/your_login/stage-3-base
npm ci
git status --short --branch
npm run check
git switch -c course/your_login/stage-3-reset-years
git status --short --branch
```

Копия матрицы прослеживаемости (эквивалент шага 2):

```bash
mkdir -p docs/course
cp docs/templates/requirements-traceability.md docs/course/requirements-traceability.md
```

Коммит планирования и отправка обеих веток (эквивалент шага 4):

```bash
git add docs/course/requirements-traceability.md \
  openspec/changes/add-reset-and-years-term
git diff --cached
git status --short
git commit -m "docs: propose reset and year-based term"
git push -u origin course/your_login/stage-3-base
git push -u origin course/your_login/stage-3-reset-years
```

Ветка 3‑ИИ и полный SHA head — только для передачи или по требованию организаторов:

```bash
git switch -c course/your_login/stage-3-ai-payment-summary
git status --short --branch
git rev-parse HEAD
git show --stat --oneline HEAD
```

</details>

## Передача в R4

R4 выполняется в отдельном личном product-meta checkout. Передаются полный SHA планирования, все фактические main specs (включая допустимый пустой набор), все активные Changes целиком и их незавершённые задачи. SHA планирования фиксирует источник требований, service pin — версию приложения; они проверяются независимо. Репозитории или SHA могут совпасть либо различаться, и один SHA нельзя подменять другим.

В product-meta planning хранится в Store; `.workspace` — закреплённый read-only контекст, не место редактирования требований или кода. Подробный договор — в [практикуме передачи](docs/developer-handoff.md).

Завершённая R3 означает согласованный пакет планирования. Проверки исходного состояния сохраняются, но реализация будущих задач не требуется для завершения ступени.
