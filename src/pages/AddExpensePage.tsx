import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { addExpense } from "../app/features/expenses/expensesSlice";
import { splitEqually } from "../utils/splitExpense";
import { rupeesToPaise, formatRupees } from "../utils/money";
import { validateAmount } from "../utils/validateExpense";
import type { Expense } from "../app/types";

type Category = "Food" | "Travel" | "Stay" | "Activities" | "Other";
type SplitMode = "equal" | "exact" | "percent";

const categories: Category[] = [
  "Food",
  "Travel",
  "Stay",
  "Activities",
  "Other",
];

function getTodayString(): string {
  const today = new Date();
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function AddExpensePage() {
  const members = useAppSelector((state) => state.members);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [shares, setShares] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const amountNumber = Number(amount);
  const amountPaise = rupeesToPaise(amountNumber);

  const exactTotalPaise = selectedMembers.reduce(
    (total, id) => total + rupeesToPaise(Number(shares[id] || 0)),
    0,
  );

  const percentageTotal = selectedMembers.reduce(
    (total, id) => total + Number(shares[id] || 0),
    0,
  );

  const equalShares =
    Number.isFinite(amountPaise) &&
    amountPaise > 0 &&
    selectedMembers.length > 0
      ? splitEqually(amountPaise, selectedMembers)
      : {};

  function toggleMember(memberId: string) {
    setSelectedMembers((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );

    setShares((current) => {
      const updated = { ...current };
      delete updated[memberId];
      return updated;
    });
  }

  function updateShare(memberId: string, value: string) {
    setShares((current) => ({ ...current, [memberId]: value }));
  }

  function changeSplitMode(mode: SplitMode) {
    setSplitMode(mode);
    setShares({});
    setErrors({});
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    const todayString = getTodayString();
    const amountError = !amount.trim()
      ? "Amount is required."
      : amountNumber < 0
        ? "Amount must be more than ₹0"
        : validateAmount(amountNumber);

    if (!description.trim()) {
      nextErrors.description = "Description is required.";
    } else if (description.trim().length > 60) {
      nextErrors.description = "Description must be 60 characters or fewer.";
    }

    if (amountError) {
      nextErrors.amount = amountError;
    }

    if (!paidBy) {
      nextErrors.paidBy = "Select who paid.";
    }

    if (!date) {
      nextErrors.date = "Date is required.";
    } else if (date > todayString) {
      nextErrors.date = "Date cannot be in the future.";
    }

    if (!category) {
      nextErrors.category = "Category is required.";
    }

    if (selectedMembers.length === 0) {
      nextErrors.members = "Select at least one member.";
    }

    let split: Expense["split"] | null = null;

    if (selectedMembers.length > 0 && !amountError) {
      if (splitMode === "equal") {
        split = {
          type: "equal",
          memberIds: selectedMembers,
        };
      } else if (splitMode === "exact") {
        let validShares = true;
        const exactShares: Record<string, number> = {};

        selectedMembers.forEach((id) => {
          const rawValue = shares[id] ?? "";
          const value = Number(rawValue);

          if (rawValue.trim() === "") {
            nextErrors[`share-${id}`] = "Enter this member's share.";
            validShares = false;
          } else if (
            !Number.isFinite(value) ||
            value < 0 ||
            Math.round(value * 100) !== value * 100
          ) {
            nextErrors[`share-${id}`] =
              "Enter an amount of ₹0 or more with at most 2 decimal places.";
            validShares = false;
          } else {
            exactShares[id] = rupeesToPaise(value);
          }
        });

        if (validShares && exactTotalPaise !== amountPaise) {
          const difference = amountPaise - exactTotalPaise;

          nextErrors.exactTotal =
            difference > 0
              ? `${formatRupees(difference)} left to assign.`
              : `${formatRupees(Math.abs(difference))} over the expense amount.`;
        }

        if (validShares && exactTotalPaise === amountPaise) {
          split = { type: "exact", shares: exactShares };
        }
      } else {
        let validPercentages = true;
        const percentShares: Record<string, number> = {};

        selectedMembers.forEach((id) => {
          const rawValue = shares[id] ?? "";
          const value = Number(rawValue);

          if (rawValue.trim() === "") {
            nextErrors[`share-${id}`] = "Enter this member's percentage.";
            validPercentages = false;
          } else if (
            !Number.isFinite(value) ||
            value < 0 ||
            value > 100 ||
            Math.round(value * 100) !== value * 100
          ) {
            nextErrors[`share-${id}`] =
              "Enter a percentage from 0 to 100 with at most 2 decimal places.";
            validPercentages = false;
          } else {
            percentShares[id] = value;
          }
        });

        if (
          validPercentages &&
          Math.round(percentageTotal * 100) !== 10000
        ) {
          nextErrors.percentTotal = `Percentages must total exactly 100%. Current total: ${percentageTotal.toFixed(2)}%.`;
        }

        if (
          validPercentages &&
          Math.round(percentageTotal * 100) === 10000
        ) {
          split = { type: "percent", shares: percentShares };
        }
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !split || !category) {
      return;
    }

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      description: description.trim(),
      amount: amountPaise,
      paidBy,
      date,
      category,
      split,
    };

    dispatch(addExpense(newExpense));

    navigate("/expenses", {
      state: {
        successMessage: `Expense "${newExpense.description}" added successfully!`,
      },
    });
  }

  const todayString = getTodayString();

  return (
    <main>
      <h1>Add Expense</h1>
      <p>Record a new expense for your trip.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="description">Description</label>
          <input
            id="description"
            type="text"
            maxLength={60}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            aria-invalid={Boolean(errors.description)}
          />
          {errors.description && <p role="alert">{errors.description}</p>}
        </div>

        <div>
          <label htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            type="number"
            min="0.01"
            max="1000000"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={Boolean(errors.amount)}
          />
          {errors.amount && <p role="alert">{errors.amount}</p>}
        </div>

        <div>
          <label htmlFor="paidBy">Paid by</label>
          <select
            id="paidBy"
            value={paidBy}
            onChange={(event) => setPaidBy(event.target.value)}
            aria-invalid={Boolean(errors.paidBy)}
          >
            <option value="">Select a member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          {errors.paidBy && <p role="alert">{errors.paidBy}</p>}
        </div>

        <div>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            max={todayString}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            aria-invalid={Boolean(errors.date)}
          />
          {errors.date && <p role="alert">{errors.date}</p>}
        </div>

        <div>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(event) => {
              const value = event.target.value;
              setCategory(
                categories.find((item) => item === value) ?? "",
              );
            }}
            aria-invalid={Boolean(errors.category)}
          >
            <option value="">Select a category</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.category && <p role="alert">{errors.category}</p>}
        </div>

        <fieldset>
          <legend>Split method</legend>

          <label>
            <input
              type="radio"
              name="splitMode"
              checked={splitMode === "equal"}
              onChange={() => changeSplitMode("equal")}
            />
            Equal split
          </label>

          <label>
            <input
              type="radio"
              name="splitMode"
              checked={splitMode === "exact"}
              onChange={() => changeSplitMode("exact")}
            />
            Exact shares
          </label>

          <label>
            <input
              type="radio"
              name="splitMode"
              checked={splitMode === "percent"}
              onChange={() => changeSplitMode("percent")}
            />
            Percentage split
          </label>
        </fieldset>

        <fieldset>
          <legend>Who shares this expense?</legend>

          {members.map((member) => (
            <label key={member.id}>
              <input
                type="checkbox"
                checked={selectedMembers.includes(member.id)}
                onChange={() => toggleMember(member.id)}
              />
              {member.name}
            </label>
          ))}

          {errors.members && <p role="alert">{errors.members}</p>}
        </fieldset>

        {splitMode === "equal" && selectedMembers.length > 0 && (
          <section>
            <h3>Equal shares</h3>
            {selectedMembers.map((id) => (
              <p key={id}>
                {members.find((member) => member.id === id)?.name}:{" "}
                {formatRupees(equalShares[id] ?? 0)}
              </p>
            ))}
          </section>
        )}

        {splitMode !== "equal" && selectedMembers.length > 0 && (
          <fieldset>
            <legend>
              {splitMode === "exact" ? "Exact share (₹)" : "Share percentage (%)"}
            </legend>

            {selectedMembers.map((memberId) => (
              <div key={memberId}>
                <label htmlFor={`share-${memberId}`}>
                  {members.find((member) => member.id === memberId)?.name}
                </label>
                <input
                  id={`share-${memberId}`}
                  type="number"
                  min="0"
                  max={splitMode === "percent" ? 100 : undefined}
                  step="0.01"
                  value={shares[memberId] ?? ""}
                  onChange={(event) =>
                    updateShare(memberId, event.target.value)
                  }
                  aria-invalid={Boolean(errors[`share-${memberId}`])}
                />
                {errors[`share-${memberId}`] && (
                  <p role="alert">{errors[`share-${memberId}`]}</p>
                )}
              </div>
            ))}

            {splitMode === "exact" && (
              <>
                <p>
                  {exactTotalPaise <= amountPaise
                    ? `${formatRupees(amountPaise - exactTotalPaise)} left to assign.`
                    : `${formatRupees(exactTotalPaise - amountPaise)} over the expense amount.`}
                </p>
                {errors.exactTotal && <p role="alert">{errors.exactTotal}</p>}
              </>
            )}

            {splitMode === "percent" && (
              <>
                <p>Percentage total: {percentageTotal.toFixed(2)}%</p>
                {errors.percentTotal && <p role="alert">{errors.percentTotal}</p>}
              </>
            )}
          </fieldset>
        )}

        <button type="submit">Save Expense</button>
        <button type="button" onClick={() => navigate("/expenses")}>
          Cancel
        </button>
      </form>
    </main>
  );
}