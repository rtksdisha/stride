# Stride - WAINB Financial Forecasting Flow

Stride is an interactive personal finance forecaster application. Designed originally using Claude Design and developed in React, TypeScript, and Vite, Stride offers a local-first, dynamic visual dashboard for tracking income streams, monthly spending, accounts, debt-payoff strategies, and milestone goals.

---

## 🚀 Core Features

- **Dynamic Financial Dashboard**: View real-time projections of net worth, cash flow, debt balance, and progress toward financial goals.
- **Interactive Scenarios**: Adjust payoff strategies (Avalanche vs. Snowball), play with monthly payment sliders, and instantly see when you will become debt-free.
- **Milestone Planning**: Pick or create goals (e.g., buying a car, buying a house, taking a sabbatical, or custom goals) and forecast their impact on your savings and net worth.
- **Dynamic side panel editor**: Real-time CRUD editing for income streams, spending items, debts, accounts, and custom milestones.
- **Local-First Persistence**: All financial data resides safely on your device, stored locally inside your browser (`localStorage`).

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Linter**: [Oxlint](https://github.com/oxc-project/oxc)
- **Styling**: Vanilla CSS

---

## ⚙️ Setup & Installation

### 1. Prerequisites
Ensure you have **Node.js** installed on your system.
* **Recommended version**: Node.js v18.x or v20.x (LTS)
* Check your installed version:
  ```bash
  node -v
  ```

### 2. Install Dependencies
Run the following command in the project root directory to install the package dependencies:
```bash
npm install
```

---

## 🏃 Running the App Locally

### Development Server
To launch the application in development mode with hot-reloading:
```bash
npm run dev
```
Once started, the application will be accessible at:
👉 **[http://localhost:5173](http://localhost:5173)**

### Build for Production
To generate an optimized production bundle:
```bash
npm run build
```
This builds static assets into the `dist/` directory.

### Preview Production Build
To spin up a local server to preview the production-compiled files:
```bash
npm run preview
```

### Code Quality (Linting)
We use `oxlint` for fast code linting:
```bash
npm run lint
```

---

## 📂 Project Structure

- `src/` — The main React application code:
  - `src/components/` — Reusable visual components (e.g., charts, sidebar, forms).
  - `src/screens/` — App views: Onboarding flow, Dashboard, Scenario Simulator, and Milestone builder.
  - `src/state/` — Context provider and reducer for managing user data.
  - `src/lib/` — Computational formulas (forecast algorithms, debt strategy solver, local storage management).
  - `src/types.ts` — TypeScript definitions for core data objects.
- `project/` — The original Claude Design HTML prototype files, styling templates, and visual mockups.
- `chats/` — The design transcripts showing how the user and Claude iterated on the specifications.
