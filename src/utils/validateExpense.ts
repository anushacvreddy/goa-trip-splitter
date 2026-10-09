
export function validateAmount(amount: number): string | null {
  if (!Number.isFinite(amount)) {
    return "Enter a valid amount.";
  }

  if (amount <= 0) {
    return "Amount must be more than ₹0";
  }

  if (amount > 1_000_000) {
    return "Amount cannot exceed ₹10,00,000.";
  }

  if (Math.round(amount * 100) !== amount * 100) {
    return "Amount can have at most 2 decimal places.";
  }

  return null;
}
