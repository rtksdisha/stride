# Stride Cashflow & Forecasting — Design Context & Feature Specification

This document provides a comprehensive design brief and context for the **Stride Cashflow & Forecasting** application. It details the existing data structures, template configurations, calculation rules, and upcoming roadmap requirements.

---

## 1. System Overview

Stride is a cashflow forecasting tool that helps users project their cash balances daily/monthly over a selected horizon (typically 12 to 60 months). 

The app consists of two layers:
1. **The Baseline**: Regular, recurring incomes, expenses, starting accounts, and outstanding debts.
2. **What-If Milestones (Milestone Blocks)**: Toggleable future milestones or lifecycle changes (e.g., buying a car, purchasing a home, taking a sabbatical) that overlay additional cashflow events (one-time or recurring) on top of the baseline.

The interface must display a comparison chart of the baseline projection versus the milestone-inclusive projection.

---

## 2. Core Data Models & Inputs

### A. Base Budget Input Fields

These represent the user's day-to-day finances.

| Entity | Field | Type | Description / Options |
| :--- | :--- | :--- | :--- |
| **Income** | `name` | Text | E.g., "Salary", "Freelance" |
| | `amount` | Money | Net amount per payment occurrence |
| | `frequency` | Select | `Weekly`, `Biweekly (Friday)`, `Semi-monthly`, `Monthly`, `One-time` |
| | `start` | Date | Start date of the income stream |
| **Expenses** | `name` | Text | E.g., "Rent", "Groceries", "Internet" |
| | `amount` | Money | Expense cost |
| | `due` | Select/Text | Current implementation uses day-of-month (1-31), "Weekly", or a one-time Date |
| | `note` | Text | Optional comments |
| **Accounts** | `name` | Text | E.g., "Checking", "Savings" |
| | `balance` | Money | Starting balance |
| **Debts** | `name` | Text | E.g., "Credit Card", "Car Loan" |
| | `balance` | Money | Outstanding balance |
| | `apr` | Percent | Annual Percentage Rate (e.g., `19.99%`) |
| | `minPayment` | Money | Minimum monthly payment required |
| | `paymentDay` | Text | Due day of the month (1-31) |

---

## 3. What-If Milestone Templates

Milestone blocks bundle a group of virtual cashflow events (called **primitives**) together. The user fills out a template form, and the app programmatically generates the underlying primitives.

### A. "Buy a Car" Template (`buy_car`)
Models down payment, loan amortization, and ongoing vehicle maintenance costs.

* **User Input Fields**:
  1. **Purchase price**: Money (Default: `$35,000`)
  2. **Down payment**: Money (Default: `$5,000`)
  3. **Trade-in value**: Money (Default: `$0`, Optional)
  4. **Loan APR**: Percent (Default: `7.5%`)
  5. **Loan term**: Number of months (Default: `60`)
  6. **Purchase date**: Date
  7. **Monthly insurance**: Money (Default: `$175`)
  8. **Monthly gas & maintenance**: Money (Default: `$250`)
* **Generated Primitives**:
  * **Down payment**: One-time expense (`-downPayment`) on purchase date.
  * **Trade-in credit**: One-time income (`+tradeIn`) on purchase date.
  * **Car loan**: Amortized loan monthly payments starting 1 month after purchase.
  * **Car insurance**: Recurring monthly expense starting on purchase date.
  * **Gas & maintenance**: Recurring monthly expense starting on purchase date.

### B. "Buy a House" Template (`buy_house`)
Models home purchase down payment, closing costs, mortgage amortization, taxes, home insurance, and maintenance.

* **User Input Fields**:
  1. **Purchase price**: Money (Default: `$650,000`)
  2. **Down payment**: Money (Default: `$130,000`)
  3. **Mortgage APR**: Percent (Default: `5.04%`)
  4. **Amortization**: Number of years (Default: `30`)
  5. **Closing date**: Date
  6. **Closing costs**: Percent of price (Default: `2%`)
  7. **Property tax**: Percent of price per year (Default: `1.1%`)
  8. **Monthly home insurance**: Money (Default: `$130`)
  9. **Maintenance**: Percent of price per year (Default: `1.0%`)
  10. **Monthly HOA fees**: Money (Default: `$0`, Optional)
* **Generated Primitives**:
  * **Down payment**: One-time expense (`-downPayment`) on closing date.
  * **Closing costs**: One-time expense (`-price * closingCostsPercent%`) on closing date.
  * **Mortgage**: Amortized loan monthly payments starting 1 month after closing.
  * **Property tax**: Recurring monthly expense starting on closing date with an annual **2% escalation rate** (applied annually).
  * **Home insurance**: Recurring monthly expense starting on closing date with an annual **3% escalation rate** (applied annually).
  * **Maintenance**: Recurring monthly expense (`(price * maintenancePercent%) / 12`) starting on closing date.
  * **HOA fees**: Recurring monthly expense starting on closing date (if active).

### C. "Take a Sabbatical" Template (`sabbatical`)
Models a temporary pause in one of the household income streams alongside additional travel/lifestyle costs.

* **User Input Fields**:
  1. **Income to pause**: Select dropdown (List of existing Income streams)
  2. **Sabbatical start**: Date
  3. **Duration**: Number of months (Default: `6`)
  4. **Travel/lifestyle spend per month**: Money (Default: `$1,500`)
  5. **Healthcare per month**: Money (Default: `$400`)
* **Generated Primitives**:
  * **Income pause**: Pauses the targeted income stream (`income_change`) between `startDate` and `startDate + durationMonths`.
  * **Sabbatical spending**: Recurring monthly expense for the gap period duration.
  * **Healthcare during gap**: Recurring monthly expense for the gap period duration.

### D. Custom Milestones
Allows the user to build a blank milestone block and manually add any number of custom primitives:
* **One-time event** (Label, Amount, Date)
* **Recurring event** (Label, Amount, Frequency, Start Date, End Date)
* **Amortized loan** (Label, Principal, APR, Term Months, Start Date)

---

## 4. Milestone Status Modes

Milestone cards display their state in the timeline with three statuses:
1. **Committed (Locked)**: Always active, added directly to the "baseline projection" line. They represent decided actions.
2. **Toggleable (Unlocked - Active)**: Included in the forecast projection line to simulate what-ifs.
3. **Toggleable (Unlocked - Inactive)**: Muted on the list, not included in the active projection line.

---

## 5. Design Tasks (Roadmap UI/UX)

The following UI/UX designs are needed for upcoming features:

1. **Debt Growing Warnings**:
   * *Requirement*: Detect if a debt's monthly interest (`balance * (apr / 100) / 12`) exceeds its `minPayment`.
   * *Design*: A warning state/alert badge on the specific debt card with a clear explanation: *"This debt is growing — minimum payment does not cover interest"*, and a prompt displaying the break-even payment required.
2. **Debt Strategy Comparison (Snowball vs. Avalanche)**:
   * *Requirement*: A control panel to input an extra payment amount per month, select a debt pay-off strategy (Avalanche vs. Snowball), and visualize:
     * Side-by-side comparison stats: total interest paid, total months to debt-free.
     * A comparison line chart showing overall debt balance over time for both strategies.
3. **What-If Toggles for Base Budget Rows**:
   * *Requirement*: Toggles on individual income/expense/debt rows to temporarily deactivate them from projections (e.g., simulating *"what if I cancel streaming?"*).
   * *Design*: Muted/disabled rows that remain editable but are visually distinguished from active ones.
4. **Smart Expense Scheduler**:
   * *Requirement*: Upgrade the cryptic "Due" text field to a robust frequency scheduler.
   * *Design*: A `Frequency` dropdown (Weekly, Biweekly, Semi-monthly, Monthly, Quarterly, Annual, One-time) that dynamically reveals context-sensitive secondary inputs (e.g., day-of-month, specific weekday, start date).
5. **Multiple Goals & Savings Buckets**:
   * *Requirement*: Support multiple target goals/milestones (emergency fund, vacation, house downpayment) with names, target amounts, and priority order.
   * *Design*:
     * A "Goals/Milestones" listing table/manager.
     * Target lines overlaying the cashflow chart.
     * Calculated milestone reach dates shown in a timeline.
6. **Mobile Responsive Layout**:
   * *Requirement*: Clean stack views for smaller viewports (< 720px).
   * *Design*: Stacked columns, tables converting to clean card layouts, and compact, readable chart legends/ticks.
