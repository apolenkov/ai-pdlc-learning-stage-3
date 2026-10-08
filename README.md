# Факультативная R3: самостоятельный старт с OpenSpec

Это готовый репозиторий для факультативного углубления в ручное планирование с OpenSpec после обязательной практики SDD. Основной маршрут курса — Введение → R1 → R2 → SDD и OpenSpec → R4; R3 не обязательна и не заменяет следующий шаг R4. Здесь уже есть приложение и подтверждённое исходное состояние, но само упражнение меняет только документы.

R1–R3 разбирают один запрос и один документ intent: ошибка и старый результат, сброс формы, затем ввод срока в годах. Для позднего старта прочитайте [обращение и ответы](request-and-answers.md), заполните [общий шаблон](intent-template.md) и сравните формулировку с [примером](examples/clear-calculation-result.md). Один документ требований и его историю Git можно передавать между шагами; отдельные копии или три intent не нужны. Git сохраняет актуальный общий контекст для людей и модели, а будущий метарепозиторий сможет связывать его с кодом и архитектурой.

Шаги ниже относятся только к отдельному позднему старту. Он выполняется в браузере и VS Code: fork и MR — в интерфейсе GitLab, clone, ветки и коммиты — в VS Code. Точные команды терминала для сверки и восстановления собраны в одном блоке [«Через терминал»](#через-терминал--точные-команды) — не выполняйте оба варианта подряд.

Учебная цель — вручную подготовить и согласовать активный Change `add-reset-and-years-term` как факультативную практику после R2. На этой ступени можно остановиться на ручном планировании без модели. Код и runtime-тесты не меняются, Apply не выполняется. Для текущего diff курса требуются отметки руководителя проекта, аналитика и технического руководителя; если изменение затрагивает архитектуру или остаётся спор, нужна четвёртая отметка архитектора. Условия учебного продукта:

- сохранить ввод целого срока в месяцах;
- добавить режим «месяцы / годы» без расчёта при переключении;
- в режиме лет использовать шаг `0,5 года`, default `20 лет` и перевод `0,5 → 6`, `20 → 240` месяцев;
- reset сохраняет режим, возвращает `3 000 000 ₽`, `16%` и `240 месяцев` либо `20 лет`, очищает ошибки и результаты до «—» и не запускает расчёт.

## 1. Подготовьте отдельный checkout

Действие выполняет ученик в браузере и VS Code.

Откройте
[`sdd-guide-credit-calculator-stage-3`](https://github.com/apolenkov/sdd-guide-credit-calculator-stage-3)
в браузере и создайте fork кнопкой **Fork** в интерфейсе GitLab. Откройте свой
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

Для самостоятельного старта сохраните созданный `intents/clear-calculation-result.md` рядом с `docs/course/requirements-traceability.md` и `openspec/changes/add-reset-and-years-term`: прочитайте весь diff — двойной щелчок по файлу открывает сравнение — добавьте только эти документы в staged, ещё раз прочитайте staged diff, введите сообщение `docs: propose reset and year-based term` и нажмите **Commit**. Если вы продолжили уже существующую личную историю, используйте ранее принятый intent, не создавая копию.

Отправьте обе личные ветки в ваш fork: выберите каждую ветку в строке состояния и нажмите **Publish Branch** (или **Push**) — обе уходят через уже настроенный `origin`. Откройте MR внутри этого fork: planning MR имеет source `course/your_login/stage-3-reset-years` и target `course/your_login/stage-3-base`, не общую `main`. Если GitLab предлагает target в upstream `example-group`, смените его на свой fork. Для этой версии нужны три отметки по текущему diff, а при архитектурном изменении или споре — четвёртая отметка архитектора. После этого MR можно смёржить в личную base-ветку fork; в общую `main` не сливайте. В собственном репозитории следуйте его правилам. Автоматическая проверка и ИИ не заменяют человеческие отметки. Полный SHA планирования запишите из блока «Через терминал», только если его требуют для передачи или организаторы.

Проверьте фактические файлы и верните конкретное замечание при расхождении формулы, сброса, сценариев или задач. После исправления повторите проверку. Получите обязательные отметки по актуальному diff до его передачи.

## Через терминал · точные команды

Основной маршрут выше выполняется в браузере и VS Code. Команды ниже — для сверки состояния, восстановления и тех, кто сознательно работает в терминале.

<details><summary>Развернуть точные команды</summary>

Clone fork, проверка `origin` и обе личные ветки (эквивалент шага 1):

```bash
git clone https://gitlab.example.invalid/your_login/sdd-guide-credit-calculator-stage-3.git
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
git add intents/clear-calculation-result.md \
  docs/course/requirements-traceability.md \
  openspec/changes/add-reset-and-years-term
git diff --cached
git status --short
git commit -m "docs: propose reset and year-based term"
git push -u origin course/your_login/stage-3-base
git push -u origin course/your_login/stage-3-reset-years
```

</details>

## Передача в R4

R4 выполняется в отдельном личном product-meta checkout. Передаются полный SHA планирования, все фактические main specs (включая допустимый пустой набор), все активные Changes целиком и их незавершённые задачи. SHA планирования фиксирует источник требований, service pin — версию приложения; они проверяются независимо. Репозитории или SHA могут совпасть либо различаться, и один SHA нельзя подменять другим.

В product-meta planning хранится в Store; `.workspace` — закреплённый read-only контекст, не место редактирования требований или кода. Подробный договор — в [практикуме передачи](docs/developer-handoff.md).

Завершённая R3 означает согласованный пакет планирования. Проверки исходного состояния сохраняются, но реализация будущих задач не требуется для завершения ступени.
