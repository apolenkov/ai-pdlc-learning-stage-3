# Передача пакета планирования и будущая реализация

Этот практикум не входит в приёмку R3/3‑ИИ. Завершённая ступень даёт согласованные документы с незавершёнными задачами, а не реализованные функции. Apply и правки кода начинаются только после отдельного разрешения владельца.

## Полный договор

Передайте репозиторий планирования и полный SHA планирования, фактически существующие main specs (пустой набор допустим), **все** активные Changes целиком, матрицу и реальные review. Service repository и точный service pin передаются отдельно.

SHA планирования фиксирует источник требований, service pin — версию приложения. Эти доказательства проверяются независимо: репозитории или SHA могут совпасть либо различаться в зависимости от маршрута, и ни равенство, ни неравенство не является условием приёмки. Один SHA нельзя выводить из другого или записывать вместо него.

## Источник Markdown: R1/R2

Для результата R1 или R2 передайте репозиторий, полный принятый SHA и путь `specification.md`. Завершённая папка аналитика остаётся источником ТЗ; код меняется только в отдельном checkout сервиса.

```bash
# Выберите ровно один источник.
course_source=../sdd-guide-credit-calculator-stage-1
# course_source=../sdd-guide-credit-calculator-stage-2
source_sha='<40_CHARACTER_SOURCE_SHA>'

git -C "$course_source" cat-file -e "$source_sha^{commit}"
git -C "$course_source" show "${source_sha}:specification.md"
git status --short --branch
npm ci
npm run check
```

```text
Прочитай specification.md из указанного полного SHA и AGENTS.md рабочего
репозитория сервиса. Сопоставь все требования с текущим baseline, кодом
и тестами. Покажи план, пробелы и проверки. Пока не меняй файлы,
не запускай Apply и не называй baseline check проверкой новых функций.
```

Если source SHA недоступен или документ расходится с передачей, остановитесь. Не подставляйте текущую `main` или эталон. Для реализации Markdown-договора сначала согласуйте OpenSpec Change в рабочем репозитории сервиса; разрешение на изменение кода запрашивается отдельно.

## Проверка R3 без Apply

Рабочая папка — checkout R3 на переданном SHA. До разрешения разработчик действует read-only. Сначала выполните общую Git-проверку:

```bash
planning_sha='<40_CHARACTER_PLANNING_SHA>'
git cat-file -e "$planning_sha^{commit}"
git show --stat --oneline "$planning_sha"
git status --short --branch
```

Затем выберите один вариант по составу checkout.

### Сквозной R3: planning-only

Если R3 продолжает личный Markdown-проект и в нём нет `package.json` приложения, используйте подготовленный native OpenSpec CLI. Не запускайте `npm exec`, `npm ci` или runtime-check несуществующего сервиса.

```bash
command -v openspec
openspec status --json
openspec status --change add-reset-and-years-term --json
openspec instructions apply --change add-reset-and-years-term --json
```

Если `command -v openspec` не вернул путь, остановитесь и используйте описанную курсом подготовку CLI; не устанавливайте глобальный пакет самовольно. Эти команды проверяют структуру планирования и показывают будущие инструкции, но не реализуют и не проверяют приложение.

Если выполнено 3‑ИИ:

```bash
openspec status --change add-payment-summary --json
openspec instructions apply --change add-payment-summary --json
```

### Отдельный старт R3: существующее приложение

Если checkout — этот standalone-репозиторий с `package.json`, используйте закреплённую проектом версию CLI и сохраните baseline-check:

```bash
npm ci
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

`instructions apply` только показывает будущий план. Не запускайте Apply и не меняйте tasks. В standalone-варианте `npm run check` подтверждает только существующее состояние; в planning-only варианте runtime-проверки на этой стадии нет.

```text
Прочитай AGENTS.md, README.md, фактические main specs, матрицу и ВСЕ
активные Changes. Проверь SHA планирования, ветку и чистоту дерева.
Покажи inventory requirement → scenario → незавершённая задача → check,
зависимости Changes и план будущих edits. Пока ничего не меняй,
не запускай Apply и не называй baseline check проверкой новых функций.
```

## Перенос R4 в личный product-meta

Аналитик работает в одном отдельном checkout product-meta. `openspec/` — единственная редактируемая копия planning; `.workspace` — закреплённый read-only контекст.

Организатор заранее сообщает URL/ref product-meta, Store id и root, репозиторий/SHA планирования, service repository/pin, список main specs и всех активных Changes. Из product-meta:

```bash
git status --short --branch
npm exec openspec -- store list --json
npm exec openspec -- store doctor sdd-credit-calculator-product-meta --json
```

При грязной папке, неверной ветке или другом Store root остановитесь. Не применяйте `force`, не удаляйте чужую регистрацию и не переназначайте Store автоматически.

Перенос копирует по проверенному SHA планирования все фактические main specs и все активные Changes. После 3‑ИИ это минимум `add-reset-and-years-term` и `add-payment-summary`. Пустые main specs фиксируются пустым inventory, а не выдуманным baseline. Archive, sync и Apply не выполняются.

```bash
npm exec openspec -- status --change add-reset-and-years-term --json \
  --store sdd-credit-calculator-product-meta
npm exec openspec -- validate add-reset-and-years-term --strict \
  --store sdd-credit-calculator-product-meta
```

Для `add-payment-summary` повторите команды с его именем. CLI-успех не доказывает полноту: сверьте inventory путей, сценарии и незавершённые задачи с Git tree SHA планирования. `.workspace/services/credit-calculator` не редактируется; наличие pin не является runtime-приёмкой.

### Один владелец planning в personal delivery-ветке сервиса

Общая `main` этого R3-примера остаётся repo-local. Переход сервиса в Store-only выполняется только в отдельной личной delivery-ветке и только после проверенного переноса всего пакета планирования в product-meta.

1. В репозитории планирования проверьте полный SHA планирования и inventory всех main specs и активных Changes. Пустой набор main specs допустим.
2. В Store докажите совпадение каждого перенесённого файла с Git tree по SHA планирования. Проверьте все активные Changes, включая `add-reset-and-years-term` и, если он есть, `add-payment-summary`.
3. В личной delivery-ветке сервиса покажите diff с Store. При расхождении остановитесь и разрешите содержательный конфликт; не объединяйте договор автоматически.
4. Только после полного совпадения удалите из delivery-ветки локальные `openspec/specs` и `openspec/changes`, которые уже перенесены. Не удаляйте неперенесённые или неизвестные файлы.
5. Скопируйте существующий [Store-only config template](https://github.com/apolenkov/sdd-guide-credit-calculator-stage-4-requirements/blob/main/docs/templates/store-only-config.yaml) из соседнего проверенного product-meta checkout:

```bash
cp ../sdd-guide-credit-calculator-stage-4-requirements/docs/templates/store-only-config.yaml \
  openspec/config.yaml
npm exec openspec -- store doctor sdd-credit-calculator-product-meta --json
npm exec openspec -- status --change add-reset-and-years-term --json \
  --store sdd-credit-calculator-product-meta
```

Если существует `add-payment-summary`, повторите `status` с его именем. Затем запустите `npm run check`: он должен проверить Store-only конфигурацию личной ветки, отсутствие второй локальной копии planning и доступность всего договора через выбранный Store.

Не переносите Store-only config в общую `main`. Не поддерживайте repo-local и Store как две редактируемые копии. До отдельного разрешения не запускайте Apply, не меняйте код/runtime-тесты и не закрывайте tasks.

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

Откройте адрес из терминала, проверьте сценарии и остановите сервер `Ctrl+C`. Автоматические результаты и браузерные наблюдения фиксируются отдельно. Commit, push, MR, merge, service pin, sync/archive и Jira-записи — отдельные действия; этот документ их не разрешает.
