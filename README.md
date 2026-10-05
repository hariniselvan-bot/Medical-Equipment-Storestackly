# STACKLY — Premium Medical Equipment Website

A high-end, multi-page marketing + commerce experience for a fictional medical
technology company, built with **pure HTML5 / CSS3 / vanilla JavaScript** —
no frameworks, no jQuery, no build step.

## Quick start

Open `index.html` through any static server:

```bash
# from the project root
python3 -m http.server 8080
# → http://localhost:8080
```

(A server is recommended over `file://` so that session storage, fonts and
lazy loading behave exactly as in production.)

## Pages

| File                    | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `index.html`            | Homepage — 12 sections, pinned horizontal showcase |
| `about.html`            | Story, mission, certifications, team, timeline     |
| `service.html`          | Six services + process timeline                    |
| `blog.html`             | Featured post, filters, search, pagination         |
| `pricing.html`          | Service plans, comparison table, pricing FAQ       |
| `faq.html`              | Categorized animated accordion                     |
| `contact.html`          | Contact cards + validated form (front-end only)    |
| `login.html`            | Split-screen auth, role selector (User / Admin)    |
| `register.html`         | Registration with password-strength meter          |
| `dashboard.html`        | Customer portal (orders, fleet health, tickets)    |
| `seller-dashboard.html` | Vendor center (canvas sales chart, inventory)      |
| `404.html`              | Medical-themed not-found page (`history.back()`)   |

Demo routing: login as **User** → `dashboard.html`, as **Admin** →
`seller-dashboard.html`. No data leaves the browser anywhere in the site.

## Structure

```
├── index.html, about.html, … (12 pages)
├── css/   style · responsive · animations · dashboard · auth
├── js/    preloader · header · animations · main · components · auth · dashboard
├── img/   hero · products · categories · services · blog · team · backgrounds
│          (all WebP, every file < 100 KB, width/height + lazy loading)
└── svg/   logo.svg (+ inline SVG icon system)
```

## Technology

- **Animations:** GSAP 3 + ScrollTrigger (CDN), AOS, Intersection Observer,
  CSS keyframes, animated SVG (ECG pulse lines, preloader).
- **Preloader:** logo reveal → ECG draw → 0–100% counter → 12-column wipe.
  Runs once per browser session.
- **Images:** original AI-generated product photography plus free-license
  (Pexels) photography, all converted to optimized WebP < 100 KB.
- **Fonts:** Sora (display), Inter (body), IBM Plex Mono (technical labels).

## Notes

- Links without a real destination intentionally route to the custom `404.html`.
- The contact / auth / dashboard forms are front-end demos; nothing is
  transmitted or stored.
- Honors `prefers-reduced-motion`.
