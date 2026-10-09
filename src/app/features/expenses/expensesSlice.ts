
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Expense } from "../../types";
import { sampleExpenses } from "../../../data/sampleData";

const STORAGE_KEY = "trip-splitter-expenses";

function loadExpenses(): Expense[] {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData === null) {
      return sampleExpenses;
    }

    const parsedData: unknown = JSON.parse(savedData);

    if (
      Array.isArray(parsedData) &&
      parsedData.every(
        (item: unknown) =>
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          "description" in item &&
          "amount" in item &&
          "split" in item,
      )
    ) {
      return parsedData as Expense[];
    }

    return sampleExpenses;
  } catch {
    return sampleExpenses;
  }
}

const expensesSlice = createSlice({
  name: "expenses",
  initialState: loadExpenses(),
  reducers: {
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.push(action.payload);
    },
    deleteExpense: (state, action: PayloadAction<string>) => {
      return state.filter((expense) => expense.id !== action.payload);
    },
  },
});

export const { addExpense, deleteExpense } = expensesSlice.actions;
export default expensesSlice.reducer;
