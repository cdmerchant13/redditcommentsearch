# 🔍 Reddit Comment Search (But Better)

Hey there. 👋

So, I got tired of Reddit's half-baked search tools. You know the ones—painfully slow, borderline useless for finding *your own* old comments, and definitely not something you'd call "pleasant to use." After one too many late-night rabbit holes trying to dig up that *one clever thing I said in r/AskHistorians*, I snapped and built this.

**Reddit Comment Search** is a clean, client-side tool for searching your own Reddit comment history with actual speed and sanity. No shady data harvesting. No endless scrolling. No login weirdness. Just you, your API token, and your words.

## 🛠 What It Does

- Connects to Reddit via OAuth (script-type app credentials)
- Fetches all your comments (yes, all of them)
- Lets you search by text, right in your browser
- Displays:
  - The comment body
  - The subreddit it was posted in
  - The number of upvotes
  - A direct link to the comment

Everything runs **locally in the browser**. Your data never touches any server other than Reddit's.

## ✨ Why I Built It

Because I wanted to remember what I actually said online, not just what Reddit’s API *thinks* is relevant this week.

## 🚀 Getting Started

1. Create a Reddit "script" app:  
   https://www.reddit.com/prefs/apps
2. Grab your:
   - `client_id`
   - `client_secret`
   - Reddit `username` and `password`
3. Paste those into the form
4. Smash the "Fetch Comments" button
5. Search your heart out

## 🧠 Tech Notes

- Pure HTML + JS + CSS (zero backend, fully static)
- Uses Reddit’s OAuth2 token endpoint with `password` grant
- Pagination handled with `after` tokens
- Deployable via GitHub Pages or any static site host

## ⚠️ A Note on API Tokens

Yes, you’re typing your Reddit credentials into a webpage. But:
- The page doesn’t send them anywhere but Reddit
- You can inspect the source, it’s all right here
- You’re encouraged to run it locally if you’re paranoid (and hey, same)

## 📦 Deployment

Fork it. Clone it. Host it on GitHub Pages. Or just double-click `index.html`. It's a single-page app. You do you.

## 🙃 Final Thought

Reddit may not want you to find your own comments. But I do.

— *Your Friendly Comment Archaeologist*
