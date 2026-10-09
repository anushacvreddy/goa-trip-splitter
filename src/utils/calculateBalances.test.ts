
import { describe, expect, it } from "vitest";
import type { Expense, Member } from "../app/types";
import { calculateBalances } from "./calculateBalances";

const members: Member[] = [
  { id: "aarav", name: "Aarav" },
  { id: "diya", name: "Diya" },
  { id: "kabir", name: "Kabir" },
];

const expense: Expense = {
  id: "expense-1",
  description: "Dinner",
  amount: 90000,
  paidBy: "aarav",
  date: "2026-10-08",
  category: "Food",
  split: {
    type: "equal",
    memberIds: ["aarav", "diya", "kabir"],
  },
};

describe("calculateBalances", () => {
  it("calculates balances correctly for an equal split", () => {
    const balances = calculateBalances(members, [expense]);

    expect(balances).toEqual({
      aarav: 60000,
      diya: -30000,
      kabir: -30000,
    });
  });

  it("ensures all balances total zero", () => {
    const balances = calculateBalances(members, [expense]);

    const total = Object.values(balances).reduce(
      (sum, balance) => sum + balance,
      0,
    );

    expect(total).toBe(0);
  });
});

