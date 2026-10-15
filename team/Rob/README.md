# Rob's folder

> 👋 **Hi Rob!** This page walks you through *everything*, one click at a time, assuming you've never used Git, GitHub or VS Code before. Do the parts **in order**. Each step ends with a **✅ Check** so you know it worked before moving on. The whole setup takes about **45–60 minutes** the first time; after that, a normal work session takes 2 minutes to start.

| Your info | |
|---|---|
| Your GitHub username | **`firorrt`** |
| Your branch (your personal workspace) | **`rob-branch`** |
| Your folder (your notes and journal) | **`team/Rob/`** |
| The project on GitHub | https://github.com/TonyT513/healthtrajectory |
| Your computer | Windows |

> ⚠️ **Before your first commit, read the [Dos and don'ts](../../README.md#dos-and-donts).** The project is **public**. Never put passwords, API keys, `.env` files, real health information or personal information in it. Deleting something later does **not** remove it from the history.

**Contents**
[Words you'll see](#words-youll-see) · [Part A: GitHub access](#part-a-github-access) · [Part B: Install the software](#part-b-install-the-software) · [Part C: Set up VS Code and Git](#part-c-set-up-vs-code-and-git) · [Part D: Get the project](#part-d-get-the-project-onto-your-computer) · [Part E: Run the app](#part-e-run-the-app) · [Part F: Your first practice change](#part-f-your-first-practice-change-start-to-finish) · [Part G: Every work session](#part-g-every-work-session-the-short-version) · [Part H: If something goes wrong](#part-h-if-something-goes-wrong) · [Shortcuts](#keyboard-shortcuts-windows)

---

## Words you'll see

| Word | What it means in plain English |
|---|---|
| **Git** | A program on your computer that saves snapshots of the project, so nothing is ever lost and you can see who changed what. |
| **GitHub** | The website that stores the team's shared copy of the project online. |
| **Repository ("repo")** | The project folder, including its whole history. Ours is `TonyT513/healthtrajectory`. |
| **Clone** | Download the repo from GitHub to your computer (once). |
| **Branch** | A separate copy of the code to work in. Yours is **`rob-branch`**. Your changes there can't break anyone else's work. |
| **`main`** | The team's official copy. It's **protected**: nobody changes it directly. |
| **Commit** | Save a snapshot of your changes on your computer, with a short message describing them. |
| **Push / Sync** | Upload your commits to GitHub. |
| **Pull** | Download other people's new commits to your computer. |
| **Pull request (PR)** | A request to copy your branch's finished work into `main`. GitHub shows exactly what changed. |
| **Merge** | Combine changes from one branch into another. Clicking **Merge** on a PR puts your work into `main`. |
| **Terminal** | A text window where you type commands. In VS Code it's the panel at the bottom. |

---

## Part A: GitHub access

### A1. Sign in to GitHub
Go to https://github.com and sign in as **`firorrt`**.
✅ **Check:** your profile picture shows in the top-right corner.

### A2. Accept the invite to the project
Tony sends you an invite to the project. Until you accept it, you can't upload any changes.
1. Check the email inbox for your GitHub account for **"TonyT513 invited you to TonyT513/healthtrajectory"**, and click **View invitation**.
   - No email? While signed in, go to https://github.com/TonyT513/healthtrajectory/invitations
2. Click **Accept invitation**.

✅ **Check:** GitHub shows *"You now have push access to the TonyT513/healthtrajectory repository."* Invites **expire after 7 days**; if yours did, ask Tony to send a new one.

### A3. Get your private commit email
Your commits show an email address, and this project is public, so use GitHub's private one:
1. On GitHub, click your **profile picture (top-right)** → **Settings**.
2. In the left menu, click **Emails**.
3. Check ✅ **Keep my email addresses private**.
4. Under it, GitHub shows an address like `12345678+firorrt@users.noreply.github.com`. **Copy it** into a note. You need it in Part C.

✅ **Check:** you have the `...@users.noreply.github.com` address saved somewhere.

---

## Part B: Install the software

You'll install three programs. **Install them in this order**, then restart.

### B1. VS Code (the code editor)
1. Go to https://code.visualstudio.com and click **Download for Windows**.
2. Open the downloaded file (`VSCodeUserSetup-...exe`).
3. Select **I accept the agreement** → **Next**.
4. Keep clicking **Next**. On **Select Additional Tasks**, make sure **Add to PATH** is checked (it is by default). Checking **"Add 'Open with Code' action"** is also handy.
5. Click **Install**, then **Finish**. You can close VS Code if it opens.

### B2. Git (saves your work and talks to GitHub)
1. Go to https://git-scm.com → **Download for Windows** → **Click here to download** (the 64-bit "Git for Windows Setup").
2. Open the downloaded file. Click **Yes** if Windows asks "Do you want to allow this app to make changes?"
3. Click **Next** on every screen **except these**:

   | Screen title | What to choose |
   |---|---|
   | **Choosing the default editor used by Git** | Open the dropdown and pick **Use Visual Studio Code as Git's default editor**. ⚠️ Don't skip this: the default (Vim) is very confusing for beginners. |
   | **Choose a credential helper** | Keep **Git Credential Manager** (the default). This is how Git signs in to GitHub for you. |

   Everything else: leave the default and click **Next**.
4. Click **Install**, then **Finish** (uncheck "View Release Notes" if you like).

### B3. Node.js (runs the app)
1. Go to https://nodejs.org and download the **LTS** version. Choose the **Windows Installer (.msi)**, 64-bit.
2. Open it → **Next** → accept the license → **Next** → **Next** → **Next**.
3. On **Tools for Native Modules**, leave the box **unchecked** → **Next**.
4. Click **Install** (click **Yes** if Windows asks for permission), then **Finish**.

### B4. Restart your computer
Really restart it. This lets Windows find Git and Node from everywhere. (Skipping this is the #1 cause of `'npm' is not recognized`.)

---

## Part C: Set up VS Code and Git

### C1. Open the terminal in VS Code
1. Open **VS Code** from the Start menu.
2. In the top menu, click **Terminal → New Terminal** (or press **Ctrl + `**, the key under Esc).
3. A panel opens at the bottom with a line like `PS C:\Users\Rob>`. That's the **terminal**. `PS` means it's PowerShell.

> 💡 **How to use the terminal:** click inside it, type or paste a command, then press **Enter**. To paste, press **Ctrl + V** or **right-click**. Run commands **one line at a time**.

### C2. Allow npm to run (one time)
Windows blocks some programs by default. Paste this and press **Enter**:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
If it asks a question, type **Y** and press **Enter**. Nothing else will print.

### C3. Check everything installed
Run each line separately:
```powershell
git --version
node --version
npm --version
```
✅ **Check:** each prints a version number, like `git version 2.51.0.windows.1`, `v22.20.0` and `10.9.3` (your numbers may differ). If one says *"is not recognized"*, close VS Code completely, reopen it, and try again. Still failing? Go back to Part B for that program.

### C4. Tell Git who you are
Run these four lines one at a time. In the second line, paste the **noreply email from A3** between the quotes:
```powershell
git config --global user.name "Rob"
git config --global user.email "PASTE-YOUR-NOREPLY-EMAIL-HERE"
git config --global pull.rebase false
git config --global core.pager cat
```
Nothing prints when they work. The last two lines prevent two confusing messages later.

✅ **Check:** run `git config --global --list`. You should see your name and noreply email in the list.

---

## Part D: Get the project onto your computer

### D1. Make a Projects folder
In the VS Code terminal, run:
```powershell
mkdir $HOME\Projects
```
This makes `C:\Users\<you>\Projects`.

> ⚠️ **Don't** put the project in **Documents** or **Desktop** if they sync to **OneDrive** (you'll see "OneDrive" in the folder path or cloud icons on files). OneDrive locks files while syncing and breaks the app install.

### D2. Clone (download) the project
1. In VS Code press **Ctrl + Shift + P**. A search box opens at the top.
2. Type **Git: Clone** and press **Enter**.
3. Click **Clone from GitHub**.
4. A popup says *"The extension 'GitHub' wants to sign in using GitHub."* Click **Allow**.
5. Your browser opens. Sign in as **`firorrt`** if asked, then click **Continue** / **Authorize Visual-Studio-Code**. If the browser asks "Open Visual Studio Code?", click **Open**.
6. Back in VS Code, a list appears at the top. Type **healthtrajectory** and click **TonyT513/healthtrajectory**.
7. A folder window opens. Go to **C: → Users → (your name) → Projects**, click it once, then click **Select as Repository Destination**.
8. Wait a few seconds. When asked **"Would you like to open the cloned repository?"**, click **Open**.
9. If asked **"Do you trust the authors of the files in this folder?"**, click **Yes, I trust the authors**.

✅ **Check:** the **Explorer** panel on the left (the two-pages icon at the top of the left bar) shows `capstone`, `docs`, `team`, `README.md` and more.

### D3. Switch to your branch
Right now you're on `main`, the team's official copy. Switch to your own workspace:
1. Look at the **very bottom-left corner** of VS Code. It says **`main`** next to a branch icon.
2. Click it. A list opens at the top of the window.
3. Click **`origin/rob-branch`**.

✅ **Check:** the bottom-left corner now says **`rob-branch`**. Also run `git branch` in the terminal: the line with `*` should be `rob-branch`.

> 💡 VS Code remembers your branch. But **always glance at the bottom-left before you start working**. If it ever says `main`, click it and pick `rob-branch` again.

---

## Part E: Run the app

1. Open a terminal: **Terminal → New Terminal**.
2. Run these one at a time:
   ```powershell
   cd capstone
   npm install
   npm run dev
   ```
   - `cd capstone` moves into the app's folder. The prompt changes to end in `\capstone>`.
   - `npm install` downloads the libraries the app needs. It takes **1–3 minutes**. Yellow `warn` lines are normal. **Only needed the first time**, or when the group chat says a new library was added.
   - `npm run dev` starts the app. After a few seconds you'll see `Local: http://localhost:5173/`. **Leave this terminal running** while you use the app.
3. Hold **Ctrl** and click `http://localhost:5173/` (or type it into Chrome or Edge).
4. In the app, click **Create an account** (it's only saved in your browser), then click **Load example data** on the dashboard.
5. While the app runs, any code you save updates the browser automatically.
6. **To stop the app:** click in the terminal and press **Ctrl + C**. If it asks *"Terminate batch job (Y/N)?"*, type **Y** and press **Enter**.

✅ **Check:** you saw the HealthTrajectory dashboard filled with example data.

> ⚠️ **Never use the "Go Live" button** (Live Server) at the bottom of VS Code. It shows a blank page for this app. Always use `npm run dev`.

**Next time**, open a new terminal and run just `cd capstone` then `npm run dev`.

---

## Part F: Your first practice change (start to finish)

This practice run uses your journal, so you can't break anything. You'll do the **whole cycle** once: change → commit → push → pull request → merge. Afterwards you'll officially be a **contributor** on GitHub.

### F1. Get the team's latest work
Check the bottom-left says **`rob-branch`**. In a terminal **at the project's top folder** (open a **new** terminal; it starts there), run:
```powershell
git pull origin main
```
✅ **Check:** it ends with `Already up to date.` or a list of updated files. If a tab named **MERGE_MSG** opens, just close it.

### F2. Make a change
1. In the **Explorer** (left), open **team → Rob → journal.md**.
2. Find the line `<!-- New entries go here, newest first. -->`. Below it, paste the template from the top of the file and fill it in, for example:
   ```markdown
   ## 2026-10-20

   **Worked on:**
   - Set up Git, VS Code and Node; ran the app

   **Done / merged:**
   - My first journal entry

   **Problems or questions:**
   - None

   **Next:**
   - Start my first task from the project plan
   ```
3. Press **Ctrl + S** to save. The file's tab no longer shows a white dot.

### F3. Commit (save a snapshot)
1. Click the **Source Control** icon on the left bar (it looks like a branch: three circles joined by lines), or press **Ctrl + Shift + G**. It shows a **1** badge.
2. Under **Changes**, you'll see `journal.md` with an **M** (modified). Click it to see your change highlighted in green.
3. **Read the list.** Only files you meant to change should be there.
4. In the **Message** box at the top, type: `Add first journal entry`
5. Click **✓ Commit**.
6. If asked *"There are no staged changes to commit. Would you like to stage all your changes and commit them directly?"*, click **Yes**.

✅ **Check:** the Changes list is empty and the button now says **Sync Changes 1↑**.

### F4. Push (upload to GitHub)
1. Click **Sync Changes** (or **Publish Branch** if that's what it says).
2. If it says *"This action will pull and push commits from and to 'origin/rob-branch'"*, click **OK** (or **OK, Don't Show Again**).
3. If a **Git Credential Manager** window asks you to sign in, choose **Sign in with your browser** → **Authorize**.

✅ **Check:** on https://github.com/TonyT513/healthtrajectory, click the **`main ▾`** button above the file list and choose **`rob-branch`**. Open **team → Rob → journal.md**. Your entry is there.

### F5. Open a pull request
1. Go to https://github.com/TonyT513/healthtrajectory. A yellow banner says **"rob-branch had recent pushes"**. Click **Compare & pull request**.
   - *No banner?* Click the **Pull requests** tab → **New pull request**. Set **base: `main`** and **compare: `rob-branch`**.
2. Check the arrow at the top reads **base: `main` ← compare: `rob-branch`**.
3. Title: `Rob: first journal entry`. Description: one sentence about what you did.
4. Click **Create pull request**.
5. Click the **Files changed** tab. You should see only `team/Rob/journal.md`.

### F6. Merge it into `main`
1. Go back to the **Conversation** tab and scroll down.
2. If it says **"This branch has no conflicts with the base branch"**, click **Merge pull request** → **Confirm merge** (it may say **Squash and merge**; that's fine too).
   - If it says there are **conflicts**, stop and ask Tony.
3. GitHub shows a **Delete branch** button. ❗ **Do NOT click it.** `rob-branch` is your permanent workspace.
4. Tell the group chat: *"Merged my first PR!"*

✅ **Check:** on the repo's main page (branch `main`), **team → Rob → journal.md** shows your entry. 🎉 You've done the full cycle, and within a day your picture appears under **Contributors** on the repo's main page.

---

## Part G: Every work session (the short version)

**Start**
1. Open VS Code (it reopens the project). ✅ Bottom-left says **`rob-branch`**.
2. New terminal → `git pull origin main` (gets the team's latest work into your branch).
3. To run the app: `cd capstone` → `npm run dev` (run `npm install` first if the group chat says a library was added).

**Work**
4. Make changes, **Ctrl + S**, and test them in the browser.
5. Source Control → **read the changed-files list** → message → **✓ Commit**.
6. **Sync Changes**. (Commit and sync as often as you like; it only affects your branch.)

**When something is finished**
7. `git pull origin main` → **Sync Changes** one more time.
8. GitHub → **Compare & pull request** → check **Files changed** → **Merge** → **don't delete the branch**.
9. Tell the group chat you merged, so everyone runs `git pull origin main`.

**Before you stop for the day**
10. Commit and **Sync** so your work is backed up on GitHub, even if it isn't finished.
11. Add a short journal entry if you like.

**Rules**
- ✅ Work only on **`rob-branch`**, never on `main`.
- ✅ Say in the group chat which page or file you're working on, so two people don't edit the same file.
- ✅ Keep notes and your journal in `team/Rob/`. Don't edit other people's folders.
- ❌ No passwords, keys, `.env` files, real health data or personal info.
- ❌ No `git push --force`. Don't delete branches.
- 🔑 Secrets (passwords, API keys) go in a `.env` file, which Git ignores. Commit only a `.env.example` with fake values, and share real values privately. See [Where secrets go instead](../../README.md#where-secrets-go-instead).

---

## Part H: If something goes wrong

The most common problems for new Windows users:

| What you see | What to do |
|---|---|
| `npm.ps1 cannot be loaded because running scripts is disabled` | Do step **C2**. |
| `'git' / 'node' / 'npm' is not recognized...` | Close **all** VS Code windows and reopen. Still failing? Restart the computer. Still failing? Reinstall that program (Part B). |
| `Could not read package.json` / `enoent ... package.json` | You forgot `cd capstone`. |
| `npm error code EPERM` / `EBUSY` during `npm install` | Stop the app (**Ctrl + C**), close other VS Code windows, and run `npm install` again. If your project path contains `OneDrive`, redo **D1–D3** in `C:\Users\<you>\Projects`. |
| Blank page at `127.0.0.1:5500` | You pressed "Go Live". Click **Port: 5500** at the bottom to stop it and use `npm run dev`. |
| Blank page at `localhost:5173` | Is the `npm run dev` terminal still running? Press **Ctrl + F5**. Still blank? Press **F12** → **Console**, screenshot the red text and send it to the group. |
| Bottom-left says `main` | Click it → choose `rob-branch` (or `origin/rob-branch`). Your unsaved and uncommitted changes come with you. |
| `origin/rob-branch` isn't in the branch list | **Ctrl + Shift + P** → **Git: Fetch**, then try again. |
| Push fails: `protected branch` / `GH006` | You committed on `main`. Don't panic and don't force anything: send a screenshot to Tony. |
| Push fails: `Permission denied` / `403` | Check you accepted the invite (A2). If you did: **Start** → type **Credential Manager** → **Windows Credentials** → remove `git:https://github.com`, then sync again and sign in as **`firorrt`**. |
| A screen ending in `(END)` or `:` | Press **q**. Then run `git config --global core.pager cat` so it doesn't happen again. |
| A black screen with `~` down the left side | You're in the Vim editor. Type `:wq` and press **Enter**. (Choosing VS Code as Git's editor in B2 prevents this.) |
| `<<<<<<<` and `>>>>>>>` appear in a file (a **merge conflict**) | Someone changed the same lines. Don't guess; ask Tony or that teammate. VS Code shows **Accept Current / Incoming / Both** buttons above each conflict. |
| Totally stuck | Rename your project folder (e.g. `healthtrajectory-old`) so nothing is lost, then redo **Part D**. Or send a screenshot to the group chat. |

More problems and fixes: [Troubleshooting in the main README](../../README.md#troubleshooting).

---

## Keyboard shortcuts (Windows)

| Shortcut | What it does |
|---|---|
| **Ctrl + S** | Save the file |
| **Ctrl + `** | Open or close the terminal |
| **Ctrl + Shift + P** | Command search box (e.g. "Git: Clone", "Git: Fetch") |
| **Ctrl + Shift + G** | Source Control panel (commit and sync) |
| **Ctrl + Shift + E** | Explorer panel (files) |
| **Ctrl + P** | Open a file by typing its name |
| **Ctrl + C** (in the terminal) | Stop the running app |
| **Ctrl + Z** | Undo |
| **F12** (in the browser) | Show the browser's error console |

---

*Your journal: [`journal.md`](journal.md). Add anything else you like to this folder: notes, research, screenshots.*
