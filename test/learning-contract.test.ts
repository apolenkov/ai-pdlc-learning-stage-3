import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it } from "node:test";

type Variant = {
  id: string;
  directory: string;
  kind: "base" | "ai";
  baseVariant?: string;
  inherits: string[];
  acceptanceProfile: string;
  openspecCli: boolean;
  aiBoundary?: {
    humanDecisionRequired: boolean;
    secretsAllowed: boolean;
    corporateDataAllowed: boolean;
  };
};

type LearningContract = {
  acceptanceProfiles: Record<string, string[]>;
  variants: Variant[];
};

const root = resolve(import.meta.dirname, "..");
const contract = JSON.parse(
  readFileSync(resolve(root, "learning-contract.json"), "utf8")
) as LearningContract;

describe("learning contract", () => {
  it("ИИ-вариант сохраняет критерии соответствующего базового варианта", () => {
    for (const aiVariant of contract.variants.filter(({ kind }) => kind === "ai")) {
      const base = contract.variants.find(({ id }) => id === aiVariant.baseVariant);
      assert.ok(base, `Не найден базовый вариант для ${aiVariant.id}`);
      assert.deepEqual(
        contract.acceptanceProfiles[aiVariant.acceptanceProfile],
        contract.acceptanceProfiles[base.acceptanceProfile]
      );
    }
  });

  it("ИИ-ветки не входят в наследование базовых уровней", () => {
    const baseVariants = contract.variants.filter(({ kind }) => kind === "base");
    for (const variant of baseVariants) {
      assert.equal(variant.inherits.some((id) => id.endsWith("-ai")), false);
    }
  });

  it("каждый ИИ-вариант требует решения человека и запрещает чувствительные данные", () => {
    for (const variant of contract.variants.filter(({ kind }) => kind === "ai")) {
      assert.deepEqual(variant.aiBoundary, {
        humanDecisionRequired: true,
        secretsAllowed: false,
        corporateDataAllowed: false
      });
    }
  });

  it("код калькулятора одинаков во всех шести вариантах", () => {
    const [first, ...rest] = contract.variants.map(({ directory }) =>
      readFileSync(resolve(root, directory, "src/calculator.ts"), "utf8")
    );
    for (const source of rest) assert.equal(source, first);
  });
});
