# Reddit Comment Search (But Better)

I got tired of Reddit's half-baked search tools. You know the ones—painfully slow, borderline useless for finding *your own* old comments, and definitely not something you'd call "pleasant to use." After one too many late-night rabbit holes trying to dig up that *one clever thing I said in r/AskHistorians*, I snapped and built this.

**Reddit Comment Search** is a clean, client-side tool for searching your own Reddit comment history with actual speed and sanity. No shady data harvesting. No endless scrolling. No login weirdness. Just you, your API token, and your words.

---

##  What It Does

- Authenticates via Reddit's **OAuth2 API** (you paste in your token info)
- Fetches **your entire comment history**
- Stores it in **localStorage** to speed up future sessions
- Lets you:
  - 🔍 **Search** comments (with fuzzy match via Fuse.js)
  - 🧵 **Filter by subreddit**
  - 🔢 **Sort by upvotes** (ascending or descending)
  - 🧹 **Clear cached data** anytime

All processing happens **locally in your browser**. Your credentials and comment history never leave your machine.

---

##  Why I Built It

Because Reddit’s search is allergic to usefulness, and I wanted a fast, private, one-click way to find things I *know* I said. Also: I like excuses to avoid doing real work.

---

##  Getting Started

1. [Create a Reddit app](https://www.reddit.com/prefs/apps) with "script" access
2. Grab your:
   - `client_id`
   - `client_secret`
   - Reddit `username`
   - Reddit `password`
3. Paste them into the form on the page
4. Hit **Fetch Comments**
5. Search and filter to your heart’s content

---

##  Tech Stack

- Vanilla **HTML/CSS/JS**
- **Fuse.js** for fuzzy search
- **Reddit API** with OAuth2 `password` grant flow
- Fully static: works on GitHub Pages or anywhere you can host an `index.html`

---

##  Privacy Notes

- Your credentials are only sent directly to Reddit to get a token
- Comments are cached locally with `localStorage`
- You can clear the cache any time using the "Clear Cache" button

---

##  Live Demo / Deployment

This site is 100% static and deploys via GitHub Pages.  
To try it yourself:
- Fork the repo
- Enable Pages in the repo settings
- Or just open `index.html` locally in a browser
- Also runs here: https://cdmerchant13.github.io/redditcommentsearch/
---

## 🙃 Final Thought

Reddit might not want you to find your old comments. But I do.

— *Your Friendly Comment Archaeologist*
