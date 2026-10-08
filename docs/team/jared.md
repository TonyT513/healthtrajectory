# Jared's guide

Your branch: **`jared-branch`**

This is your personal copy of the team workflow. It's the same as the [beginner's guide in the main README](../../README.md#beginners-guide-visual-studio-code), with your branch filled in.

> ⚠️ **Before your first commit, read [What NOT to commit](../../README.md#what-not-to-commit).** The repo is public. Never commit passwords, API keys, `.env` files, real health information or personal information. Deleting it later doesn't remove it from the history.

## One-time setup

1. **Accept the GitHub invite.** Check your email for an invite to `TonyT513/healthtrajectory` (or visit github.com/TonyT513/healthtrajectory/invitations) and click **Accept**. Invites expire after 7 days.
2. Install **VS Code**, **Git** and **Node.js (LTS)**, then restart your computer. Links are in [Part 1 of the main guide](../../README.md#part-1-install-the-tools-one-time).
3. In VS Code, open **Terminal → New Terminal** and run these, one line at a time. Use the **same email as your GitHub account**:
   ```bash
   git config --global user.name "Jared"
   git config --global user.email "your-github-email@example.com"
   git config --global pull.rebase false
   git config --global core.pager cat
   ```
   *Windows: if `npm` later says "running scripts is disabled", run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once and type **Y**.*
4. **Clone the project:** **Ctrl/Cmd + Shift + P** → **Git: Clone** → **Clone from GitHub** → **TonyT513/healthtrajectory** → save in **Documents** → **Open**.
5. **Switch to your branch:** click **`main`** in the **bottom-left corner** of VS Code → choose **`origin/jared-branch`**. The bottom-left should now say **`jared-branch`**. ✅

## Run the app

```bash
cd capstone
npm install      # first time only
npm run dev
```

Open **http://localhost:5173**. Don't use "Go Live" / Live Server; it shows a blank page. Stop the app with **Control + C** in the terminal.

## Every work session

1. ✅ Bottom-left of VS Code says **`jared-branch`**.
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
   *(No banner? **Pull requests** → **New pull request** → base: **`main`**, compare: **`jared-branch`**.)*
3. Write a clear title → **Create pull request**.
4. Check the **Files changed** tab: only things you meant to change?
5. **Merge pull request** → **Confirm merge**.
   - Conflicts? Don't guess. Ask the teammate who changed that file, or ask Tony.
6. ❗ **Don't click "Delete branch"** afterwards. `jared-branch` is your permanent workspace.
7. Tell the group chat: "Merged my PR, please run `git pull origin main`."

## Quick rules

- ✅ Work only on **`jared-branch`**. Never on `main`.
- ✅ Run `git pull origin main` at the start of every session.
- ✅ Say in the group chat which page or file you're working on.
- ❌ No passwords, keys, `.env` files, real health data or personal info.
- ❌ No `git push --force`. Don't delete branches.
- 🚨 Committed a secret by mistake? Tell Tony right away and change that password or key.

Stuck? See [Troubleshooting](../../README.md#troubleshooting) or send a screenshot of the error to the group.
