# Tony's folder

Your branch: **`tony-branch`**

This folder is yours. It holds this guide and [`journal.md`](journal.md), your work log. Add anything else you like here (notes, research, screenshots). Only you edit files in `team/Tony/`, so they never conflict with anyone else's.

This guide is your personal copy of the team workflow. It's the same as the [beginner's guide in the main README](../../README.md#beginners-guide-visual-studio-code), with your branch filled in.

> ⚠️ **Before your first commit, read the [Dos and don'ts](../../README.md#dos-and-donts).** The repo is public. Never commit passwords, API keys, `.env` files, real health information or personal information. Deleting it later doesn't remove it from the history.

## One-time setup

1. You're the repo owner, so you don't need an invite. `main` is protected for you too, so you follow the same branch → pull request routine as everyone else.
2. Install **VS Code**, **Git** and **Node.js (LTS)**, then restart your computer. Links are in [Part 1 of the main guide](../../README.md#part-1-install-the-tools-one-time).
3. In VS Code, open **Terminal → New Terminal** and run these, one line at a time. Use the **same email as your GitHub account**:
   ```bash
   git config --global user.name "Tony"
   git config --global user.email "your-github-email@example.com"
   git config --global pull.rebase false
   git config --global core.pager cat
   ```
   *Windows: if `npm` later says "running scripts is disabled", run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once and type **Y**.*
4. **Clone the project:** **Ctrl/Cmd + Shift + P** → **Git: Clone** → **Clone from GitHub** → **TonyT513/healthtrajectory** → save in **Documents** → **Open**.
5. **Switch to your branch:** click **`main`** in the **bottom-left corner** of VS Code → choose **`origin/tony-branch`**. The bottom-left should now say **`tony-branch`**. ✅

## Run the app

```bash
cd capstone
npm install      # first time only
npm run dev
```

Open **http://localhost:5173**. Don't use "Go Live" / Live Server; it shows a blank page. Stop the app with **Control + C** in the terminal.

## Every work session

1. ✅ Bottom-left of VS Code says **`tony-branch`**.
2. Get the team's latest work into your branch:
   ```bash
   git pull origin main
   ```
3. Make your changes, save, and test them in the app.
4. **Source Control** (left sidebar) → **read the list of changed files** → type a message → **✓ Commit**.
5. Click **Sync Changes** (or **Publish Branch** the first time).

## When something is finished: move it into `main`

1. Run `git pull origin main` and **Sync Changes** one more time.
2. On [GitHub](https://github.com/TonyT513/healthtrajectory), click **Compare & pull request**.
   *(No banner? **Pull requests** → **New pull request** → base: **`main`**, compare: **`tony-branch`**.)*
3. Write a clear title → **Create pull request**.
4. Check the **Files changed** tab: only things you meant to change?
5. **Merge pull request** → **Confirm merge**.
   - Conflicts? Don't guess. Ask the teammate who changed that file, or ask Tony.
6. ❗ **Don't click "Delete branch"** afterwards. `tony-branch` is your permanent workspace.
7. Tell the group chat: "Merged my PR, please run `git pull origin main`."

## Your journal

Open [`journal.md`](journal.md), copy the template into a new dated entry (newest at the top), then commit and push it like any other change. It reaches `main` the next time you merge a pull request. A short entry after each work session is enough.

## Quick rules

- ✅ Work only on **`tony-branch`**. Never on `main`.
- ✅ Run `git pull origin main` at the start of every session.
- ✅ Say in the group chat which page or file you're working on.
- ✅ Keep your notes and journal in `team/Tony/`. Don't edit other people's folders.
- ❌ No passwords, keys, `.env` files, real health data or personal info.
- ❌ No `git push --force`. Don't delete branches.
- 🚨 Committed a secret by mistake? Tell Tony right away and change that password or key.

Stuck? See [Troubleshooting](../../README.md#troubleshooting) or send a screenshot of the error to the group.
