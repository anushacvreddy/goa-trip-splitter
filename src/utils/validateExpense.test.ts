
import { describe, expect, it } from "vitest";
import { validateAmount } from "./validateExpense";

describe("validateAmount", () => {
  it("accepts a valid amount", () => {
    expect(validateAmount(250)).toBeNull();
    expect(validateAmount(12.5)).toBeNull();
  });

  it("rejects zero and negative amounts", () => {
    expect(validateAmount(0)).toBe("Amount must be more than ₹0");
    expect(validateAmount(-50)).toBe("Amount must be more than ₹0");
  });

  it("rejects amounts above ₹10,00,000", () => {
    expect(validateAmount(1000001)).toBe(
      "Amount cannot exceed ₹10,00,000.",
    );
  });

  it("rejects more than two decimal places", () => {
    expect(validateAmount(12.345)).toBe(
      "Amount can have at most 2 decimal places.",
    );
  });

  it("rejects invalid numeric values", () => {
    expect(validateAmount(Number.NaN)).toBe("Enter a valid amount.");
    expect(validateAmount(Number.POSITIVE_INFINITY)).toBe(
      "Enter a valid amount.",
    );
  });
});
