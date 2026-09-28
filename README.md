# TheUrbanWaitlist

Pre-launch waitlist site for **TheUrbanNet** — a marketplace connecting people to local
independent service providers. The site explains the product, then collects early-interest
signups from two audiences: customers looking for services, and providers offering them.

Submissions are stored in Postgres and trigger a confirmation email via
[Resend](https://resend.com), through a small serverless API deployed alongside the static
site on Vercel.

Static HTML, CSS and vanilla JS on the frontend — **no build step, no framework.** The
backend is a couple of Vercel serverless functions under `api/`.

---

## Running it locally

The site now has a backend (`api/submit.js`), so a plain static server no longer exercises
the form's submit path — use the Vercel CLI instead, which serves the static pages **and**
runs the `api/` functions locally:

```
npm install
npm install -g vercel     # if you don't have it already
vercel link                # first time only, links this folder to the Vercel project
vercel env pull .env.development.local
vercel dev
```

`vercel dev` serves the whole site (static pages + `/api/submit`) on one local origin, which
is what the forms need — the JS calls `/api/submit` as a relative path, so it only works
when frontend and API share an origin.

To just browse the static pages without exercising form submission, `npx serve .` (or Live
Server) still works, but the forms will fail to submit — `/api/submit` doesn't exist on a
plain static server. Do not open the files via `file://` either way; asset paths are
relative (`../assets/…`) and the API call needs a real origin.

### Database setup (one-time)

The API expects a `signups` table. After the Vercel Postgres (Neon) integration is added to
the project (Vercel dashboard → Storage → Create Database → Postgres):

```
vercel env pull .env.development.local
npm run migrate
```

This runs `migrations/001_init.sql`, which is safe to re-run (`CREATE TABLE IF NOT EXISTS`).

### Environment variables

See `.env.example`. In summary:

| Variable | Where it comes from |
|---|---|
| `DATABASE_URL` | Set automatically by Vercel once the Postgres integration is added |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys |
| `RESEND_FROM_EMAIL` | Must be on a domain verified in Resend; `onboarding@resend.dev` works for testing but only delivers to the Resend account's own email address |

Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in the Vercel dashboard (Project → Settings →
Environment Variables) for the deployed site, and in `.env.development.local` for `vercel dev`.

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
├── additional images/   unused reference material, not linked by any page
├── api/submit.js    serverless function both forms POST to
├── lib/             validation, Postgres and Resend helpers used by api/submit.js
└── migrations/      SQL schema for the `signups` table
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

Both forms submit to **the same serverless function**, `api/submit.js`, as a relative path
so it only works when the frontend and API are served from the same origin (see
"Running it locally" above):

```js
const SUBMIT_URL = "/api/submit";
```

On submit the client:

1. Runs validation (`setCustomValidity` + native `checkValidity()`), bailing early on failure.
2. Builds a plain object from the form and adds a **`form_type`** field — `"customer"` or
   `"business"`. This is how `api/submit.js` tells the two submissions apart.
3. Collapses repeated field names (multi-select checkboxes) into one comma-joined string,
   so `service_interests` arrives as `"Beauty, Catering, Fitness"` rather than three values.
   Names ending in `[]` are normalised, e.g. `certifications[]` → `certifications`.
4. Adds a random **`submission_id`**, then `POST`s the object as JSON and waits for
   `{ "success": true }` before showing the success panel. A changed form field clears the
   stored `submission_id` and generates a new one on the next submit — so retrying a *lost
   response* reuses the same id (letting the server recognise and ignore the duplicate),
   while retrying with *different values* is treated as a new submission.

### Where the responses go

```
customer.html ─┐                          ┌─▶ Postgres `signups` table (form_type = 'customer' | 'business')
               ├─▶ POST /api/submit ───────┤
business.html ─┘                          └─▶ Resend confirmation email to the signer
```

`api/submit.js` (see `lib/validate.js`, `lib/db.js`, `lib/resend.js`,
`lib/emails/confirmation.js`):

1. Re-validates the payload server-side — the client's checks are not a security boundary.
2. Inserts one row into the `signups` table (`migrations/001_init.sql`). Form-specific
   fields live in a `details` JSONB column rather than as separate columns, since the two
   forms collect different fields and the columns would otherwise need a migration every
   time a question is added or changed.
3. In parallel, (a) forwards the submission to the existing **Google Apps Script**
   (`lib/googleSheet.js`) so the Google Sheet — and the Slides deck built from it — keep
   updating exactly as before, and (b) sends a confirmation email via Resend to the address
   the person submitted. The Apps Script receives the same urlencoded fields the forms used
   to send directly, so it needs no changes; its URL defaults to the original deployment and
   can be overridden with `GOOGLE_SCRIPT_URL`. **Both steps are best-effort:** if the row is
   saved but the Sheet forward or the email fails, the request still returns success — the
   signup is not lost — and the failure is recorded on the row (`sheet_sync_error` /
   `confirmation_email_error`) and logged for follow-up.

### Setting it up from scratch

1. Add the Vercel Postgres (Neon) integration to the Vercel project, then run the migration
   (see "Database setup" above).
2. Create a [Resend](https://resend.com) account, verify a sending domain (Dashboard →
   Domains → Add Domain, then add the DNS records it gives you), and create an API key.
3. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` (using an address on the verified domain) in
   the Vercel project's environment variables.

Until a domain is verified in Resend, submissions still save correctly, but confirmation
emails will fail to send (or only deliver to the Resend account's own email, if using the
`onboarding@resend.dev` sandbox sender) — see the best-effort behaviour above.

The API is reachable by anyone who can see the client-side JS, which is unavoidable for a
public form — `api/submit.js` treats every request as untrusted and does its own
validation, independent of what the browser already checked.

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
