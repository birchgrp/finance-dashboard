# Dashboard Implementation Handover

## Goal

Refactor the existing uploaded dashboard into a version that is:

1. easy to open in Chrome as a link
2. easy for ChatGPT or Claude to refine later
3. easy for ChatGPT or Claude to update manually on demand
4. accessible from another device, including a laptop when away from the desktop
5. allowed to be refactored/redesigned as needed to achieve the above

---

## Current state of the uploaded dashboard

The uploaded dashboard is currently a single React component that mixes:

- UI rendering
- embedded default data
- local persistence
- refresh logic
- browser-only runtime assumptions

Key issues identified:

- it is not a complete app by itself
- it depends on a custom `window.storage`
- some refresh logic is embedded inside the browser UI
- data and presentation are tightly coupled
- this makes it harder to open, refine, and maintain over time

---

## User requirements clarified

### Functional requirements
- Dashboard should open easily in Chrome via a link
- Dashboard should be usable from a laptop, not just the desktop where the files were created
- Daily refresh does **not** need to be scheduled
- Refresh can happen manually whenever needed
- Future ChatGPT or Claude sessions should be able to understand and work on it easily

### Non-functional requirements
- Maintainability is more important than preserving the current code structure
- Refactoring/redesign is acceptable
- Low friction for future edits and updates
- Prefer low or zero ongoing cost if possible

---

## Recommendation chosen

## Recommended architecture
**Hosted static dashboard + repo-based data + manual refresh workflow**

This means:

1. **Dashboard frontend is hosted online**
   - opens as a normal Chrome link
   - accessible from desktop or laptop

2. **Dashboard data is separated from the UI**
   - manual/editable data stored in JSON
   - refreshed data stored separately
   - display data generated from those sources

3. **Refresh is manual, not scheduled**
   - trigger refresh only when needed
   - no always-on backend required

4. **Code and data live in a GitHub repo**
   - easier for future AI sessions to understand
   - versioned and easier to maintain

---

## Why this approach was chosen

This approach best satisfies all requirements:

- opens from anywhere by URL
- does not depend on the original desktop being on
- simpler than a full backend app
- cleaner than keeping everything in one JSX file
- easier for future ChatGPT or Claude sessions to work on
- can be near-zero cost if built with free tools

---

## Recommended platform choices

### Hosting
- **GitHub Pages** for the dashboard frontend

### Source control / collaboration
- **GitHub repo**

### Manual refresh
- **GitHub Actions manual workflow** (`workflow_dispatch`)
- or a script run manually from local machine if preferred

### Cost preference
Start with:
- public GitHub repo
- GitHub Pages default URL
- manual refresh only
- no paid custom domain
- no scheduled jobs

This was discussed as the lowest-cost practical setup.

---

## Suggested project structure

```text
dashboard/
  README.md
  DAILY_UPDATE_SOP.md

  app/
    index.html
    app.js
    styles.css

  data/
    manual.json
    auto.json
    final.json

  scripts/
    update_dashboard.py

  .github/workflows/
    refresh-dashboard.yml
    deploy.yml
```

---

## Suggested separation of responsibility

### `app/`
Frontend only.
Should:
- read `final.json`
- render the dashboard
- keep UI logic lightweight

Should not:
- contain AI refresh logic
- contain embedded default dashboard content as source of truth

### `data/manual.json`
For hand-maintained sections such as:
- S1 focus tickers
- S2 research list
- S3 watchlist
- custom notes or manually curated items

### `data/auto.json`
For refresh-generated sections such as:
- S4 macro scheduled events
- S5 ticker-specific events
- S6 potential / tail-risk events
- S8 PBOC gold reserve data

### `data/final.json`
Merged display data used by the frontend.

### `scripts/update_dashboard.py`
Manual refresh/update script.
Should:
- generate or refresh auto sections
- merge manual + auto data
- output `final.json`

### `.github/workflows/refresh-dashboard.yml`
Manual GitHub Action to run refresh on demand from browser.

### `.github/workflows/deploy.yml`
Deploy updated static dashboard/data to GitHub Pages.

---

## Preferred workflow after implementation

## Normal viewing
1. Open Chrome
2. Open hosted dashboard link

## Manual refresh when needed
1. Open GitHub repo
2. Trigger manual refresh workflow
3. Wait for workflow to update data/deploy
4. Reload dashboard link in Chrome

## Future refinement
- UI/layout changes -> edit `app/`
- data logic changes -> edit `scripts/update_dashboard.py`
- manual content changes -> edit `data/manual.json`

---

## Important design principles for implementation

1. **Do not keep everything in one giant component**
2. **Do not keep dashboard content embedded as source-of-truth inside JSX**
3. **Do not make browser UI responsible for live model refresh**
4. **Keep frontend simple**
5. **Keep data files explicit and readable**
6. **Document the workflow clearly for future AI sessions**

---

## Cost guidance discussed

Preferred implementation should try to avoid fees.

### Lowest-cost path discussed
- public GitHub repo
- GitHub Pages
- default GitHub Pages URL
- manual refresh only
- avoid paid APIs initially if possible

Potential fees only arise if later choosing:
- private repo features
- custom domain
- paid AI/data APIs

---

## Implementation preference

The user is okay to:
- edit
- refactor
- redesign

the current dashboard code in order to achieve the final goals above.

So implementation should optimize for:
- maintainability
- portability
- clarity
- future AI collaboration

and **not** for preserving the existing architecture.

---

## First implementation priorities

Recommended order:

1. Extract the dashboard data out of the current JSX/component
2. Build a clean static frontend that renders from JSON
3. Define JSON schemas for manual and auto data
4. Build manual refresh/update script
5. Add GitHub Actions manual workflow
6. Deploy via GitHub Pages
7. Write README + daily update SOP

---

## What future ChatGPT/Claude should help with

A future implementation chat should help with:

1. designing the final file structure
2. deciding whether frontend should be plain HTML/JS or lightweight React
3. extracting the current dashboard sections into JSON schema
4. writing the update script
5. creating GitHub Actions workflows
6. preparing deployment to GitHub Pages
7. producing a clean maintainable v1

---

## Final decision summary

### Locked requirements
- open easily in Chrome via link
- accessible from laptop away from desktop
- no scheduled refresh needed
- manual refresh is enough
- easy for future AI sessions to refine and maintain
- refactor/redesign is allowed

### Recommended solution
**Hosted static dashboard + GitHub repo + separated data files + manual refresh workflow**

