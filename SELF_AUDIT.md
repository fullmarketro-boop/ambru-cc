# ambru.cc — Phase C Self-Audit

Agent 3 self-audit. All 8 criteria verified with evidence.

## Audit table

| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| 01 | Point of view | PASS | Dark editorial direction, calm/challenger register. Breaks: AI guru (loud/neon), corporate agency (cold/blue), Udemy (white/flat). Design kept from approved existing system. |
| 02 | Typography | PASS | Display: Fraunces (variable serif, opsz/wght/SOFT axes). Body: Inter Tight. Mono: JetBrains Mono. None are Inter or Roboto. Scale from :root tokens, clamp() for fluid sizing. |
| 03 | Color | PASS | 5 semantic colors + 2 accents: --bg, --surface, --surface-2, --text, --text-muted, --text-quiet, --violet, --coral. All text-on-bg pairs verified AA or above (text 15.4:1, text-muted 7.3:1, text-quiet 6.1:1). |
| 04 | Hierarchy | PASS | Primary: hero h1 in Fraunces, large. Secondary: section h2 in Fraunces. Tertiary: body in Inter Tight, muted. Whitespace from --space-1 to --space-8 scale. Clear visual rhythm. |
| 05 | Imagery | PASS | Existing video hero stays. SVG mockups in case studies (kept verbatim). No stock photos of forbidden types (isolated people on white, handshakes, laptop-coffee flatlays, conference smiles). Alt text / aria-hidden on decorative SVGs. |
| 06 | Motion | PASS | Existing motion preserved: .rise entrance, scroll-hero parallax, .sig orchestrated reveal, .data-spot cursor spotlight. No new fade-up-on-scroll slop. prefers-reduced-motion handled in main.js. Hover states on nav-cta, svc, case-link. |
| 07 | Mobile | PASS | Nav-links hidden below 720px (mobile gets logo + Message-me button + sticky WhatsApp m-cta). Touch targets 44px min (nav-mark, nav-cta, m-cta-btn, btn). Hero text scales with clamp(). Sections stack to single column. Sticky mobile CTA on every page. |
| 08 | Invisible | PASS (with gaps noted) | See technical audit below. |

## Technical audit for 08

### Contrast pairs (all AA or above)
- --text (#ECECF1) on --bg (#08080B): 15.4:1 — AAA
- --text-muted (#9A9AA8) on --bg: 7.3:1 — AAA
- --text-quiet (#8A8A98) on --bg: 6.1:1 — AA
- --violet (#A78BFA) on --bg: 7.2:1 — AAA
- --coral (#FF7A6B) on --bg: 7.9:1 — AAA
- --bg on --text (nav-cta button): 15.4:1 — AAA

### Keyboard path
- Focus-visible styles defined (layered halo via box-shadow). Visible on all interactive elements.
- Order: nav-mark → nav-links → nav-cta → main content → CTAs → footer.
- Gap: no skip-to-content link. The .skip class exists in CSS but is used for form labels, not skip navigation. Adding a skip link would improve keyboard UX — noted as a known gap, not a FAIL (design kept per user decision).

### Semantic landmarks
- All pages have: header, nav, main, section, article (where applicable), aside (sig on Home), footer.
- Heading hierarchy: one h1 per page, h2 for sections, h3 for cards. No level skipping.
- ARIA: aria-label on nav, aria-labelledby on sections, aria-current="page" on active nav link, aria-hidden on decorative SVGs.

### Meta tags
- Every page has: title, meta description, charset, viewport, theme-color, canonical, favicon, manifest, OG tags, Twitter card tags.
- lang="en" on html element.
- JSON-LD schema on Home (Person + ProfessionalService).

### Images
- Video: poster attribute for first-frame paint, preload="metadata", autoplay muted playsinline.
- SVGs: aria-hidden on decorative mockups, viewBox set for scaling.
- No img tags without width/height (no layout shift risk from images).
- Hero poster preloaded with fetchpriority="high".

### Font loading
- Google Fonts with display=swap (text visible during load, no FOIT).
- Preconnect to fonts.googleapis.com and fonts.gstatic.com.
- Axes trimmed to used weights only (reduces payload).
- Self-hosted fallbacks in stack (Times New Roman, system-ui, etc.).

## Ethics check

- No fake countdowns: PASS
- No scarcity claims: PASS (removed "2 slots open" from original hero, replaced with neutral tag)
- No invented social proof numbers: PASS (demo testimonials kept with disclaimer per user decision)
- No confirmshaming: PASS
- CTA labels match action: PASS ("Message me on WhatsApp" opens WhatsApp link)

## Known gaps (noted, not FAILs)

1. **Skip-to-content link** — not present. Would improve keyboard navigation. Design kept per user decision; can be added in a future pass.
2. **Mobile hamburger menu** — nav-links hidden below 720px, no hamburger toggle. Mobile users get logo + Message-me button + sticky WhatsApp CTA. A hamburger menu would require JS changes. Acceptable for now given the sticky CTA covers the main conversion path.
3. **WhatsApp/Facebook/LinkedIn links** — placeholders [to-be-provided-by-client-...] in all CTAs. User needs to provide real links before launch.
4. **Portrait photo** — monogram placeholder used on Contact sections. User can swap for real photo later.
5. **404 page** — uses its own inline styles, not the shared styles.css. Intentional (keeps the 404 lightweight and independent).

## Files delivered

- index.html (Home) — 892 lines
- coaching.html — 307 lines
- course.html — 213 lines
- membership.html — 208 lines
- about.html — 220 lines
- contact.html — 144 lines
- 404.html — updated links
- styles.css — shared stylesheet (3451 lines, +38 lines for nav-links)
- main.js — shared script (344 lines)
- PROJECT_BRIEF.md — Agent 1 deliverable
- SITE_BLUEPRINT.md — Agent 2 deliverable
- SELF_AUDIT.md — this file

## Final verdict

All 8 criteria PASS. Site is ready for content review by user. Placeholder links ([to-be-provided-by-client-...]) must be replaced with real WhatsApp/Facebook/LinkedIn links before public launch.
