# Dallas Scout — CLAUDE.md

## What this project is
A hand-curated city guide — "a working guide to America, one city at a time." Dallas is live with 98 spots. Austin, Houston, San Antonio, NYC, LA, and Chicago are planned. Built and maintained by Roy Eliasaf.

## Stack
- **No framework** — pure HTML, CSS, JavaScript
- **No build step** — edit files and push, that's it
- **Deployment**: Vercel (`dallas-scout.vercel.app`) via GitHub (`github.com/royeliasaf/dallas-scout`)
- **Version control**: Git — always commit and push to deploy

## Folder structure
```
index.html    → homepage (city selector)
map.css       → global styles
map.js        → map/interaction logic
dallas/       → Dallas city guide content
```

## What it does
- Homepage lists cities, links to each city's guide
- Dallas is the only live city (Vol. 14, 98 spots)
- Other cities show "Coming soon" with a mailto link to notify Roy

## Key rules — read before touching anything
- **No npm, no build, no node_modules** — do not introduce a framework or package manager
- Keep it simple: HTML + CSS + JS only
- To add a new city, follow the pattern of the `dallas/` folder exactly
- To add spots, edit the Dallas data directly — no database, no CMS
- Push to main → Vercel auto-deploys instantly

## Deployment
```bash
git add .
git commit -m "your message"
git push
```
Live at: https://dallas-scout.vercel.app
GitHub: https://github.com/royeliasaf/dallas-scout
