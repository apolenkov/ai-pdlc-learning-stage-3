import { calculateLoan, type LoanInput } from "./calculator.ts";

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Не найден элемент: ${selector}`);
  }
  return element;
}

const form = requiredElement<HTMLFormElement>("#loan-form");
const principal = requiredElement<HTMLInputElement>("#principal");
const annualRate = requiredElement<HTMLInputElement>("#annual-rate");
const months = requiredElement<HTMLInputElement>("#months");
const payment = requiredElement<HTMLElement>("#monthly-payment");
const total = requiredElement<HTMLElement>("#total-payment");
const overpayment = requiredElement<HTMLElement>("#overpayment");
const errorSummary = requiredElement<HTMLElement>("#error-summary");

const fields = {
  principal: {
    input: principal,
    error: requiredElement<HTMLElement>("#principal-error")
  },
  annualRate: {
    input: annualRate,
    error: requiredElement<HTMLElement>("#annual-rate-error")
  },
  months: {
    input: months,
    error: requiredElement<HTMLElement>("#months-error")
  }
} as const;

const formatRubles = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0
});

function readInput(): LoanInput {
  return {
    principal: Number(principal.value),
    annualRate: Number(annualRate.value),
    months: Number(months.value)
  };
}

function validate(input: LoanInput): Partial<Record<keyof LoanInput, string>> {
  const errors: Partial<Record<keyof LoanInput, string>> = {};

  if (!Number.isFinite(input.principal) || input.principal <= 0) {
    errors.principal = "Введите сумму больше нуля.";
  }

  if (!Number.isFinite(input.annualRate) || input.annualRate < 0) {
    errors.annualRate = "Введите ставку не меньше нуля.";
  }

  if (!Number.isInteger(input.months) || input.months <= 0) {
    errors.months = "Введите целое число месяцев больше нуля.";
  }

  return errors;
}

function renderFieldErrors(errors: Partial<Record<keyof LoanInput, string>>): void {
  for (const [name, field] of Object.entries(fields) as Array<
    [keyof LoanInput, (typeof fields)[keyof typeof fields]]
  >) {
    const message = errors[name] ?? "";
    field.error.textContent = message;
    field.input.setAttribute("aria-invalid", String(Boolean(message)));
  }
}

function renderError(message: string, focusError: boolean): void {
  payment.textContent = "—";
  total.textContent = "—";
  overpayment.textContent = "—";
  errorSummary.hidden = false;
  errorSummary.textContent = message;
  if (focusError) {
    errorSummary.focus();
  }
}

function render(focusError = false): void {
  const input = readInput();
  const errors = validate(input);
  renderFieldErrors(errors);

  if (Object.keys(errors).length > 0) {
    renderError("Исправьте отмеченные поля и повторите расчёт.", focusError);
    return;
  }

  let result;
  try {
    result = calculateLoan(input);
  } catch (error) {
    renderError(error instanceof Error ? error.message : "Не удалось рассчитать платёж. Проверьте значения.", focusError);
    return;
  }
  payment.textContent = formatRubles.format(result.monthlyPayment);
  total.textContent = formatRubles.format(result.totalPayment);
  overpayment.textContent = formatRubles.format(result.overpayment);
  errorSummary.hidden = true;
  errorSummary.textContent = "";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render(true);
});

render();
