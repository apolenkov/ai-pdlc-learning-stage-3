# Прослеживаемость накопительного контракта

Скопируйте файл в `docs/course/requirements-traceability.md`. Для отдельного старта укажите текущий репозиторий и полный SHA baseline; для непрерывного маршрута — личный source SHA R2. Не отмечайте проверку выполненной без фактического основания.

| Требование / сценарий | Источник: repo + полный SHA + путь | Baseline или активный Change | Путь и заголовок сценария | Pending task, если не реализовано | Проверка результата | Статус |
| --- | --- | --- | --- | --- | --- | --- |
| Ошибка очищает предыдущий результат | `<SOURCE>` | `openspec/specs/credit-calculator/spec.md` | `<BASELINE_SCENARIO>` | — только при доказанном поведении | существующий код, тест и ручной сценарий | `<VERIFIED_OR_GAP>` |
| Переключатель «месяцы / годы» | `условие R3` | `openspec/changes/add-reset-and-years-term` | `<DELTA_SCENARIO>` | `<PENDING_TASK_ID>` | переключение не запускает расчёт; ввод целых месяцев сохранён | `pending implementation` |
| Срок в годах | `условие R3` | `openspec/changes/add-reset-and-years-term` | `<DELTA_SCENARIO>` | `<PENDING_TASK_ID>` | шаг `0,5`, default `20`, перевод `0,5→6` и `20→240` | `pending implementation` |
| Reset в выбранном режиме | `условие R3` | `openspec/changes/add-reset-and-years-term` | `<DELTA_SCENARIO>` | `<PENDING_TASK_ID>` | режим сохранён; значения `3 000 000 / 16 / 240 месяцев` либо `20 лет`; ошибки и результаты очищены без расчёта | `pending implementation` |
| Общая сумма и переплата | `условие 3-ИИ`, если выполнено | `openspec/changes/add-payment-summary` | `<DELTA_SCENARIO>` | `<PENDING_TASK_ID>` | формулы используют неокруглённый платёж; display — целые рубли; ошибка/reset очищают три результата | `pending implementation` |

## Контроль полноты R3

- [ ] Каждый исходный сценарий находится ровно в доказанном baseline либо активном Change.
- [ ] Для каждого не реализованного требования есть scenario, task `- [ ]` и проверяемый результат.
- [ ] `add-reset-and-years-term` сохранён целиком; 3‑ИИ не заменяет и не архивирует его.
- [ ] Числа требований, сценариев и tasks пересчитаны по фактическим файлам, а не взяты из отчёта агента.
- [ ] `validate` не назван доказательством реализации.

## Inventory для R4

- Planning repository: `<PLANNING_REPOSITORY>`
- Planning source SHA: `<40_CHARACTER_PLANNING_SHA>`
- Main specs: `<ACTUAL_PATHS_OR_EXPLICIT_EMPTY>`
- Active Changes: `<ALL_ACTIVE_CHANGE_PATHS>`
- Service repository: `<SERVICE_REPOSITORY>`
- Service pin: `<40_CHARACTER_SERVICE_SHA>`

- [ ] Planning SHA проверен через `cat-file`/`show` в planning-репозитории.
- [ ] Service pin проверен отдельно в репозитории приложения.
- [ ] Все активные Changes перенесены целиком вместе со сценариями и pending tasks.
- [ ] Пустой набор main specs сохранён как допустимый факт, без фиктивного baseline.
- [ ] `.workspace` не редактировалась и Apply не запускался.
