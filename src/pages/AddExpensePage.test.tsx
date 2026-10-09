
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";

import AddExpensePage from "./AddExpensePage";
import membersReducer from "../app/features/members/membersSlice";
import expensesReducer from "../app/features/expenses/expensesSlice";

function renderAddExpensePage() {
  const testStore = configureStore({
    reducer: {
      members: membersReducer,
      expenses: expensesReducer,
    },
  });

  return {
    store: testStore,
    ...render(
      <Provider store={testStore}>
        <MemoryRouter>
          <AddExpensePage />
        </MemoryRouter>
      </Provider>,
    ),
  };
}

describe("Add Expense form", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows validation errors when required fields are empty", () => {
    renderAddExpensePage();

    fireEvent.click(
      screen.getByRole("button", { name: /save expense/i }),
    );

    expect(screen.getByText("Description is required.")).toBeTruthy();
    expect(screen.getByText("Amount is required.")).toBeTruthy();
    expect(screen.getByText("Select who paid.")).toBeTruthy();
    expect(screen.getByText("Date is required.")).toBeTruthy();
    expect(screen.getByText("Category is required.")).toBeTruthy();
    expect(screen.getByText("Select at least one member.")).toBeTruthy();
  });

  it("saves a valid expense", () => {
    const { store } = renderAddExpensePage();

    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Team lunch" },
    });

    fireEvent.change(screen.getByLabelText("Amount (₹)"), {
      target: { value: "600" },
    });

    fireEvent.change(screen.getByLabelText("Paid by"), {
      target: { value: "m1" },
    });

    fireEvent.change(screen.getByLabelText("Date"), {
      target: { value: "2026-03-12" },
    });

    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Food" },
    });

    fireEvent.click(screen.getByLabelText("Aarav"));
    fireEvent.click(screen.getByLabelText("Diya"));

    fireEvent.click(
      screen.getByRole("button", { name: /save expense/i }),
    );

    const savedExpenses = store.getState().expenses;

    expect(
      savedExpenses.some((expense) => expense.description === "Team lunch"),
    ).toBe(true);

    expect(
      savedExpenses.find((expense) => expense.description === "Team lunch")
        ?.amount,
    ).toBe(60000);
  });
});
