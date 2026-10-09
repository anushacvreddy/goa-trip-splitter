# Goa Trip Splitter

A React and TypeScript web application that helps a group of friends record shared trip expenses, split costs, and understand who owes money and who should receive money back.

## Features

- Record expenses with descriptions, amounts, dates, categories, and payers.
- Split expenses equally, by exact amounts, or by percentages.
- View member balances and individual expense breakdowns.
- Filter expenses by category and view the filtered total.
- Delete expenses with confirmation.
- Persist expenses using browser localStorage.
- Validate inputs and display helpful error messages.
- Display currency in Indian Rupees (INR).

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Redux Toolkit
- CSS
- Vitest and React Testing Library

## Getting Started

Prerequisite: Install Node.js and npm.

```bash
npm install
npm run dev
```

Open the local URL displayed in the terminal.

## Quality Checks

```bash
npm run typecheck
npm run lint
npm run build
npm run test -- --run
```

## Design Decisions

1. **Money representation:** Amounts are stored as integer paise to avoid floating-point money calculation errors.
2. **State management:** Redux Toolkit manages expenses and member data; localStorage persists expenses between page refreshes.
3. **Split calculation:** Equal splits distribute leftover paise deterministically so the allocated shares equal the expense amount.

## Extra Paisa Rule

When an expense cannot be divided equally into whole paise, the first selected member or members receive the extra paisa until the entire amount is allocated. The total of all shares remains equal to the original expense.

## Sample Data

The application includes sample expenses representing a Goa trip, including accommodation, meals, scuba diving, an airport cab, and groceries.

## Future Improvements

- Add groups and trip creation.
- Add authentication and cloud-based persistence.
- Provide settlement suggestions to minimize the number of payments between members.
- Improve automated and accessibility testing.

## AI Usage

AI assistance was used for development guidance, debugging, and documentation. The implementation and its behavior should be reviewed and tested before submission.

## Known Limitations

Data is stored in the current browser's localStorage and is not synchronized across devices or users.

```
