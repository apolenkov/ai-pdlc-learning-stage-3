# Ступень 3. Накопительное ТЗ в OpenSpec

На этой ступени вы переносите **свой** принятый `specification.md` из ступени 2 и превращаете накопительное ТЗ в OpenSpec. Новое требование — переключатель режима срока «месяцы / годы» с сохранением существующего ввода в месяцах. Результат — согласованный активный Change `add-reset-and-years-term`; код калькулятора не меняется, Apply не запускается.

Синтетические условия упражнения:

- уже реализованное правило ступени 1 остаётся в baseline: после ошибки предыдущий результат очищен и вместо него показано «—»;
- ввод целого срока в месяцах и существующие месячные сценарии сохраняются; рядом появляется переключатель режима «месяцы / годы», а его переключение не запускает расчёт;
- в режиме лет поле имеет шаг `0,5 года`, значение по умолчанию `20 лет` и перед расчётом переводится в целое число месяцев (`0,5 года = 6 месяцев`, `20 лет = 240 месяцев`);
- ещё не реализованный reset работает в обоих режимах: сохраняет выбранный режим, возвращает `3 000 000 ₽`, `16%` и срок `240 месяцев` либо `20 лет`, очищает ошибки и результаты до «—» и не запускает расчёт.

Это условия учебного продукта, а не банковские правила.

## 1. Зафиксируйте источник ступени 2

Нужны два соседних checkout: ваша завершённая ступень 2 и новый checkout этого репозитория. В исходной папке должны быть актуальные подтверждения другого аналитика и разработчика или архитектора. Автоматическая проверка и ИИ не заменяют эти review.

Из будущего каталога для ступени 3 проверьте источник; замените `<FULL_R2_SHA>` полным SHA принятого коммита:

```bash
git -C ../sdd-credit-calculator-stage-2-example status --short --branch
git -C ../sdd-credit-calculator-stage-2-example rev-parse HEAD
git -C ../sdd-credit-calculator-stage-2-example cat-file -e <FULL_R2_SHA>^{commit}
git -C ../sdd-credit-calculator-stage-2-example show <FULL_R2_SHA>:specification.md
```

Если SHA недоступен, дерево грязное или показан не тот документ, остановитесь. Не берите `main` или эталон вместо собственного результата.

## 2. Создайте личную import-base

В командах замените `your_login` и `<FULL_R2_SHA>`. Для повторного прохождения добавьте одинаковый суффикс к обеим личным веткам.

```bash
git clone https://github.com/apolenkov/sdd-guide-credit-calculator-stage-3.git
cd sdd-credit-calculator-example
git switch -c course/your_login/stage-3-import-base
npm ci
npm run check
git -C ../sdd-credit-calculator-stage-2-example show <FULL_R2_SHA>:specification.md > specification.md
mkdir -p docs/course
cp docs/templates/stage-2-transfer.md docs/course/stage-2-transfer.md
```

Заполните `docs/course/stage-2-transfer.md`: исходный репозиторий, полный SHA, путь `specification.md`, ссылки на два актуальных review и перечень сохранённых сценариев. Затем прочитайте diff и сохраните только импорт:

```bash
git add specification.md docs/course/stage-2-transfer.md
git diff --cached
git commit -m "docs: import personal stage 2 specification"
git push -u origin course/your_login/stage-3-import-base
```

Создайте рабочую ветку от этой личной базы:

```bash
git switch -c course/your_login/stage-3-reset-years
```

Импорт и новое задание не смешиваются. Ветка ступени 2 после этого остаётся историей и больше не является активным местом изменения требований.

## 3. Разделите baseline и ещё не реализованные требования

Прочитайте:

- `specification.md` и `docs/course/stage-2-transfer.md`;
- `openspec/specs/credit-calculator/spec.md`;
- `src/app.ts`, `src/calculator.ts` и `test/calculator.test.ts` только для проверки текущего поведения;
- `docs/templates/requirements-traceability.md`.

Скопируйте шаблон:

```bash
cp docs/templates/requirements-traceability.md docs/course/requirements-traceability.md
```

Заполните матрицу по правилу:

| Требование | Где должно находиться |
| --- | --- |
| Очистка предыдущего результата при ошибке | baseline, потому что это подтверждённое текущее поведение |
| Reset в обоих режимах срока | активный Change и незавершённая задача с проверкой |
| Переключатель «месяцы / годы» и перевод лет | активный Change и незавершённая задача с проверкой |

Baseline не должен обещать reset или переключатель срока до реализации. Если чтение кода и запущенные проверки не подтверждают требование, не переносите его в baseline: оставьте в Change незавершённую задачу реализации и критерий результата.

## 4. Подготовьте OpenSpec Change без Apply

Используйте OpenSpec Explore, если после сопоставления осталась существенная развилка. После явного решения создайте через OpenSpec Propose Change `add-reset-and-years-term` по схеме `spec-driven`.

Сообщение агенту:

```text
Прочитай AGENTS.md, README.md, specification.md,
docs/course/stage-2-transfer.md,
docs/course/requirements-traceability.md,
openspec/specs/credit-calculator/spec.md и текущую реализацию только
для проверки baseline. Проверь ветку и git status; ничего не сбрасывай.

Подготовь OpenSpec Change add-reset-and-years-term без Apply.
Baseline должен содержать только подтверждённое текущее поведение.
В активный Change включи все ещё не реализованные требования:
1) ввод целого срока в месяцах сохраняется; переключатель «месяцы / годы»
выбирает единицу ввода и сам не запускает расчёт;
2) в режиме лет шаг равен 0,5, значение по умолчанию — 20 лет;
перед расчётом годы переводятся в целые месяцы: 0,5 года = 6 месяцев,
20 лет = 240 месяцев;
3) reset работает в обоих режимах, сохраняет выбранный режим, возвращает
3 000 000 ₽, 16% и срок 240 месяцев либо 20 лет, очищает ошибки
и результаты до «—» и не запускает расчёт.

Для каждого требования сохрани сценарии, отдельную незавершённую задачу
реализации и точную проверку результата. Покажи матрицу
«требование → baseline или Change → сценарий → task → check».
Не меняй src, index.html, styles.css или test/calculator.test.ts,
не отмечай tasks выполненными и не архивируй Change.
```

Проверь, что Change содержит `proposal.md`, delta spec, `design.md` и `tasks.md`. Все задачи реализации reset в обоих режимах, переключателя и перевода лет должны оставаться `- [ ]`.

## 5. Проверьте полноту переноса

```bash
npm exec openspec -- status --change add-reset-and-years-term --json
npm exec openspec -- validate add-reset-and-years-term --strict
npm run check
git diff --check
git diff
git status --short
```

Зелёная проверка доказывает структуру документов и неизменность существующей основы, но не реализацию новых функций.

Удалите временный рабочий `specification.md` только после того, как матрица показывает все его требования и сценарии в baseline либо активном Change. Исходный текст останется в отдельном import-коммите и в исходном SHA ступени 2.

## 6. Получите два человеческих review

Сначала другой аналитик проверяет полноту требований и сценариев. Затем разработчик или архитектор проверяет реализуемость design, задач и проверок. Оба подтверждения относятся к одному актуальному diff; после содержательных правок нужны новые подтверждения.

Добавьте только учебные документы и Change, прочитайте staged diff и отправьте рабочую ветку:

```bash
git add -A -- specification.md docs/course \
  openspec/specs/credit-calculator/spec.md \
  openspec/changes/add-reset-and-years-term
git diff --cached
git status --short
git commit -m "docs: propose reset and year-based term"
git push -u origin course/your_login/stage-3-reset-years
```

Откройте planning PR из `course/your_login/stage-3-reset-years` в личную `course/your_login/stage-3-import-base`, а не в общую `main`. После двух review закройте PR без слияния и сохраните рабочую ветку. Зафиксируйте её полный SHA командой `git rev-parse HEAD`: этот SHA, baseline и весь активный Change передаются организатору ступени 4. Tasks остаются незавершёнными, Change — активным.

## ИИ-дополнение

Для необязательной предпроверки используйте [готовое сообщение](ai/request.md). ИИ не создаёт человеческое одобрение.

## Реализация отдельно

Ступень завершена согласованным Change. Реализация накопительного контракта выполняется только после отдельного разрешения по [практикуму передачи разработчику](docs/developer-handoff.md).
