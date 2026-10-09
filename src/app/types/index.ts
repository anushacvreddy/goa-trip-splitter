
export interface Member {
  id: string;
  name: string;
}

export type SplitType = "equal" | "exact" | "percent";

export interface Expense {
  id: string;
  description: string;
  amount: number; // Always stored in paise, not rupees
  paidBy: string; // Member ID
  date: string; // YYYY-MM-DD
  category: "Food" | "Travel" | "Stay" | "Activities" | "Other";
  split:
    | {
        type: "equal";
        memberIds: string[];
      }
    | {
        type: "exact";
        shares: Record<string, number>; // Member ID -> paise
      }
    | {
        type: "percent";
        shares: Record<string, number>; // Member ID -> percentage
      };
}
