# HealthTrajectory — web front end

A React + TypeScript front end for manually tracking lab results over time. No AI and no EHR/FHIR integration in this version. All data is entered by the user.

```bash
cd capstone
npm install
npm run dev        # http://localhost:5173
npm test           # range parsing, status and trend logic
npm run build      # typecheck + production build to dist/
```

## Screens

| Route | Screen |
|---|---|
| `/signup`, `/signin`, `/welcome` | Account creation, sign-in, and an optional DOB/sex step (used only to suggest sex-specific typical ranges) |
| `/` | Dashboard: overall status, recent results, trend counts, goals, out-of-range callout, key metrics with sparklines, trend chart |
| `/labs` | Lab results: search, category, date and sort filters, "only out of range", grouped by draw date |
| `/labs/new` | Add a result, either **one test** or **a full panel** (lipid, BMP, CMP, CBC ± diff, liver, thyroid, iron, diabetes) |
| `/labs/test/:id` | One test: latest value, where it sits in its range, chart, history (edit/delete), guideline categories |
| `/trends` | Every tracked test by category, filterable by Needs attention / Improving / Worsening / Stable |
| `/history` | Conditions, medications, allergies, procedures, family history, immunizations |
| `/goals` | Lab goals (track themselves from results, e.g. "LDL below 100") and habit goals (updated manually) |
| `/documents` | Upload and view PDFs/images (stored in IndexedDB) |
| `/profile`, `/settings` | Profile, units, JSON export/import, clear data, delete account |

## How status and trends work (`src/lib/analysis.ts`)

- **Every result stores its own reference range**, typed as printed on the report (`70-99`, `< 5.7`, `>= 60`, `3.5 to 5.0`). Status (In range / High / Low / No range) is always computed against *that* range. It never uses a hard-coded universal one. Strict vs inclusive bounds are respected (A1C 5.7 against `< 5.7` is High).
- The catalog (`src/lib/catalog.ts`) offers a **typical adult range as a one-click suggestion only**, sex-specific where it matters. See [`docs/reference-ranges.md`](docs/reference-ranges.md) for sources.
- **Trend** compares the two most recent results. A change smaller than the test's `sig` threshold (default 3 %) is *Stable*. If either result is out of range, *Improving* means it moved closer to the range. Inside the range, direction counts only for tests where lower (LDL, A1C) or higher (HDL, eGFR) is generally better.
- **Needs attention** = latest result outside its range. **Overall** = Needs attention if any test is; otherwise Improving if more tests are improving than worsening; otherwise Stable.
- **Guideline categories** (ADA prediabetes, NCEP LDL tiers, KDIGO eGFR stages, …) are shown for context on the test page and never override the lab's range.

## Visual indication of abnormal results

Out-of-range values get red text, a red "High"/"Low" pill with a dot, a red left bar on table rows and cards, a diamond marker on charts (shape as well as color, for colorblind users), a hatched out-of-range zone on the range bar, and a summary callout on the dashboard.

## Persistence (this version)

`src/lib/storage.ts` keeps accounts, a salted password hash, and data in `localStorage`, and files in IndexedDB, all on the user's device. It is the only module that touches storage, so replacing it with API calls is the path to a real backend. The local sign-in is a placeholder, **not** real authentication.
