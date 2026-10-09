
import { configureStore } from "@reduxjs/toolkit";
import membersReducer from "./features/members/membersSlice";
import expensesReducer from "./features/expenses/expensesSlice";

export const store = configureStore({
  reducer: {
    members: membersReducer,
    expenses: expensesReducer,
  },
});

store.subscribe(() => {
  try {
    localStorage.setItem(
      "trip-splitter-expenses",
      JSON.stringify(store.getState().expenses),
    );
  } catch {
    // The app can continue working if browser storage is unavailable.
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
