# Finance Dashboard

This repo is a refactored version of the legacy `dashboard.jsx` trading dashboard.

The new structure is optimized for:

- a normal hosted Chrome link
- GitHub Pages deployment
- easy manual refreshes
- clear separation between UI and data
- future AI-assisted maintenance

## Structure

```text
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

## Data model

- `data/manual.json`
  - hand-maintained sections
  - current home for S1, S2, S3, and dashboard notes
- `data/auto.json`
  - refresh-generated sections
  - current home for S4, S5, S6, and S8
- `data/final.json`
  - merged display payload used by the frontend

## Frontend

The frontend is plain HTML, CSS, and JavaScript.

It:

- fetches `data/final.json`
- renders the dashboard sections
- supports a manual in-page reload of the published payload
- avoids browser-side AI refresh logic

## Local usage

Because browsers usually block `fetch()` from `file://`, serve the folder locally with any static file server:

```powershell
# Example if Python is installed
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/app/
```

## Update flow

1. Edit `data/manual.json` when manual content changes.
2. Edit `data/auto.json` directly or extend `scripts/update_dashboard.py` to refresh it.
3. Run:

```powershell
python scripts/update_dashboard.py
```

4. Commit and push source changes.
5. The `Deploy Dashboard` workflow regenerates `data/final.json` and publishes a fresh Pages artifact in the same run.

If Python is not installed on the current machine, you can still:

- edit `data/manual.json`
- edit `data/auto.json`
- update `data/final.json` from another machine or via GitHub Actions

## GitHub Pages

The repo uses two explicit GitHub Actions paths:

- `Deploy Dashboard`
  - runs on pushes to `main` and manual dispatch
  - regenerates `data/final.json`
  - publishes the Pages site
  - smoke-tests the live Pages URL after deploy
- `Refresh Dashboard Data`
  - runs manually from the GitHub Actions UI
  - regenerates `data/final.json`
  - commits `data/final.json` if it changed
  - republishes the Pages site in the same workflow run
  - smoke-tests the live Pages URL after deploy

The published artifact keeps the repo layout intact:

- `app/*` is published under `/app/`
- `data/*` is published under `/data/`
- the site root redirects to `/app/`

That keeps local preview and hosted paths consistent.

## Hosted usage

The intended viewing path is the hosted GitHub Pages link.

- open the repository's Pages URL in Chrome
- the site root redirects to the dashboard
- use the in-page `Reload published data` button to refetch the current deployed `final.json`
- sections 4, 5, 6, and 8 only change after `data/auto.json` is updated in the repo and republished

Both publish workflows now run lightweight hosted smoke tests against the live Pages URL. The checks cover:

- `/` and `/app/` responding successfully
- `/data/final.json`, `/data/manual.json`, and `/data/auto.json` responding successfully
- `final.json` parsing as valid JSON
- the dashboard HTML containing expected markers

## Notes For Future AI Sessions

- The legacy source remains in [dashboard.jsx](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/dashboard.jsx) as migration reference only.
- `data/final.json` should stay derived, not hand-edited.
- both publish workflows regenerate `data/final.json` before deploying Pages
- the manual refresh workflow does not depend on a later push-triggered deploy
- both publish workflows reuse `scripts/smoke_test.py` for hosted verification
- Prefer updating schemas and render helpers before adding new ad hoc fields.
- Keep the frontend dependency-free unless there is a strong reason to add a build step.
