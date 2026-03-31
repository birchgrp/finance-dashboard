# Project Status

## Current Architecture

- Static GitHub Pages dashboard
- Plain HTML/CSS/JS frontend in [app/](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/app)
- Source data split across [data/manual.json](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/data/manual.json) and [data/auto.json](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/data/auto.json)
- Generated display payload in [data/final.json](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/data/final.json)
- Merge/build script in [scripts/update_dashboard.py](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/scripts/update_dashboard.py)
- Hosted smoke test in [scripts/smoke_test.py](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/scripts/smoke_test.py)

## What Is Working

- Dashboard content is no longer trapped in the legacy single JSX component.
- Pages deploys regenerate `data/final.json` before publishing.
- Manual refresh workflow regenerates `data/final.json`, commits it if changed, deploys Pages, and smoke-tests the live site in the same run.
- Root Pages URL redirects or hands off to `/app/`, while `/app/` and `/data/` are published directly.
- Hosted smoke tests check `/`, `/app/`, `/data/final.json`, `/data/manual.json`, and `/data/auto.json`.

## Deployment / Pages Status

- Primary deploy workflow: [deploy.yml](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/.github/workflows/deploy.yml)
- Manual refresh workflow: [refresh-dashboard.yml](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/.github/workflows/refresh-dashboard.yml)
- Current branch in use has been pushed to `main`.
- Deploys should now be self-contained and not depend on a follow-up workflow run.

## Automated Verification Status

- Live hosted smoke tests exist and are reused by both publish workflows.
- Root smoke-test logic now accepts either:
  - a true redirect to `/app/`, or
  - an HTML-level handoff to `/app/`
- `/app/` must still load directly and contain expected dashboard markers.

## Important File Map

- [app/index.html](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/app/index.html): dashboard shell
- [app/app.js](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/app/app.js): data fetch + render logic
- [data/manual.json](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/data/manual.json): manual source data
- [data/auto.json](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/data/auto.json): refresh-generated source data
- [data/final.json](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/data/final.json): generated frontend payload
- [scripts/update_dashboard.py](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/scripts/update_dashboard.py): merge/build script
- [scripts/smoke_test.py](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/scripts/smoke_test.py): hosted verification
- [.github/workflows/deploy.yml](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/.github/workflows/deploy.yml): deploy path
- [.github/workflows/refresh-dashboard.yml](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/.github/workflows/refresh-dashboard.yml): manual refresh path

## Known Limitations

- Local Python is not available in the current desktop workspace PATH, so Python scripts were not executed locally here.
- Hosted smoke tests verify availability and basic structure, not full browser interaction.
- There is still an unrelated untracked repo file named `Migration from Claude/dashboard.jsx` that has intentionally been left alone.

## Next Recommended Refinements

- Run the updated GitHub workflows once and confirm smoke tests pass end-to-end on the live Pages site.
- If desired later, factor the duplicated Pages artifact build steps into a simpler shared pattern, but only if it stays readable.
- Consider adding a tiny documented process for refreshing `auto.json` from preferred sources if manual refresh volume increases.

## How To Resume In A New Codex Session

- Read this file first.
- Then inspect [AGENTS.md](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/AGENTS.md), [README.md](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/README.md), and the two workflow files.
- Check the latest Actions runs before changing deploy or smoke-test logic.
- Update this file again at the end of any meaningful implementation session.
