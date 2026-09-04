import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { describe, it } from "node:test";
import { runInNewContext } from "node:vm";
import { calculateLoan } from "../src/calculator.ts";

describe("calculateLoan", () => {
  it("считает аннуитетный платёж и округляет его до рубля", () => {
    const result = calculateLoan({ principal: 3_000_000, annualRate: 16, months: 240 });

    assert.equal(result.monthlyPayment, 41_738);
    assert.equal(result.totalPayment, 10_017_120);
    assert.equal(result.overpayment, 7_017_120);
  });

  it("обрабатывает нулевую ставку отдельно", () => {
    const result = calculateLoan({ principal: 120_000, annualRate: 0, months: 12 });

    assert.deepEqual(result, {
      monthlyPayment: 10_000,
      totalPayment: 120_000,
      overpayment: 0
    });
  });

  it("сохраняет платёж при положительной ставке меньше машинной точности единицы", () => {
    assert.deepEqual(calculateLoan({ principal: 120_000, annualRate: 1e-13, months: 12 }), {
      monthlyPayment: 10_000,
      totalPayment: 120_000,
      overpayment: 0
    });
  });

  it("не переполняет промежуточную степень при большом сроке", () => {
    const result = calculateLoan({ principal: 120_000, annualRate: 1200, months: 100_000 });
    assert.equal(result.monthlyPayment, 120_000);
    assert.equal(result.totalPayment, 12_000_000_000);
    assert.equal(result.overpayment, 11_999_880_000);
  });

  it("считает представимый результат при большой сумме и ставке", () => {
    const result = calculateLoan({ principal: 1e300, annualRate: 100, months: 600 });
    assert.ok(Math.abs(result.monthlyPayment / (1e300 / 12) - 1) < 1e-14);
    assert.ok(Object.values(result).every(Number.isFinite));
    const highRate = calculateLoan({ principal: 1e-300, annualRate: 1e308, months: 120 });
    assert.equal(highRate.monthlyPayment, 83_333);
    assert.equal(highRate.totalPayment, 9_999_960);
  });

  it("допускает максимальную конечную сумму, если итог представим", () => {
    assert.deepEqual(calculateLoan({ principal: Number.MAX_VALUE, annualRate: 0, months: 1 }), {
      monthlyPayment: Number.MAX_VALUE,
      totalPayment: Number.MAX_VALUE,
      overpayment: 0
    });
  });

  it("явно отклоняет переполнение платежа или общей суммы", () => {
    for (const input of [
      { principal: Number.MAX_VALUE, annualRate: 100, months: 1 },
      { principal: Number.MAX_VALUE, annualRate: 16, months: 240 }
    ]) {
      assert.throws(() => calculateLoan(input), /Результат слишком велик для расчёта/);
    }
  });

  it("отклоняет ошибочные значения", () => {
    assert.throws(
      () => calculateLoan({ principal: 0, annualRate: 16, months: 12 }),
      /больше нуля/
    );
    assert.throws(
      () => calculateLoan({ principal: 100_000, annualRate: -1, months: 12 }),
      /не может быть отрицательной/
    );
    assert.throws(
      () => calculateLoan({ principal: 100_000, annualRate: 10, months: 1.5 }),
      /целым числом/
    );
  });

  for (const principal of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
    it(`отклоняет недопустимую сумму ${principal}`, () => {
      assert.throws(
        () => calculateLoan({ principal, annualRate: 16, months: 12 }),
        /больше нуля/
      );
    });
  }

  for (const annualRate of [Number.NaN, Number.POSITIVE_INFINITY]) {
    it(`отклоняет нечисловую или бесконечную ставку ${annualRate}`, () => {
      assert.throws(
        () => calculateLoan({ principal: 100_000, annualRate, months: 12 }),
        /не может быть отрицательной/
      );
    });
  }

  for (const months of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    it(`отклоняет недопустимый срок ${months}`, () => {
      assert.throws(
        () => calculateLoan({ principal: 100_000, annualRate: 16, months }),
        /целым числом/
      );
    });
  }
});

it("интерфейс очищает все прежние результаты при переполнении и восстанавливается", () => {
  const element = (value = "") => ({
    value,
    textContent: "",
    hidden: false,
    focused: false,
    attributes: new Map<string, string>(),
    setAttribute(name: string, value: string) { this.attributes.set(name, value); },
    focus() { this.focused = true; }
  });
  const elements = {
    "#principal": element("3000000"), "#annual-rate": element("16"), "#months": element("240"),
    "#monthly-payment": element(), "#total-payment": element(), "#overpayment": element(),
    "#error-summary": element(), "#principal-error": element(), "#annual-rate-error": element(), "#months-error": element()
  };
  let submit: (event: { preventDefault(): void }) => void = () => { throw new Error("Submit listener missing"); };
  const form = { addEventListener(name: string, handler: typeof submit) { assert.equal(name, "submit"); submit = handler; } };
  const markup: Record<string, unknown> = { ...elements, "#loan-form": form };
  const appSource = stripTypeScriptTypes(readFileSync(new URL("../src/app.ts", import.meta.url), "utf8"))
    .replace(/^import\s+\{[^}]+\}\s+from\s+"\.\/calculator\.ts";\s*/u, "");
  runInNewContext(appSource, { document: { querySelector: (selector: string) => markup[selector] }, calculateLoan, Error });
  const money = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
  assert.equal(elements["#monthly-payment"].textContent, money.format(41_738));
  elements["#principal"].value = String(Number.MAX_VALUE);
  submit({ preventDefault() {} });
  for (const selector of ["#monthly-payment", "#total-payment", "#overpayment"] as const) {
    assert.equal(elements[selector].textContent, "—");
  }
  assert.equal(elements["#error-summary"].hidden, false);
  assert.equal(elements["#error-summary"].focused, true);
  assert.match(elements["#error-summary"].textContent, /Результат слишком велик/);
  elements["#principal"].value = "120000";
  elements["#annual-rate"].value = "1e-13";
  elements["#months"].value = "12";
  submit({ preventDefault() {} });
  assert.equal(elements["#monthly-payment"].textContent, money.format(10_000));
  assert.equal(elements["#total-payment"].textContent, money.format(120_000));
  assert.equal(elements["#overpayment"].textContent, money.format(0));
  assert.equal(elements["#error-summary"].hidden, true);
  assert.equal(elements["#error-summary"].textContent, "");
});
