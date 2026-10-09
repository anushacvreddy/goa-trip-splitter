
import { describe, expect, it } from "vitest";
import { splitEqually } from "./splitExpense";

describe("splitEqually", () => {
  it("splits ₹100 equally among three members without losing paise", () => {
    const shares = splitEqually(10000, ["aarav", "diya", "kabir"]);

    expect(shares).toEqual({
      aarav: 3334,
      diya: 3333,
      kabir: 3333,
    });

    expect(Object.values(shares).reduce((sum, share) => sum + share, 0))
      .toBe(10000);
  });

  it("rejects an empty member list", () => {
    expect(() => splitEqually(10000, [])).toThrow(
      "At least one member is required.",
    );
  });
});
