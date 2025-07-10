# Reddit Comment Search (But Better)

I got tired of Reddit's half-baked search tools. You know the ones—painfully slow, borderline useless for finding *your own* old comments, and definitely not something you'd call "pleasant to use." After one too many late-night rabbit holes trying to dig up that *one clever thing I said in r/AskHistorians*, I snapped and built this.

**Reddit Comment Search** is a clean, client-side tool for searching your own Reddit comment history with actual speed and sanity. No shady data harvesting. No endless scrolling. No login weirdness. Just you, your API token, and your words.

---

##  What It Does

- Authenticates via Reddit's **OAuth2 API** using the implicit grant flow.
- Fetches **your entire comment history**
- Stores it in **localStorage** to speed up future sessions
- Lets you:
  - 🔍 **Search** comments (with fuzzy match via Fuse.js)
  - 🧵 **Filter by subreddit**
  - 🧹 **Clear cached data** anytime

All processing happens **locally in your browser**. Your credentials and comment history never leave your machine.

---

##  Why I Built It

Because Reddit’s search is allergic to usefulness, and I wanted a fast, private, one-click way to find things I *know* I said. Also: I like excuses to avoid doing real work.

---

##  Getting Started

1. **Create a Reddit App:**
   - Go to [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps).
   - Click "are you a developer? create an app...".
   - Give it a name (e.g., "My Comment Search").
   - Select **"installed app"**.
   - For the **"redirect uri"**, enter the URL where you will be hosting the `index.html` file. If you are running it locally, you can use `http://127.0.0.1:5500/index.html` (or whatever port you are using). If you are hosting it on GitHub pages, it will be something like `https://<your-username>.github.io/<your-repo-name>/`.
   - Click "create app".
2. **Get your Client ID:**
   - After creating the app, you will see your **client ID** under the app name.
3. **Use the Tool:**
   - Open the `index.html` file in your browser.
   - Paste your **client ID** into the input box.
   - Click "Login with Reddit".
   - You will be redirected to Reddit to authorize the application.
   - After authorizing, you will be redirected back to the tool and your comments will be fetched.

---

##  Tech Stack

- Vanilla **HTML/CSS/JS**
- **Fuse.js** for fuzzy search
- **Reddit API** with OAuth2 `implicit` grant flow
- Fully static: works on GitHub Pages or anywhere you can host an `index.html`

---

##  Privacy Notes

- Your client ID is stored in `localStorage` for convenience.
- Your OAuth2 access token is stored in `localStorage` to avoid having to log in every time.
- Comments are cached locally with `localStorage`.
- You can clear all cached data at any time using the "Clear Cache & Logout" button.

---

##  Live Demo / Deployment

This site is 100% static and deploys via GitHub Pages.  
To try it yourself:
- Fork the repo
- Follow the "Getting Started" instructions to create your own Reddit app and get a client ID.
- Enable Pages in the repo settings.
- Or just open `index.html` locally in a browser.
- Also runs here: https://cdmerchant13.github.io/redditcommentsearch/
---

## 🙃 Final Thought

Reddit might not want you to find your old comments. But I do.

— *Your Friendly Comment Archaeologist*