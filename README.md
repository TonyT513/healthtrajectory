# HealthTrajectory

Track your lab results over time and see which way they're heading.

HealthTrajectory lets you enter results from your lab reports (cholesterol, A1C, glucose, kidney function and more) and shows, in plain language, whether each one is in range, improving, worsening or holding steady, so you can walk into your next appointment with clear questions.

![HealthTrajectory dashboard with example data](docs/dashboard.png)

> **Educational only.** HealthTrajectory does not diagnose or give medical advice. The data shown above is made up.

## Features

- **Lab results**: add one test or a full panel (lipid, CMP, CBC, thyroid, and others), using the normal range printed on *your* report
- **Trends**: every test labeled Improving, Worsening, Stable or Needs attention, with charts
- **Dashboard**: overall status, out-of-range alerts and key metrics at a glance
- **Goals**: lab goals (e.g. "LDL below 100") that track themselves, plus habit goals
- **Health history**: conditions, medications, allergies, procedures, family history, immunizations
- **Documents**: keep PDFs and photos of lab reports in one place
- **Export / import**: download your data as a file at any time

## Run it locally

You need [Node.js](https://nodejs.org) (LTS version).

```bash
cd capstone
npm install
npm run dev
```

Then open http://localhost:5173. On the dashboard, click **Load example data** to explore with made-up results.

```bash
npm test         # run the tests
npm run build    # production build
```

## Built with

React · TypeScript · Vite · React Router

## Project status

- **Now:** a working web app. Data is stored only in the user's browser, and nothing is sent to a server. Sign-in is a placeholder, not real authentication.
- **Next:** a SQL Server database and back-end API for real accounts and data that follows you across devices.

## Repository layout

| Path | What's there |
|---|---|
| [`capstone/`](capstone/) | The web app ([technical README](capstone/README.md)) |
| [`capstone/src/lib/analysis.ts`](capstone/src/lib/analysis.ts) | How status and trends are calculated |
| [`capstone/docs/reference-ranges.md`](capstone/docs/reference-ranges.md) | Sources for typical ranges |

## Team

Capstone Team B: **Tony, Jared, Rob, Carlos**
