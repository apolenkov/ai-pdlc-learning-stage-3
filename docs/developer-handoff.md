# Передача planning-пакета и будущая реализация

Этот практикум не входит в приёмку R3/3‑ИИ. Завершённая ступень даёт согласованные документы с pending tasks, а не реализованные функции. Apply и правки кода начинаются только после отдельного разрешения владельца.

## Полный договор

Передайте planning repository и полный planning SHA, фактически существующие main specs (пустой набор допустим), **все** активные Changes целиком, матрицу и реальные review. Service repository и точный service pin передаются отдельно.

Planning SHA и service pin принадлежат разным Git-репозиториям. Их нельзя сравнивать на равенство, записывать один вместо другого или выводить один из другого.

## Проверка R3 без Apply

Рабочая папка — checkout R3 на переданном SHA. До разрешения разработчик действует read-only.

```bash
planning_sha='<40_CHARACTER_PLANNING_SHA>'
git cat-file -e "$planning_sha^{commit}"
git show --stat --oneline "$planning_sha"
git status --short --branch
npm exec openspec -- status --json
npm exec openspec -- status --change add-reset-and-years-term --json
npm exec openspec -- instructions apply --change add-reset-and-years-term --json
npm run check
```

Если выполнено 3‑ИИ:

```bash
npm exec openspec -- status --change add-payment-summary --json
npm exec openspec -- instructions apply --change add-payment-summary --json
```

`instructions apply` только показывает будущий план. Не запускайте Apply, не меняйте tasks и не называйте baseline check проверкой новых функций.

```text
Прочитай AGENTS.md, README.md, фактические main specs, матрицу и ВСЕ
активные Changes. Проверь planning SHA, ветку и чистоту дерева.
Покажи inventory requirement → scenario → pending task → check,
зависимости Changes и план будущих edits. Пока ничего не меняй,
не запускай Apply и не называй baseline check проверкой новых функций.
```

## Перенос R4 в личный product-meta

Аналитик работает в одном отдельном checkout product-meta. `openspec/` — единственная редактируемая копия planning; `.workspace` — закреплённый read-only контекст.

Организатор заранее сообщает URL/ref product-meta, Store id и root, planning repository/SHA, service repository/pin, список main specs и всех активных Changes. Из product-meta:

```bash
git status --short --branch
npm exec openspec -- store list --json
npm exec openspec -- store doctor sdd-credit-calculator-product-meta --json
```

При грязной папке, неверной ветке или другом Store root остановитесь. Не применяйте `force`, не удаляйте чужую регистрацию и не переназначайте Store автоматически.

Перенос копирует по проверенному planning SHA все фактические main specs и все активные Changes. После 3‑ИИ это минимум `add-reset-and-years-term` и `add-payment-summary`. Пустые main specs фиксируются пустым inventory, а не выдуманным baseline. Archive, sync и Apply не выполняются.

```bash
npm exec openspec -- status --change add-reset-and-years-term --json \
  --store sdd-credit-calculator-product-meta
npm exec openspec -- validate add-reset-and-years-term --strict \
  --store sdd-credit-calculator-product-meta
```

Для `add-payment-summary` повторите команды с его именем. CLI-успех не доказывает полноту: сверьте inventory путей, сценарии и pending tasks с Git tree planning SHA. `.workspace/services/credit-calculator` не редактируется; наличие pin не является runtime-приёмкой.

## Реализация отдельно

После принятия полного пакета и отдельного разрешения разработчик создаёт отдельный checkout сервиса. Он показывает план по всем зависимым Changes, затем реализует и закрывает task только после её проверки.

```text
product-meta/                              # Store: specs, Changes, tasks
  .workspace/services/credit-calculator/   # read-only snapshot
credit-calculator-developer/               # checkout для кода и тестов
```

После реализации в developer checkout:

```bash
npm run check
npm run dev
```

Откройте адрес из терминала, проверьте сценарии и остановите сервер `Ctrl+C`. Автоматические результаты и браузерные наблюдения фиксируются отдельно. Commit, push, PR, merge, service pin, sync/archive и Jira-записи — отдельные действия; этот документ их не разрешает.
