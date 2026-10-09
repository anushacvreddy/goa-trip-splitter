import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { deleteExpense } from "../app/features/expenses/expensesSlice";
import { calculateBalances } from "../utils/calculateBalances";
import { formatRupees } from "../utils/money";
import { splitEqually } from "../utils/splitExpense";

export default function ExpensesPage() {
  const expenses = useAppSelector((state) => state.expenses);
  const members = useAppSelector((state) => state.members);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [expandedExpenses, setExpandedExpenses] = useState<string[]>([]);

  const successMessage =
    (location.state as { successMessage?: string } | null)?.successMessage;

  const filteredExpenses =
    selectedCategory === "All"
      ? expenses
      : expenses.filter(
          (expense) => expense.category === selectedCategory,
        );

  const totalAmount = filteredExpenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  const balances = calculateBalances(members, expenses);

  function toggleSplit(expenseId: string) {
    setExpandedExpenses((current) =>
      current.includes(expenseId)
        ? current.filter((id) => id !== expenseId)
        : [...current, expenseId],
    );
  }

  function handleDelete(expenseId: string, description: string) {
    if (window.confirm(`Are you sure you want to delete "${description}"?`)) {
      dispatch(deleteExpense(expenseId));
      setExpandedExpenses((current) =>
        current.filter((id) => id !== expenseId),
      );
      setDeleteMessage(`"${description}" was deleted successfully.`);
    }
  }

  function getSplitShares(
    expense: (typeof expenses)[number],
  ): Record<string, number> {
    if (expense.split.type === "equal") {
      return splitEqually(expense.amount, expense.split.memberIds);
    }

    if (expense.split.type === "exact") {
      return expense.split.shares;
    }

    const shares: Record<string, number> = {};
    const entries = Object.entries(expense.split.shares);
    let assignedPaise = 0;

    entries.forEach(([memberId, percentage], index) => {
      const share = Math.floor((expense.amount * percentage) / 100);
      shares[memberId] = share;
      assignedPaise += share;

      if (index === entries.length - 1) {
        shares[memberId] += expense.amount - assignedPaise;
      }
    });

    return shares;
  }

  return (
    <main>
      <h1>Trip Expenses</h1>
      <p>Track and manage expenses for your trip.</p>

      {successMessage && <p role="status">{successMessage}</p>}
      {deleteMessage && <p role="status">{deleteMessage}</p>}

      <section>
        <h2>Member Balances</h2>

        {members.map((member) => {
          const balance = balances[member.id] ?? 0;

          return (
            <p key={member.id}>
              <strong>{member.name}:</strong>{" "}
              {balance > 0
                ? `Gets back ${formatRupees(balance)}`
                : balance < 0
                  ? `Owes ${formatRupees(Math.abs(balance))}`
                  : "Settled up"}
            </p>
          );
        })}
      </section>

      <section>
        <h2>All Expenses</h2>

        <label htmlFor="category-filter">Filter by category: </label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
        >
          <option value="All">All categories</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Stay">Stay</option>
          <option value="Activities">Activities</option>
          <option value="Other">Other</option>
        </select>

        <p>Total: {formatRupees(totalAmount)}</p>

        {filteredExpenses.length === 0 ? (
          <p>No expenses found for this category.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Paid by</th>
                <th>Amount</th>
                <th>Split</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {[...filteredExpenses]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((expense) => {
                  const isExpanded = expandedExpenses.includes(expense.id);
                  const shares = isExpanded ? getSplitShares(expense) : {};

                  return (
                    <>
                      <tr key={expense.id}>
                        <td>{expense.date}</td>
                        <td>{expense.description}</td>
                        <td>{expense.category}</td>
                        <td>
                          {members.find(
                            (member) => member.id === expense.paidBy,
                          )?.name ?? "Unknown"}
                        </td>
                        <td>{formatRupees(expense.amount)}</td>
                        <td>
                          <span>
                            {expense.split.type === "equal"
                              ? "Equal"
                              : expense.split.type === "exact"
                                ? "Exact shares"
                                : "Percentage"}
                          </span>
                          <br />
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            onClick={() => toggleSplit(expense.id)}
                          >
                            {isExpanded ? "Hide split" : "View split"}
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(expense.id, expense.description)
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${expense.id}-split`}>
                          <td colSpan={7}>
                            <section aria-label={`Split details for ${expense.description}`}>
                              <h3>{expense.description} — Split breakdown</h3>

                              <p>
                                Split mode:{" "}
                                {expense.split.type === "equal"
                                  ? "Equal"
                                  : expense.split.type === "exact"
                                    ? "Exact shares"
                                    : "Percentage"}
                              </p>

                              <table>
                                <thead>
                                  <tr>
                                    <th>Member</th>
                                    {expense.split.type === "percent" && (
                                      <th>Percentage</th>
                                    )}
                                    <th>Share amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(shares).map(
                                    ([memberId, sharePaise]) => {
                                      const member = members.find(
                                        (item) => item.id === memberId,
                                      );

                                      return (
                                        <tr key={memberId}>
                                          <td>{member?.name ?? "Unknown member"}</td>
                                          {expense.split.type === "percent" && (
                                            <td>
                                              {expense.split.shares[memberId]}%
                                            </td>
                                          )}
                                          <td>{formatRupees(sharePaise)}</td>
                                        </tr>
                                      );
                                    },
                                  )}
                                </tbody>
                                <tfoot>
                                  <tr>
                                    <th colSpan={expense.split.type === "percent" ? 2 : 1}>
                                      Total split
                                    </th>
                                    <th>
                                      {formatRupees(
                                        Object.values(shares).reduce(
                                          (sum, amount) => sum + amount,
                                          0,
                                        ),
                                      )}
                                    </th>
                                  </tr>
                                </tfoot>
                              </table>
                            </section>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}