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

## Quick start

Already have Git and Node.js? Run:

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

**New to any of this?** Follow the [step-by-step guide for beginners](#beginners-guide-visual-studio-code) below.

> ⚠️ **Don't use VS Code's "Go Live" / Live Server button.** It shows a blank page. This app is written in TypeScript/React, which the browser can't read directly. `npm run dev` translates it on the fly, and Live Server doesn't. Always use `npm run dev` and open **http://localhost:5173**.

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

---

## Beginner's guide (Visual Studio Code)

Never used Git, GitHub or VS Code before? Start here. You only do **Part 1** and **Part 2** once. **Part 3** and **Part 4** are what you do every time you work on the project.

> **Mac or Windows?** Where this guide says **Cmd**, Windows users press **Ctrl**. Where it says **Option**, Windows users press **Alt**.

### Part 1: Install the tools (one time)

| Step | What to do |
|---|---|
| 1. **GitHub account** | Sign up at [github.com](https://github.com) if you don't have one. Send your username to Tony so Tony can add you to the project. You **can't push changes** until you're added (see the box below). |
| 2. **VS Code** | Download from [code.visualstudio.com](https://code.visualstudio.com) and install it. |
| 3. **Git** | **Mac:** open the **Terminal** app, type `git --version` and press Enter. If it asks to install "command line developer tools", click **Install**. **Windows:** download from [git-scm.com](https://git-scm.com) and install with all the default options. |
| 4. **Node.js** | Download the **LTS** version from [nodejs.org](https://nodejs.org) and install it. This is what runs the app. |
| 5. **Restart VS Code** | Close VS Code completely and reopen it so it can find Git and Node. |

> **Tony — adding a teammate:** on GitHub, open this repo → **Settings** → **Collaborators** → **Add people** → type their username. They'll get an email invite they have to **accept**.

**Tell Git who you are** (one time). In VS Code, open the menu **Terminal → New Terminal**. Type these two lines, pressing Enter after each, with your own name and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global pull.rebase false
git config --global core.pager cat
```

The last two lines prevent two confusing messages later (see Troubleshooting). Nothing will print; that means it worked. Since this repo is public, your email shows on your commits. To keep it private, use the `...@users.noreply.github.com` address from GitHub → **Settings** → **Emails** (turn on **Keep my email addresses private**).

### Part 2: Get the project onto your computer ("clone") (one time)

1. Open VS Code. If a project is already open, close it with **File → Close Folder**.
2. Press **Cmd + Shift + P**, type **Git: Clone**, and press Enter.
3. Choose **Clone from GitHub**. If it asks you to sign in to GitHub, click **Allow** and finish signing in in your browser.
4. Choose **TonyT513/healthtrajectory**. (Or paste `https://github.com/TonyT513/healthtrajectory.git`.)
5. Pick a folder to save it in, such as **Documents**. Avoid saving it inside OneDrive or iCloud folders.
6. When VS Code asks **"Would you like to open the cloned repository?"**, click **Open**.
7. If it asks **"Do you trust the authors?"**, click **Yes, I trust the authors**.

You should now see `capstone`, `docs` and `README.md` in the **Explorer** panel on the left.

### Part 3: Run the app

1. Open a terminal: **Terminal → New Terminal**. It appears at the bottom of VS Code.
2. Type these, pressing Enter after each:

   ```bash
   cd capstone
   npm install
   npm run dev
   ```

   - `cd capstone` moves into the app's folder. You must do this first.
   - `npm install` downloads the libraries the app needs. It takes a minute and you only need it the first time, or after someone adds a new library. Yellow "warn" messages are normal.
   - `npm run dev` starts the app. **Leave this terminal running** while you use the app.
3. When you see `Local: http://localhost:5173/`, hold **Cmd** and click that link, or type it into your browser.
4. Click **Create an account** (it's only saved on your computer), then **Load example data** to see the app filled in.
5. While it's running, any code you save shows up in the browser automatically.
6. To **stop** the app: click in the terminal and press **Control + C** (on Mac too, it's the Control key, not Cmd).

Next time, you only need `cd capstone` and `npm run dev`.

### Part 4: Your everyday routine — pull, change, commit, push

Think of GitHub as the team's shared copy. **Pull** = get everyone else's latest changes. **Commit** = save a snapshot of your changes on your computer. **Push** = send your snapshots up to GitHub so the team gets them.

**The golden rule: always pull before you start working, and pull again right before you push.**

#### Using buttons (easiest)

1. **Pull first.** Click the **Source Control** icon on the left sidebar (it looks like a branch: three dots connected by lines). Click the **⋯** menu at the top of the panel → **Pull**.
2. **Make your changes** and save the files (**Cmd + S**). Changed files appear under **Changes** in the Source Control panel. Click a file there to see exactly what you changed.
3. **Commit.** Type a short message in the box at the top describing what you did, such as `Add sleep goal to Goals page`, then click **✓ Commit**.
   - If it asks *"There are no staged changes. Would you like to stage all your changes and commit them directly?"*, click **Yes** (or **Always**).
4. **Push.** Click **Sync Changes** (it shows arrows and numbers). This pulls anything new, then pushes your commit. If asked, click **OK**.
5. Check [the repo on GitHub](https://github.com/TonyT513/healthtrajectory); your commit message should appear near the top.

#### Using the terminal (same thing, typed)

```bash
git pull                                  # 1. get the latest changes
# ... edit and save your files ...
git status                                # see which files you changed
git add .                                 # 2. include all your changes
git commit -m "Describe what you changed" # 3. save a snapshot
git pull                                  # 4. get anything new from teammates
git push                                  # 5. send it to GitHub
```

Run these from the project folder (`healthtrajectory`). If your terminal is inside `capstone`, Git commands still work.

#### Team tips

- **Tell the team what you're working on** so two people don't edit the same file at the same time. That's the main cause of conflicts.
- **Commit small and often.** One feature or fix per commit is easier to understand and to undo.
- **Never commit** passwords, API keys or real health information. The repo is public.
- **Don't commit `node_modules`.** It's already ignored by `.gitignore`, so you don't need to do anything.

### Troubleshooting

| What you see | What to do |
|---|---|
| **Blank white page** at `127.0.0.1:5500` | You used Live Server. Stop it (click **Port: 5500** at the bottom of VS Code) and use `npm run dev` with **http://localhost:5173** instead. |
| **Blank page** at `localhost:5173` | Make sure the `npm run dev` terminal is still running. Press **Cmd + Shift + R** to hard-refresh. Still blank? Press **Cmd + Option + J** (Chrome) to see errors and send them to the team. |
| `npm: command not found` / `'npm' is not recognized` | Node.js isn't installed, or VS Code was open while you installed it. Install the LTS version from nodejs.org and **restart VS Code**. |
| `npm error enoent ... package.json` | You're in the wrong folder. Run `cd capstone` first. |
| `Port 5173 is in use` | The app is already running in another terminal. Use that one, or stop it with **Control + C**. |
| `git: command not found` | Git isn't installed. See Part 1, then restart VS Code. |
| `Need to specify how to reconcile divergent branches` | Run `git config --global pull.rebase false`, then `git pull` again. |
| `Please tell me who you are` | Run the two `git config` lines in Part 1. |
| `Permission denied` / `403` when pushing | Either you haven't **accepted** the collaborator invite (check your email or github.com/notifications), or VS Code isn't signed in to GitHub (click the **person icon** at the bottom-left → sign in with GitHub). |
| `rejected ... fetch first` / `Updates were rejected` | Someone pushed before you. Run `git pull`, then `git push` again. |
| A screen ending with `(END)` or `:` that won't go away | Press **q**. To stop it happening, run `git config --global core.pager cat`. |
| A text editor opens saying **"Please enter a commit message"** or **MERGE_MSG** | Git is confirming a pull. Just close that editor tab; if asked, save it. In a terminal editor (vim), type `:wq` and press Enter. |
| **Merge conflict** (files marked **C** or `<<<<<<<` in the code) | You and a teammate changed the same lines. Open the file; VS Code shows **Accept Current Change** (yours), **Accept Incoming Change** (theirs) or **Accept Both**. Pick the right one, save, then commit and push. If you're unsure, ask the teammate who made the other change before choosing. |
| Everything is a mess and you just want a fresh copy | Rename your old project folder (so nothing is lost), then do **Part 2** again. |
