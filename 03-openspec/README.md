# Ступень 3 — управляемое изменение OpenSpec

**Ветка:** базовая. Она наследует базовые ступени 1 и 2, но не требует `1-ИИ` или `2-ИИ`.

Сначала выполните корневой быстрый старт и проверьте локальный OpenSpec 1.12.0. Все npm-команды запускайте из корня репозитория.

## Где что находится

- `openspec/config.yaml` — контекст и правила продукта;
- `openspec/specs/credit-calculator/spec.md` — действующая спецификация;
- [`proposal.md`](openspec/changes/archive/2026-08-31-add-credit-calculator/proposal.md) — причина и границы изменения;
- [`specs/`](openspec/changes/archive/2026-08-31-add-credit-calculator/specs/credit-calculator/spec.md) — требования и сценарии;
- [`design.md`](openspec/changes/archive/2026-08-31-add-credit-calculator/design.md) — проектные решения;
- [`tasks.md`](openspec/changes/archive/2026-08-31-add-credit-calculator/tasks.md) — завершённые задачи;
- `review/` — решения по содержанию и реализуемости.

Это полная штатная цепочка `proposal → specs → design → tasks`. Она сохраняется в архиве, потому что учебное изменение уже завершено.

## Проверка

Из корня репозитория:

```bash
npm run openspec:validate
npm run check
```

Команда проверяет действующую спецификацию в строгом режиме и отдельно подтверждает, что все задачи архивного изменения завершены.

Для просмотра текущей спецификации:

```bash
cd 03-openspec
openspec show credit-calculator --type spec
openspec doctor
cd ..
```

## Результат

Текущая спецификация действует, завершённое изменение хранит причины и решения, тесты подтверждают наблюдаемые сценарии.
