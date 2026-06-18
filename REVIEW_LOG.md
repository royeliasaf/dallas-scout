# Review Log

## 2026-05-20

### Content

**1. ✅ Stale "Last updated" dates** — [index.html:106](index.html#L106) says "May 5, 2026" and [dallas/index.html:91](dallas/index.html#L91) says "May 4, 2026". Today is May 20 — both are 15+ days old. These are hand-edited strings, so they'll keep rotting. Either delete the line, replace with a relative "Updated this month" string you only need to touch monthly, or drop the date in via a `<script>` tag pulling `document.lastModified` (good-enough proxy for a static site).

**2. ✅ Broken empty-state copy** — [dallas/app.js:233](dallas/app.js#L233) renders `No spots match "${q}". Try a different search.` But this branch also fires when filters return zero results with **no** search query active (e.g. flip on "Roy's Picks" + a category that has zero favs). User sees: `No spots match "". Try a different search.` Split the empty state: one message when `q` is empty ("No spots match these filters"), another when `q` is set.

### Design

**3. ✅ Missing focus-visible on filter and hint buttons** — `.cat-btn` ([dallas/style.css:163](dallas/style.css#L163)) and `.search-hints .hint` ([dallas/style.css:485](dallas/style.css#L485)) only define `:hover`. Tab through with a keyboard and you can't see which button is focused. The city cards on the homepage do this correctly ([map.css:414-417](map.css#L414)). Add `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` to both selectors.

### Structure

**4. ✅ Featured cards on homepage are hardcoded** — [index.html:54-68](index.html#L54) duplicates spot data (Mister O1, Velvet Taco, Shoyo) that already lives in [spots.js](dallas/spots.js). If a featured spot closes, raises prices, or you edit its note, the homepage silently goes stale. Render featured cards from `SPOTS` at runtime — either tag spots with `featured: true` in the data, or pull the top 3 by rating in chosen categories. The homepage already loads no JS for this, so it's a small client-render addition or a manual script that rewrites the section before deploy.

**5. ✅ Hardcoded spot count + Vol number scattered across HTML** — "98 spots" appears in [index.html:51](index.html#L51), [index.html:93](index.html#L93), [dallas/index.html:49](dallas/index.html#L49). "Vol. 14" appears in [index.html:93](index.html#L93) and [dallas/index.html:42](dallas/index.html#L42). Add a spot, you must edit four files. The Dallas page already overwrites `#total-count` from `SPOTS.length` ([app.js:217](dallas/app.js#L217)) — do the same for the homepage card count, and drop the redundant copies.

### Performance

**6. ✅ Google Fonts ships unused weights** — [index.html:25](index.html#L25) and [dallas/index.html:28](dallas/index.html#L28) request Fraunces in weights 300, 400, 600, 800, 900 plus italic 300, and JetBrains Mono in 400, 500, 700. CSS actually uses Fraunces 400, 600, 900 and Mono 400, 700 (grep `font-weight` in both CSS files). You're pulling down ~3 extra font files per page load for nothing. Trim the URL to the weights you actually reference.

### Security

**7. ✅ XSS via search query in empty state** — [dallas/app.js:233](dallas/app.js#L233): `main.innerHTML = \`<div class="empty">No spots match "${q}"...</div>\`;` interpolates raw user input into `innerHTML`. Search `<img src=x onerror=alert(1)>` and an alert fires. The site has no auth and no CSP, so blast radius is tiny — but it's a real injection and trivial to fix. Replace with `textContent` on a static `<div>`, or HTML-escape `q` before interpolating. (Note: [app.js:131-133](dallas/app.js#L131) builds a regex against `escapeRegex(query)` and replaces with `<mark>$1</mark>` against trusted spot text, so the `highlight()` path is safe — only the empty-state branch is exposed.)

### Mobile

**8. ✅ Search hint buttons are unhittable on touch** — [dallas/style.css:485-501](dallas/style.css#L485). `.search-hints .hint` has `padding: 2px 4px` at 10px font, yielding a ~14px tall tap target. WCAG 2.5.8 minimum is 24px, Apple HIG recommends 44px. On a phone these "Try: knox date omakase 3am walking" pills are missable — you hit the spaces between or the wrong one. Bump to `padding: 8px 10px`, give the row `gap: 6px`, and either drop them on `< 600px` or give the row more vertical breathing room.

## 2026-05-21

### Content

**1. ✅ Missing `og:image` / `twitter:image` on both pages** — [index.html:9-17](index.html#L9) and [dallas/index.html:9-19](dallas/index.html#L9) declare a Twitter `summary_large_image` card and full Open Graph metadata, but no image URL anywhere (`grep -E "og:image|twitter:image"` returns empty). Share the link in iMessage, WhatsApp, Slack, or X and the preview falls back to nothing or a tiny favicon — undercuts the whole "polished masthead" vibe. Drop a 1200×630 PNG into the repo (or generate one from the homepage hero) and add `<meta property="og:image" content="https://dallas-scout.vercel.app/og.png">` + `<meta name="twitter:image" ...>` to both heads.

**2. ✅ Roy-specific copy is leaking into public-facing notes** — At least 9 spot notes say "Walking distance from your place" ([spots.js:14, 20, 34, 94, 110, 129](dallas/spots.js#L14)), plus "Where you cut your hair" (Mr. Winston's, [spots.js:98](dallas/spots.js#L98)), "Your favorite" (Buzz & Bustle, [spots.js:71](dallas/spots.js#L71)), "Closest Chipotle to you" ([spots.js:66](dallas/spots.js#L66)), "Your nearby Starbucks" ([spots.js:79](dallas/spots.js#L79)). And "Instagrammy if she's into that" (Hampton Social, [spots.js:35](dallas/spots.js#L35)) assumes a male reader bringing a date. A visitor reading this site has no idea where "your place" is — replace with the actual anchor ("5-min walk from Knox" / "5-min walk from Highland Park"). The CLAUDE.md positions this as a city guide for everyone, not a private list — copy should match.

### Design

**3. ✅ "Coming soon" city dots are unlabeled at tablet sizes** — [map.css:318](map.css#L318): `#us-map .city.soon .label { opacity: 0; }`, only overridden by `@media (max-width: 600px)` at [map.css:514](map.css#L514). Between 601px and ~1024px (iPad portrait, landscape phones), users see six unlabeled grey dots with no way to know which is Houston vs. San Antonio — and hover doesn't fire on touch tablets. The legend says "live/coming soon" but doesn't identify dots. Either show labels always, or extend the override to `< 1024px`.

**4. ✅ "Want this? Tell Roy →" CTA is invisible on touch** — [map.css:451-457](map.css#L451): `.city-card.soon .meta-cta { display: none; }` and `.city-card.soon:hover .meta-cta { display: inline; }`. Phones and tablets have no hover, so users only ever see "TX · Coming soon" — they don't realize the card is a tappable mailto. The whole card *is* the link, but the visible CTA never appears. Either always render `.meta-cta` (smaller, secondary) underneath `.meta-soon`, or scope the swap with `@media (hover: hover)` and show both lines stacked on touch.

### Structure

**5. ✅ Six homepage "coming soon" city cards are hand-typed mailto links** — [index.html:80-85](index.html#L80) duplicates `Austin / Houston / San Antonio / New York / Los Angeles / Chicago` as six near-identical `<a class="city-card soon">` blocks, each with a hardcoded `mailto:` subject and body. [map.js:1-9](map.js#L1) already defines `cities[]`, and [map.js:16-20](map.js#L16) already builds `notifyHref(cityName)`. Render the whole `.city-row` (including the live Dallas card) from `cities` at runtime — same fix you already applied to featured cards. Adding/removing a city becomes a one-line edit instead of three (HTML + map.js + the SVG dot which is already data-driven).

**6. ✅ Two near-identical `last-updated` IIFEs across both pages** — [index.html:125-129](index.html#L125) and [dallas/index.html:101-108](dallas/index.html#L101) inline the same `new Date(document.lastModified).toLocaleDateString(...)` block. Extract a 5-line `formatLastUpdated(elId)` helper into `map.js` (or a tiny new `shared.js`) and call it once per page. Tiny, but it's the exact "fix it twice" pattern that produced stale dates the previous review caught.

### Performance

**7. ⚠️ FINDING WAS WRONG — pinned version instead** — Original claim was that `states-10m.json` is ~1.2MB and a 20m version would save ~1MB. Both wrong: the file is **114KB raw / ~36KB gzip**, and us-atlas v3 only ships 10m resolution. While confirming, also discovered that `us-atlas@3` (no specific version) no longer resolves on jsdelivr ("Couldn't find version 3 for us-atlas. Make sure you use a specific version number"). So the actual fix was pinning to `us-atlas@3.0.1` in [map.js:23](map.js#L23) — which also addresses the same supply-chain integrity concern as #8. No perf gain.

### Security

**8. ✅ D3 + topojson loaded from jsdelivr without SRI hashes** — [index.html:97-98](index.html#L97): `<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>` and the topojson tag both lack `integrity=` and `crossorigin="anonymous"`. If jsdelivr ever served a tampered build (or you got pinned to a compromised version), arbitrary JS would execute on every visitor. No auth surface here so blast radius is small, but the fix is one attribute per tag — generate the hashes with `curl -s <url> | openssl dgst -sha384 -binary | openssl base64 -A` and add `integrity="sha384-..."`. Pin the version while you're at it (`d3@7.9.0` instead of `d3@7`) so the hash stays stable.

### Mobile

(Skipped — addresses on cards still nowrap-with-ellipsis on narrow phones, but with 8 items already listed this falls under the cap. Worth a future-review flag: [dallas/style.css:366-372](dallas/style.css#L366) `.address { white-space: nowrap; text-overflow: ellipsis }` truncates "Inside The Adolphus Hotel" → "Inside The Ad…" on a 360px viewport.)

## 2026-05-25

### Content

**1. ✅ Roy-specific copy still leaking after the 5/21 "✅" fix** — Two notes were missed when item #2 from 2026-05-21 was marked resolved. [spots.js:104](dallas/spots.js#L104) Trader Joe's: `"Your go-to. 5 min from you."` plus tag `"5 min away"` — both still anchored to Roy's apartment, meaningless to a visitor. [spots.js:117](dallas/spots.js#L117) Highland Park ER: `"Save in your phone."` — direct second-person ask. Replace TJ's note with something like `"Knox/Henderson location. Limited but curated."` and drop the `5 min away` tag in favor of `"Knox"`. For the ER, just delete the "Save in your phone" sentence — the rest of the note stands on its own.

**2. ✅ `og:image` dimensions don't match the card type** — [og.png](og.png) is actually **1200×1200** (verified via `sips`), but [index.html:14-16](index.html#L14) declares `og:image:width 1200` / `og:image:height 1200` *and* `twitter:card: summary_large_image` ([index.html:19](index.html#L19)). Twitter/X expects `summary_large_image` to be 1.91:1 (e.g. 1200×630) and will center-crop the square — top and bottom of the artwork get chopped on the timeline. iMessage and WhatsApp tend to letterbox. Same mismatch on [dallas/index.html:15-17, 21](dallas/index.html#L15). Two fixes: either re-export `og.png` at 1200×630 (and update the height meta), or keep the square and switch `twitter:card` to `summary` (smaller thumbnail, but no crop). The square works for LinkedIn — but Twitter is the dominant share surface and gets it wrong today.

### Design

**3. ✅ Search hints row reads as one long string of letters, not 5 buttons** — [dallas/style.css:479-501](dallas/style.css#L479). `.search-hints` is 10px JetBrains Mono with `letter-spacing: 0.1em`, gap `6px`, hint padding `8px 12px`. The inter-letter gap inside a hint (`0.1em` ≈ 1px) is visually close to the inter-hint gap. Scanning "knox date omakase 3am walking" your eye doesn't reliably parse the boundaries — it looks like a wide-tracked word salad with weak frames around each pill. Bump `.search-hints { gap: 10px }`, drop hint `letter-spacing` to `0.05em` (or 0), or give hints a tinted background (`background: var(--bg-2)`) so the boundaries pop without relying on the 1px `var(--rule)` border.

**4. ✅ Empty filters state has no recovery action** — [dallas/app.js:234](dallas/app.js#L234) renders `"No spots match these filters. Try clearing one."` as plain text. The user has to scroll back up to the filter row and figure out which to deactivate. Since `clear-filters` already exists ([dallas/index.html:62](dallas/index.html#L62)) and is visible at the top, drop a duplicate inline button into the empty state: `<button class="clear-filters" data-clear>× Clear all filters</button>` and bind it in [app.js:292-302](dallas/app.js#L292). One click, recovered. (The search empty state has the same gap, but there the user can self-recover by editing the input — the filter case is worse because the controls are off-screen on mobile.)

### Structure

**5. ✅ Search hints are hand-typed 5× in HTML** — [dallas/index.html:88](dallas/index.html#L88) inlines 5 `<button class="hint" data-q="..." aria-label="...">` blocks. Same "fix it twice" pattern as #5 and #6 from 2026-05-21. Add `const SEARCH_HINTS = [{q:'knox',label:'knox'}, {q:'date',label:'date'}, {q:'omakase',label:'omakase'}, {q:'3am',label:'spots open until 3am'}, {q:'walking',label:'walking distance'}]` (in [spots.js](dallas/spots.js) or [app.js](dallas/app.js)) and render the row in `bindSearch()` or a new `renderSearchHints()`. The binding loop at [app.js:253-262](dallas/app.js#L253) already uses `querySelectorAll` — it'll keep working unchanged.

**6. ✅ `FEATURED` keys spots by name string, fails silently if a name changes** — [spots.js:160-164](dallas/spots.js#L160) lists featured spots by `name: "Mister O1 Extraordinary Pizza"`, then [index.html:106](index.html#L106) does `SPOTS.find(s => s.name === f.name)` and returns `''` if no match. Rename a spot in `SPOTS` (e.g. add a location suffix like you did for `"Mi Cocina (Uptown)"` or `"Chipotle (Knox/McKinney)"`) and the featured card silently disappears with no console warning, no visible error — just a shorter homepage row. Add a stable `id` field on each spot (`id: 'mister-o1'`) and key `FEATURED` by id. At minimum, `console.warn` when `find()` returns undefined so you catch the regression on the next deploy.

### Performance

**7. ✅ `og.png` is 869 KB — overweight for a social preview** — Verified: 1200×1200 PNG, 869 KB on disk. Social platforms (iMessage, WhatsApp, Slack, LinkedIn) refetch the OG image on every share-link unfurl until cached, and many don't cache for long. A 1200×1200 PNG at this content density compresses to ~80-180 KB via squoosh.app or tinypng without visible quality loss — that's a 4-10× reduction on every cold unfurl. Also: [og.svg](og.svg) (2.2 KB) sits next to the PNG but isn't referenced anywhere. Either remove it, or — if the artwork is vector-friendly — render the PNG from the SVG at the right dimensions for #2 above and ship a much smaller file in one move.

### Mobile

**8. ✅ `.section-desc { display: none }` on mobile strips the spot count too** — [dallas/style.css:426](dallas/style.css#L426) hides the entire `.section-desc` span below 600px. But that span carries two pieces of info, concatenated in [app.js:195](dallas/app.js#L195): the category description (`"Pasta + Italian"`) *and* the spot count (`"· 5 spots"`). Desktop sees `№ 01 · Italian · Pasta + Italian · 5 spots`. Mobile sees `№ 01 · Italian` with no count anywhere — the only count on the page is the global `#total-count` in the header. On a phone where the user is filter-stacking, per-section counts are useful breadcrumbs. Split the render: emit count and description as two separate spans, hide only `.section-desc-text` on mobile, keep `.section-count` visible.

### Security

(Skipped — the items from the prior two reviews closed out the genuine surface area: SRI on the CDN scripts, XSS on the search-query interpolation, and the version pin on `us-atlas`. Nothing new worth flagging this pass.)

## 2026-06-08

### Content

**1. ✅ "In Dallas this week" promises rotation that never happens** — [index.html:56](index.html#L56) labeled the featured row "In Dallas this week", but `FEATURED` ([spots.js:168](dallas/spots.js#L168)) is a static three-item list (Mister O1 / Velvet Taco / Shoyo) with no day- or week-based logic anywhere. A visitor who returns next week sees the identical "this week" picks — the copy makes a freshness claim the code doesn't back. **Fix applied:** renamed to "Featured in Dallas" (honest, no implied cadence). If you want real rotation later, seed `FEATURED` selection from a larger pool by week-of-year.

### Design

**2. ✅ No `apple-touch-icon` — home-screen / bookmark icon was a blank fallback** — Both pages declared only the tiny inline-SVG `rel="icon"` (cream square + red dot) at [index.html:27](index.html#L27) / [dallas/index.html:30](dallas/index.html#L30) and no `apple-touch-icon`. Add the site to an iOS/Android home screen, pin a tab, or share to an app that uses the touch icon, and you got a blurry auto-generated glyph — undercuts the "polished masthead" identity the rest of the site works for. **Fix applied:** generated `apple-touch-icon.png` (180×180, 26 KB) from the existing `icon.png` and added `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` to both heads.

**3. ✅ Map's `aria-label` instructed an action screen-reader/keyboard users can't perform** — [index.html:68](index.html#L68) labeled the SVG `"Map of the United States. Click Dallas to enter Dallas Scout."` But the city `<g>` nodes ([map.js:94](map.js#L94)) are click-only — not focusable, no `role`, no key handler — so a keyboard or AT user was told to "click Dallas" with no way to do it. **Fix applied:** reworded to `"Map of the United States showing Scout cities. Dallas is live; the city list below has the same links."` — it now points AT users to the real `<a>` city cards below instead of promising a dead interaction. (Full keyboard-focusable dots were intentionally not added: the cards and featured links already cover every destination, so the map stays decorative-redundant.)

### Structure

**4. ✅ Homepage `#live-count` was hardcoded `1`** — [index.html:50](index.html#L50): `<strong id="live-count">1</strong>`, and `map.js` never updated it. The `cities[]` array ([map.js:1-9](map.js#L1)) already carries each city's `status`. Promote a second city to `status: 'live'` and the headline stat silently keeps saying "1" — the same "fix it twice" pattern caught for city cards (5/21 #5), featured cards (5/20 #4), and the spot count (5/20 #5). **Fix applied:** `map.js` now sets `live-count` from `cities.filter(c => c.status === 'live').length` right after `renderCityCards()`.

### Performance

**5. ✅ `icon.png` is 2.3 MB (2048×2048), untracked, and referenced nowhere** — `grep -rn "icon.png"` across all HTML/JS/JSON returns nothing; it's pure dead weight. The deploy flow in CLAUDE.md is literally `git add .`, so the next push would commit 2.3 MB of unused PNG into the repo and ship it to Vercel. **Resolved (2026-06-15):** added `icon.png` to `.gitignore` so the next `git add .` no longer stages it — keeps the local source around (it generated the 26 KB `apple-touch-icon.png`) without shipping the bytes. Reversible: delete the `.gitignore` line if the source is ever needed in-repo.

### Security

**6. ✅ Third-party `roy-analytics.vercel.app/t.js` loaded with no integrity check** — [index.html:124](index.html#L124) and [dallas/index.html:113](dallas/index.html#L113) loaded `<script async src="https://roy-analytics.vercel.app/t.js">` with full page privileges and no `integrity=`/SRI. The 5/21 review added SRI hashes to the d3/topojson CDN tags but this analytics script — on a separate domain — was never covered. If that Vercel project/domain were ever taken over or its deploy compromised, arbitrary JS would run on every visitor. **Resolved (2026-06-15) — option (b):** self-hosted the script as [/t.js](t.js) in this repo (1.3 KB, byte-for-byte copy of the served file) and repointed both `<script>` tags to `src="/t.js"`. The collector endpoint (`POST roy-analytics.vercel.app/api/track`) is unchanged — analytics keep flowing — but the executable code is now inside the same trust boundary as the rest of the site, so a compromise of the analytics deploy no longer injects code here. Updated the script's fallback `data-site` selector from `src*="roy-analytics.vercel.app/t.js"` to `src$="/t.js"` to match the new path (`document.currentScript` already covers the primary path).

### Mobile

**7. ✅ Masthead meta-line broke mid-word below ~375px** — [dallas/index.html:43-49](dallas/index.html#L43) renders `← All cities · Vol. 14 · Highland Park · 75205` in a `.meta-line` that was `display:flex; flex-wrap:nowrap`. At 320px the row didn't overflow (good) but each text node wrapped *inside* its flex item, producing a ragged "← ALL / CITIES … VOL. / 14" stack (verified in browser at 320px). **Fix applied:** added `flex-wrap: wrap` + `gap: 8px 16px` to `.meta-line` and `white-space: nowrap` to its children in both [map.css:54](map.css#L54) and [dallas/style.css:54](dallas/style.css#L54); items now wrap as whole units (`← ALL CITIES · VOL. 14 ·` / `HIGHLAND PARK · 75205`).

