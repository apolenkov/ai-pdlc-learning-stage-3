# Практикум передачи разработчику

Этот практикум не входит в приёмку аналитических ступеней. Начинайте его только после принятия ТЗ людьми и отдельного разрешения изменять код. Разработчик реализует весь накопительный контракт, а не только последнюю дельту.

## Общая последовательность

```text
согласованный источник → проверка папок и ветки → план без edits
→ отдельное разрешение Apply/кода → реализация → check → dev и ручные сценарии
```

До разрешения допустимы только чтение, `status`, `instructions`, baseline `npm run check` и подготовка плана. `npm run dev` проверяет существующую основу; он не доказывает будущие функции.

## Источник Markdown: ступени 1–2

Получите репозиторий, полный принятый SHA и путь `specification.md`. Код меняется в отдельном checkout `sdd-credit-calculator-example`, не в завершённой ветке аналитика. Явно выберите источник: путь ступени 1 для результата R1 или путь ступени 2 для результата R2.

```bash
# Для передачи результата ступени 1:
COURSE_SOURCE=../sdd-credit-calculator-stage-1-example
# Для передачи результата ступени 2 вместо строки выше:
# COURSE_SOURCE=../sdd-credit-calculator-stage-2-example

git -C "$COURSE_SOURCE" cat-file -e <FULL_SOURCE_SHA>^{commit}
git -C "$COURSE_SOURCE" show <FULL_SOURCE_SHA>:specification.md
git status --short --branch
npm ci
npm run check
```

Первое сообщение агенту:

```text
Прочитай specification.md из указанного полного SHA и AGENTS.md рабочего
репозитория сервиса. Сопоставь все требования с текущим baseline, кодом
и тестами. Покажи план, пробелы и проверки. Пока не меняй файлы,
не запускай Apply и не называй baseline check проверкой новых функций.
```

Если источник недоступен или расходится с переданным описанием, остановитесь. Для реализации Markdown-контракта сначала согласуйте OpenSpec Change в рабочем repo; разрешение на изменение кода запрашивается отдельно.

## Repo-local OpenSpec: ступень 3

Работайте в личной ветке R3, где находится согласованный активный Change `add-reset-and-years-term`.

```bash
git status --short --branch
npm ci
npm exec openspec -- status --change add-reset-and-years-term --json
npm exec openspec -- instructions apply --change add-reset-and-years-term --json
npm run check
```

Первое сообщение агенту до разрешения:

```text
Прочитай AGENTS.md, baseline и весь Change add-reset-and-years-term.
Покажи матрицу requirement → scenario → pending task → check и план edits.
Не меняй код, тесты или tasks и не запускай Apply до моего отдельного
разрешения. Существующий npm run check — только baseline.
```

После явного разрешения используйте OpenSpec Apply. Код и runtime-тесты меняются в этом checkout; task отмечается выполненной только после её проверки.

## Store: ступень 4

Нужны две соседние папки:

```text
work/
  sdd-credit-calculator-product-meta-example/  # единственный владелец specs/Changes
  sdd-credit-calculator-example/               # код и runtime-тесты
```

`.workspace/services/credit-calculator` внутри meta — только закреплённый read-only контекст. Никогда не реализуйте в нём функцию.

Из meta проверьте регистрацию и root:

```bash
npm exec openspec -- store list --json
npm exec openspec -- store doctor sdd-credit-calculator-product-meta --json
npm exec openspec -- status --change add-reset-and-years-term --json --store sdd-credit-calculator-product-meta
npm exec openspec -- instructions apply --change add-reset-and-years-term --json --store sdd-credit-calculator-product-meta
npm exec openspec -- status --change limit-credit-amount --json --store sdd-credit-calculator-product-meta
npm exec openspec -- instructions apply --change limit-credit-amount --json --store sdd-credit-calculator-product-meta
```

Если Store ID отсутствует или указывает на другой checkout, остановитесь: не переключайте и не удаляйте чужую регистрацию автоматически.

### Один владелец planning-артефактов

Общая `main` R3 остаётся repo-local. Только в персональной delivery-ветке сервиса после сверки переноса:

1. Докажите, что baseline и **весь** активный R3 Change находятся в Store по исходному SHA.
2. Покажите diff Store и сервиса; разрешите содержательные конфликты.
3. Удалите из персональной ветки сервиса только уже перенесённые локальные `openspec/specs` и `openspec/changes`.
4. Замените `openspec/config.yaml` проверенным шаблоном из соседнего Store: `cp ../sdd-credit-calculator-product-meta-example/docs/templates/store-only-config.yaml openspec/config.yaml`.
5. Повторите `store doctor` и команды с явным `--store`.

Не поддерживайте две редактируемые копии контракта. Не переносите эту смену ownership в общую `main` учебного шаблона.
После перехода `npm run check` распознаёт `store: sdd-credit-calculator-product-meta`, требует отсутствия локальных `openspec/specs` и `openspec/changes` и валидирует planning-контракт через зарегистрированный Store.

Первое сообщение агенту до разрешения:

```text
Прочитай AGENTS.md обеих папок, docs/course/stage-3-transfer.md в Store,
baseline, унаследованный Change add-reset-and-years-term и зависимый
Change limit-credit-amount через явный Store sdd-credit-calculator-product-meta.
Проверь Store root и текущую персональную delivery-ветку сервиса.
Покажи порядок реализации по зависимостям, полный план edits и проверки.
Не меняй .workspace, код, тесты или tasks и не запускай Apply до моего
отдельного разрешения.
```

После отдельного разрешения сначала реализуйте и проверьте унаследованный `add-reset-and-years-term`, затем `limit-credit-amount`. Код и runtime-тесты меняются только в сервисном checkout; tasks — только в Store.

## Проверка после реализации

В сервисном checkout:

```bash
npm run check
npm run dev
```

Откройте `http://127.0.0.1:4173/` и проверьте сценарии обоих Changes. Сервер остановите `Ctrl+C`. Документируйте отдельно автоматические результаты и реальные наблюдения в браузере. Commit, push, merge, обновление `services.lock.yaml` и архивирование Changes — отдельные действия, не выполняемые этим практикумом автоматически.
