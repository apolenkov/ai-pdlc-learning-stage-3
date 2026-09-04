export interface LoanInput {
  principal: number;
  annualRate: number;
  months: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  overpayment: number;
}

function assertValidInput(input: LoanInput): void {
  if (!Number.isFinite(input.principal) || input.principal <= 0) {
    throw new Error("Сумма кредита должна быть больше нуля.");
  }

  if (!Number.isFinite(input.annualRate) || input.annualRate < 0) {
    throw new Error("Ставка не может быть отрицательной.");
  }

  if (!Number.isInteger(input.months) || input.months <= 0) {
    throw new Error("Срок должен быть целым числом месяцев больше нуля.");
  }
}

export function calculateLoan(input: LoanInput): LoanResult {
  assertValidInput(input);

  const monthlyRate = input.annualRate / 100 / 12;
  const rawPayment =
    monthlyRate === 0
      ? input.principal / input.months
      : input.principal *
        (monthlyRate / -Math.expm1(-input.months * Math.log1p(monthlyRate)));

  const monthlyPayment = Math.round(rawPayment);
  const totalPayment = monthlyPayment * input.months;
  if (!Number.isFinite(monthlyPayment) || !Number.isFinite(totalPayment)) {
    throw new Error("Результат слишком велик для расчёта. Уменьшите сумму, ставку или срок кредита.");
  }

  return {
    monthlyPayment,
    totalPayment,
    overpayment: totalPayment - input.principal
  };
}
