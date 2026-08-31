import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
});
