# Finance Dashboard Repo Instructions

## Read First

Before starting substantive work, read [PROJECT_STATUS.md](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/PROJECT_STATUS.md).

## Repo Purpose

This repo hosts a static Finance Dashboard for GitHub Pages. The dashboard is plain HTML/CSS/JS, reads generated JSON data, and is designed for low-friction manual refreshes and easy future AI maintenance.

## Key Folders To Inspect First

- [PROJECT_STATUS.md](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/PROJECT_STATUS.md)
- [README.md](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/README.md)
- [app/](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/app)
- [data/](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/data)
- [scripts/](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/scripts)
- [.github/workflows/](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/.github/workflows)

## Expected Workflow For Dashboard Changes

- Keep the frontend dependency-free unless there is a strong reason to change that.
- Treat `data/manual.json` and `data/auto.json` as editable source data.
- Treat `data/final.json` as a generated artifact, not the primary source of truth.
- If data shape changes, update both the generator script and the renderer expectations.
- Preserve the current Pages artifact layout unless there is a clear bug: `/app/` and `/data/` are published as-is, and `/` redirects to `/app/`.

## Expected Workflow For Deploy / Refresh Validation

- Normal code or source-data changes pushed to `main` use `Deploy Dashboard`.
- Manual hosted refreshes from GitHub Actions use `Refresh Dashboard Data`.
- Both workflows regenerate `data/final.json` before deploy.
- Both workflows run the hosted smoke test after deploy via `scripts/smoke_test.py`.
- If smoke tests fail, inspect workflow logs before changing frontend behavior.

## Commit / Push Rule

- When the user asks for commit/push, stage only files relevant to the task.
- Do not stage or revert unrelated untracked or user-owned files.
- Use clear commit messages that describe the actual change.

## Session Handover Rule

- After any meaningful implementation session, update [PROJECT_STATUS.md](/C:/Users/User/Documents/Claude%20Code/Finance%20Dashboard/PROJECT_STATUS.md) so the next Codex session can resume with minimal context.
