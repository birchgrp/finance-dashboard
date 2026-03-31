# Daily Update SOP

This dashboard is intentionally manual-first.

## Normal use

1. Open the GitHub Pages dashboard link in Chrome.
2. Click `Reload data` in the page if you want to refetch the latest `final.json`.

## Manual content update

Edit [data/manual.json](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/data/manual.json) for:

- S1 focus tickers
- S2 research list
- S3 watchlist
- manual notes and commentary

## Auto content update

Edit [data/auto.json](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/data/auto.json) for:

- S4 macro events
- S5 ticker events
- S6 potential/tail-risk events
- S8 PBOC gold data

Or extend [scripts/update_dashboard.py](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/scripts/update_dashboard.py) to fetch those sections from preferred sources.

## Rebuild the frontend payload

Run:

```powershell
python scripts/update_dashboard.py
```

This regenerates [data/final.json](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/data/final.json).

If Python is unavailable on the current machine, make the same change from a machine with Python installed or use the manual GitHub Action after pushing the source JSON updates.

## Publish changes

1. Commit the updated files.
2. Push to GitHub.
3. The `Deploy Dashboard` workflow regenerates `data/final.json`, publishes the latest site to GitHub Pages, and smoke-tests the live hosted URL.

## If using the manual GitHub refresh workflow

1. Open the repository on GitHub.
2. Go to `Actions`.
3. Run `Refresh Dashboard Data`.
4. The workflow regenerates `data/final.json`, commits it if it changed, deploys the Pages site in the same run, and then smoke-tests the live hosted URL.
5. Refresh the dashboard page in Chrome.

## Operating principles

- No scheduled refresh is required.
- `manual.json` and `auto.json` are the editable source files.
- `final.json` is the generated display artifact.
- Any Pages deployment should be based on a freshly regenerated `final.json`.
- The manual refresh workflow is self-contained and should not rely on a later push-triggered deploy.
- Hosted smoke tests now verify `/`, `/app/`, `/data/final.json`, `/data/manual.json`, and `/data/auto.json` after deployment.
- Do not move refresh logic back into the browser UI.
- Keep schemas explicit and readable for future AI sessions.
