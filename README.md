# Goa Trip Splitter

A React and TypeScript web application that helps friends record shared trip expenses, split costs, and understand who owes money and who should receive money back.

## Features

- Record expenses with descriptions, amounts, dates, categories, and payers.
- Split expenses equally, by exact amounts, or by percentages.
- View member balances and individual expense breakdowns.
- Filter expenses by category and view the filtered total.
- Delete expenses with confirmation.
- Persist expenses using browser `localStorage`.
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

## Project Structure

The runnable frontend application is located inside the inner `recruiterflow-frontend` directory.

```text
recruiterflow-frontend/
└── recruiterflow-frontend/
    ├── public/
    ├── src/
    ├── dist/
    ├── package.json
    ├── package-lock.json
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    └── README.md
```

**Important:** Run all npm commands from the inner `recruiterflow-frontend` directory, where `package.json` is located.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation and Execution

If you have cloned the repository and are in the outer folder, navigate into the inner application folder:

```bash
cd recruiterflow-frontend
npm install
npm run dev
```

If you have already opened the inner application folder in your terminal, run:

```bash
npm install
npm run dev
```

Open the local URL displayed in the terminal to access the application.

## Quality Checks

Run these commands from the inner application directory:

```bash
npm run typecheck
npm run lint
npm run build
npm run test -- --run
```

These commands check TypeScript, code quality, the production build, and automated tests. They require the corresponding scripts to be defined in `package.json`.

## Design Decisions

1. **Money representation:** Amounts are stored as integer paise to avoid floating-point money calculation errors.
2. **State management:** Redux Toolkit manages expenses and member data; `localStorage` persists expenses between page refreshes.
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

## AI Assistance

Used ChatGPT (OpenAI) for development guidance, debugging support, and documentation refinement. Reviewed suggested solutions and used project tests and quality checks to validate the implementation.

## Known Limitations

Data is stored in the current browser's `localStorage` and is not synchronized across devices or users.

## Author

CV Anusha Reddy