# TheUrbanWaitlist

Pre-launch waitlist site for **TheUrbanNet** — a marketplace connecting people to local
independent service providers. The site explains the product, then collects early-interest
signups from two audiences: customers looking for services, and providers offering them.

Submissions land in a Google Sheet via Apps Script, and the same script keeps a Google
Slides deck in sync so the team can read the results as a summary rather than raw rows.

Static HTML, CSS and vanilla JS. **No build step, no framework, no dependencies.**

---

## Running it locally

Open `LandingPage/waitlist.html` with any static server — VS Code's Live Server extension
is what the project was developed against. From the repo root:

```
npx serve .      # or: python -m http.server, or Live Server
```

Do not open the files via `file://`. Asset paths are relative (`../assets/…`) and the form
POST needs a real origin.

`package.json` carries no dependencies or scripts; it exists only for repo metadata.

---

## Structure

```
.
├── LandingPage/     waitlist.html + style.css   ← main page, entry point
├── RoleSelection/   roles.html                  ← "customer or provider?" fork
├── CustomerForm/    customer.html + customer.js
├── BusinessForm/    business.html + business.js
├── CookiePolicy/  PrivacyPolicy/  TermsOfService/
├── assets/          images shared by every page
└── additional images/   unused reference material, not linked by any page
```

Each folder owns its own stylesheet. `LandingPage/style.css` is the largest and the only
one with the full responsive system described below.

Folder names are **case-sensitive on deployment** even though Windows ignores case. Pages
link to `../RoleSelection/…` with a capital R, so the folder must stay spelled that way.

---

## How the waitlist works

The user journey is three pages:

```
waitlist.html  ──"Join The Waitlist"──▶  roles.html  ──▶  customer.html
                                                     └──▶  business.html
```

Navigation between them is plain `window.location.href` in inline `<script>` blocks.

Both forms submit to **the same Google Apps Script web app**, which appends a row to a
Google Sheet. The endpoint is hard-coded near the top of `customer.js` and `business.js`:

```js
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby…/exec";
```

On submit the client:

1. Runs validation (`setCustomValidity` + native `checkValidity()`), bailing early on failure.
2. Builds a `URLSearchParams` body from the form and adds a **`form_type`** field —
   `"customer"` or `"business"`. This is how the Apps Script tells the two submissions apart.
3. Collapses repeated field names (multi-select checkboxes) into one comma-joined string,
   so `service_interests` arrives as `"Beauty, Catering, Fitness"` rather than three rows.
   Names ending in `[]` are normalised, e.g. `certifications[]` → `certifications`.
4. `POST`s with `mode: "no-cors"`, then swaps the form for the success panel.

### Where the responses go

```
customer.html ─┐                                      ┌─▶ Customers tab  ─┐
               ├─▶ Apps Script doPost() ─▶ Sheet ──────┤                   ├─▶ Slides deck
business.html ─┘                                      └─▶ Businesses tab ─┘
                                                         every 5 min ─────┘
```

`doPost()` routes on `form_type` and appends each row to a **separate tab per audience**,
so customer and provider responses never share a sheet.

The same Apps Script project also maintains a **Google Slides deck** summarising the
responses, so the team can see signup trends and totals without reading the spreadsheet.
A time-driven trigger runs `runFullWaitlistAutomation()` every five minutes to rebuild the
deck from the Sheet — so the deck lags a new signup by up to five minutes.

That trigger is installed by running `updateWaitlistSlides()` once from the Apps Script
editor. **A fresh deployment has no trigger until you do**, and the deck will silently
never update.

### What you need to change the destination

The Apps Script, Sheet and Slides deck all live in TheUrbanNet's Google account — **repo
access alone is not enough to see submissions.** To point the forms somewhere else:

1. Create a Sheet with one tab per audience, and a Slides deck for the summary.
2. Deploy an Apps Script web app with `doPost(e)` reading `e.parameter` and routing on
   `form_type`, executing as yourself, with access set to *Anyone*.
3. Replace `GOOGLE_SCRIPT_URL` in **both** `customer.js` and `business.js`.
4. Run `updateWaitlistSlides()` once to install the five-minute trigger.

The Apps Script itself is not version-controlled in this repo — it is edited in the Apps
Script editor. Worth exporting a copy (via `clasp` or by hand) if you need its history.

> **Known limitation.** `mode: "no-cors"` makes the response opaque, so the client cannot
> read the status code. The success screen shows whenever the request doesn't throw — a
> server-side error still looks like success to the user. Moving to a CORS-enabled endpoint
> would let this be handled properly.

The endpoint is visible in client-side JS. That is unavoidable for a static site, so the
Apps Script must treat every submission as untrusted and do its own validation.

---

## Form conventions

Both forms share the same patterns, driven by markup rather than JS:

| Pattern | How it works |
|---|---|
| Checkbox limits | `data-min` / `data-max` on `.checkbox-question` |
| "Other" text input | `.other-option` checkbox reveals `.other-input-group` and makes it required |
| UK postcode | Reformatted on `blur` to `OUTWARD INWARD` (e.g. `sw1a1aa` → `SW1A 1AA`) |

Adding a question is usually markup-only — reuse `.checkbox-question` and the JS picks it up.

---

## CSS conventions (`LandingPage/style.css`)

**Mobile first.** Base styles target the smallest screen; `clamp()` does the smooth scaling.
Media queries are reserved for layout changes `clamp()` cannot express:

- `48rem` / 768px — tablet
- `64rem` / 1024px — desktop

**Two things to know before editing:**

1. The file uses **native CSS nesting**, which expands to deep descendant selectors. A flat
   override inside a media query can silently lose on specificity no matter where it sits in
   the file. Match the nested rule's selector depth — e.g. use
   `.site-footer .footer-container .footer-bottom`, not `.site-footer .footer-bottom`.
2. **The desktop layout is the reference design and should not drift.** Several sections
   (service cards, both UVP blocks) use a completely different layout below `64rem` and
   restore the original desktop rules inside the desktop media query.

Other details: the service-category cards auto-flip on a timer below `64rem` because touch
devices have no `:hover`; the hero swaps to a portrait crop via `<picture>`; `body` uses
`overflow-x: clip` (not `hidden`) so the sticky navbar keeps working.

---

## Assets

Everything lives in `assets/` and is referenced from each page as `../assets/…`.

Four images are still 2 MB+ (`hero-image.png`, `hero-image_phone.png`, `UVP1.png`,
`Fitness.png`). Converting them to WebP — as `beauty`, `fashion` and `home` already are —
is the single biggest page-weight win available.
