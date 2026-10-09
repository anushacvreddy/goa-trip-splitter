
import type { Expense, Member } from "../app/types";
import { splitEqually } from "./splitExpense";

export function calculateBalances(
  members: Member[],
  expenses: Expense[],
): Record<string, number> {
  const balances: Record<string, number> = {};

  members.forEach((member) => {
    balances[member.id] = 0;
  });

  expenses.forEach((expense) => {
    // The person who paid gets credited.
    balances[expense.paidBy] =
      (balances[expense.paidBy] ?? 0) + expense.amount;

    let shares: Record<string, number>;

    if (expense.split.type === "equal") {
      shares = splitEqually(
        expense.amount,
        expense.split.memberIds,
      );
    } else if (expense.split.type === "exact") {
      shares = expense.split.shares;
    } else {
      shares = {};
      const entries = Object.entries(expense.split.shares);
      const totalPercent = entries.reduce(
        (sum, [, percent]) => sum + percent,
        0,
      );

      if (totalPercent !== 100) {
        throw new Error("Percentages must total exactly 100.");
      }

      // Calculate each share in paise and distribute leftover paise.
      let assignedPaise = 0;

      entries.forEach(([memberId, percent], index) => {
        const exactShare = (expense.amount * percent) / 100;
        const share = Math.floor(exactShare);
        shares[memberId] = share;
        assignedPaise += share;

        if (index === entries.length - 1) {
          shares[memberId] += expense.amount - assignedPaise;
        }
      });
    }

    Object.entries(shares).forEach(([memberId, sharePaise]) => {
      balances[memberId] =
        (balances[memberId] ?? 0) - sharePaise;
    });
  });

  return balances;
}
