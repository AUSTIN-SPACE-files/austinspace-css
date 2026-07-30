# AUSTIN_SPACE — Wave System Expansion: CC Brief

Approved live via DOM preview, 30 July 2026. Every value below was measured on the
live site at a 2545px client width, not derived.

---

## 0. Read this before touching a file

**PLAN FIRST.** Step 1 of every page section is grep-and-report. Do not edit until the
OLD strings are confirmed from the file. This brief specifies NEW values exactly; it
does NOT specify OLD strings, because they were never seen in the repo during the
session. Report raw grep output, not summaries.

**THE COUNTING RULE.** Every CSS change lands in BOTH `css/master-stylesheet.css` and
`css/master-stylesheet.panel.css`. Double every expected CSS grep count. Expect EXTRA
hits in `master-stylesheet.css` only, wherever the search term also appears in a
comment. `panel.css` carries ZERO comments and must stay that way.

**DECLARED IS NOT RENDERED.** `.as-hero` is `box-sizing: content-box` and footer strips
carry `border-bottom: 5px`. A declared `height: 130px` renders 135px. Every height in
this brief is the DECLARED value. Do not "correct" any figure to a rendered one.

**MIDS ARE SIZED BY RATIO, NOT PIXELS.** All mid strips are `aspect-ratio: 2880/226`,
which renders 200px at 2545px wide and 99px at 1265px. There is no pixel height on a
mid. The denominator is a ratio term.

**Other standing constraints.** ASCII-only CSS comments; comments go in
`master-stylesheet.css` only. No slash-form grid shorthand anywhere near this work.
`html/home.html`, NOT `index.html`.

**PASTE ORDER, per page:** `footer-injection.html` -> that page's HTML code block ->
`panel.css` replace-all. CSS last so nothing renders at the wrong size mid-sequence.
Hard-refresh incognito after each page.

---

## 1. The curve library

Geometry is REUSED across pages; def **ids remain per-page**, so the same `d` value is
duplicated under different ids. This keeps the existing one-def-per-strip convention.
No page uses the same curve twice.

### Bottom-edge family (ink above, troughs hang down into white)
Stroke derived from the clip verbatim: x100, box-closure segments stripped, Y nudged +1.

**botA** — 2 troughs
```
clip:   M0,0 L1,0 L1,0.45 C0.90,0.45 0.78,0.73 0.70,0.73 S0.50,0.37 0.42,0.37 S0.24,0.73 0.16,0.73 S0.05,0.42 0,0.42 Z
stroke: M100,46 C90,46 78,74 70,74 S50,38 42,38 S24,74 16,74 S5,43 0,43
```

**botB** — 3 troughs
```
clip:   M0,0 L1,0 L1,0.44 C0.94,0.44 0.89,0.74 0.83,0.74 S0.72,0.38 0.66,0.38 S0.53,0.74 0.47,0.74 S0.33,0.38 0.27,0.38 S0.17,0.74 0.11,0.74 S0.04,0.47 0,0.47 Z
stroke: M100,45 C94,45 89,75 83,75 S72,39 66,39 S53,75 47,75 S33,39 27,39 S17,75 11,75 S4,48 0,48
```

**botC** — 3 troughs, shallower (about only)
```
clip:   M0,0 L1,0 L1,0.46 C0.95,0.46 0.92,0.72 0.86,0.72 S0.74,0.36 0.68,0.36 S0.56,0.72 0.50,0.72 S0.36,0.36 0.30,0.36 S0.19,0.72 0.13,0.72 S0.05,0.44 0,0.44 Z
stroke: M100,47 C95,47 92,73 86,73 S74,37 68,37 S56,73 50,73 S36,37 30,37 S19,73 13,73 S5,45 0,45
```

### Inverted family (white above, peaks rise up; ink below)
Stroke: x100, box-closure stripped, Y nudged **-1**.

**invA** — 2 peaks
```
clip:   M0,0.30 C0.08,0.30 0.16,0.06 0.24,0.06 S0.44,0.34 0.52,0.34 S0.72,0.06 0.80,0.06 S0.94,0.28 1,0.28 L1,1 L0,1 Z
stroke: M0,29 C8,29 16,5 24,5 S44,33 52,33 S72,5 80,5 S94,27 100,27
```

**invB** — 3 peaks
```
clip:   M0,0.32 C0.06,0.32 0.11,0.07 0.17,0.07 S0.30,0.35 0.36,0.35 S0.49,0.07 0.55,0.07 S0.66,0.35 0.72,0.35 S0.82,0.07 0.88,0.07 S0.96,0.30 1,0.30 L1,1 L0,1 Z
stroke: M0,31 C6,31 11,6 17,6 S30,34 36,34 S49,6 55,6 S66,34 72,34 S82,6 88,6 S96,29 100,29
```

**invC** — 3 peaks, uneven widths
```
clip:   M0,0.30 C0.06,0.30 0.09,0.08 0.15,0.08 S0.24,0.36 0.30,0.36 S0.44,0.08 0.50,0.08 S0.65,0.36 0.71,0.36 S0.83,0.08 0.89,0.08 S0.96,0.26 1,0.26 L1,1 L0,1 Z
stroke: M0,29 C6,29 9,7 15,7 S24,35 30,35 S44,7 50,7 S65,35 71,35 S83,7 89,7 S96,25 100,25
```

**invD** — 2 peaks, phase-shifted off invA
```
clip:   M0,0.28 C0.10,0.28 0.22,0.08 0.30,0.08 S0.50,0.36 0.58,0.36 S0.76,0.08 0.84,0.08 S0.95,0.32 1,0.32 L1,1 L0,1 Z
stroke: M0,27 C10,27 22,7 30,7 S50,35 58,35 S76,7 84,7 S95,31 100,31
```

---

## 2. The mid-strip CSS idiom

Every NEW mid strip gets exactly this, nothing more. The base `.as-hero` already
supplies position, width, overflow, and the img/stroke rules.

```
.as-hero--{name} {
  aspect-ratio: 2880/226;
  background-color: var(--white);
  border-top: 0;
}
.as-hero--{name} .as-hero__img {
  clip-path: url(#wave-clip-{name});
  object-position: center {N}%;
}
```

`background-color: var(--white)` is correct for BOTH polarities — white is what shows
either side of the wave line in each case. Verified live.

### Markup

Copy an existing `.as-hero` block from the SAME page verbatim (for correct
`srcset`/`sizes`), then change only the modifier class, the `clip-path` reference and
the stroke `d`. Do not hand-author `srcset`.

```
<div class="as-hero as-hero--{name}">
  <img class="as-hero__img" ... >
  <svg class="as-hero__stroke" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <path fill="none" stroke="#000" stroke-width="5" vector-effect="non-scaling-stroke" d="{stroke}"/>
  </svg>
</div>
```

### Stroke matching

When editing an EXISTING stroke, match by its OLD `d` value, never by class name —
several pages carry more than one `.as-hero__stroke`.

---

## 3. Footer strips — all 13 pages

`height: 130px`. Twelve pages move from `102px`. Contact is ALREADY 130px: do not touch
it. Home additionally DROPS `aspect-ratio: 14.4/1` and gains `height: 130px`.

Four footers also change slice:

| Page | object-position |
|---|---|
| ddr | `center 88%` (was 30%) |
| austin-space | `center 90%` (was 50%) |
| gypsy-pistoleros | `center 12%` (was 70%) |
| custom-build | `center 44%` (was 100%) |

---

## 4. Per-page work

Insertion target means: insert the strip immediately BEFORE that element.

### 4.1 home — `html/home.html`

No new markup, no block move. `home-low-mid` already sits before `.as-casestudy`.

| Strip | Action |
|---|---|
| `home-high-mid` | `aspect-ratio: 2880/226`; curve -> **botB**; slice `center 55%` (was `0px 100%`) |
| `home-low-mid` | REMOVE `display: none`; `aspect-ratio: 2880/226`; curve -> **invA**; slice `center 78%` (was `0px 95%`) |
| `home-footer` | drop `aspect-ratio`; `height: 130px` |

Report where `display: none` on `home-low-mid` lives — it may be CSS or an inline style
in the page HTML.

Verified result: waves at 107 / 1460 / 4872 / 6231.

### 4.2 about — NEW `as-hero--about-mid`

Insert before `.as-about-work`. Curve **botC**. Slice `center 52%`. Footer 130px.
Verified: 107 / 2931 / 5681.

### 4.3 services hub — NEW `as-hero--services-hub-mid`

Insert before `.as-faq`. Curve **invB**. Slice `center 45%`. Footer 130px.
Verified: 107 / 3015 / 5048.

### 4.4 case-studies hub — NEW `as-hero--casestudies-hub-mid`

Insert before `.as-cs-hub-feature`. Curve **botA**. Slice `center 48%`. Footer 130px.
Verified: 107 / 2592 / 4897.

Name follows the FOOTER namespace (`casestudies-hub-*`), not the hero's
(`case-studies-*`). Deliberate.

### 4.5 site-refresh — NEW `as-hero--site-refresh-low-mid`

Insert before `.as-faq`. Curve **invD**. Slice `center 35%`. Footer 130px.
Existing `site-refresh-mid` unchanged. Verified: 107 / 1581 / 4025 / 6005.

### 4.6 support-retainer — NEW `as-hero--ongoing-support-low-mid`

Insert before `.as-faq`. Curve **invC**. Slice `center 63%`. Footer 130px.
Existing `ongoing-support-mid` unchanged. Verified: 107 / 1468 / 3936 / 5745.

Keep the `ongoing-support` namespace. The URL says `support-retainer`; the CSS
namespace does not follow the slug. Do not "correct" this.

### 4.7 terracotta — 3 NEW strips

| Name | Insert before | Curve | Slice |
|---|---|---|---|
| `cs-terracotta-high-mid` | `.as-cs-challenge` | botB | `center 38%` |
| `cs-terracotta-mid` | `.as-cs-gallery` | botA | `center 54%` |
| `cs-terracotta-low-mid` | `.as-faq` | invD | `center 69%` |

Footer 130px. Verified: 107 / 1473 / 3908 / 7464 / 9324.

### 4.8 ddr — 3 NEW strips

| Name | Insert before | Curve | Slice |
|---|---|---|---|
| `cs-ddr-high-mid` | `.as-cs-challenge` | botB | `center 21%` |
| `cs-ddr-mid` | `.as-cs-gallery` | botA | `center 36%` |
| `cs-ddr-low-mid` | `.as-faq` | invD | `center 51%` |

Footer 130px + slice `center 88%`. Verified: 107 / 1473 / 3721 / 7223 / 9166.

### 4.9 austin-space — 2 NEW strips

| Name | Insert before | Curve | Slice |
|---|---|---|---|
| `cs-austin-space-high-mid` | `.as-cs-challenge` | botA | `center 47%` |
| `cs-austin-space-low-mid` | `.as-faq` | invB | `center 66%` |

Footer 130px + slice `center 90%`. Verified: 107 / 1383 / 5126 / 7094.

Two strips not three: this page has no testimonial and no results section.

### 4.10 gypsy-pistoleros — 3 NEW strips

| Name | Insert before | Curve | Slice |
|---|---|---|---|
| `cs-gypsy-pistoleros-high-mid` | `.as-cs-challenge` | botB | `center 32%` |
| `cs-gypsy-pistoleros-mid` | `.as-cs-gallery` | botA | `center 50%` |
| `cs-gypsy-pistoleros-low-mid` | `.as-faq` | invD | `center 68%` |

Footer 130px + slice `center 12%`. Verified: 107 / 1459 / 3920 / 6623 / 8564.

### 4.11 one-page — geometry only, no new strips

| Strip | Action |
|---|---|
| `one-page-mid` | `aspect-ratio: 2880/226`; curve -> **botB**; slice `center 41%` (was `0px 100%`) |
| `one-page-low-mid` | `aspect-ratio: 2880/226`; slice `center 76%` (was 58%). Curve unchanged |
| `one-page-footer` | `height: 130px` |

Verified: 107 / 1532 / 3979 / 7208.

### 4.12 custom-build — geometry + one move

| Strip | Action |
|---|---|
| `custom-build-mid` | NO CHANGE. Already 2880/226 and `center 25%` |
| `custom-build-low-mid` | `aspect-ratio: 2880/226`; curve -> **botB**; MOVE to before `.as-svc-fit`; slice `center 62%` unchanged |
| `custom-build-footer` | `height: 130px`; slice `center 44%` (was 100%) |

Verified: 107 / 1473 / 3513 / 7798.

### 4.13 contact — FROZEN

No changes of any kind. Reference page.

---

## 5. Totals for audit

- **16 new strips** = 16 new clip defs + 16 new markup blocks + 32 new CSS rule pairs
  (doubled across both stylesheets)
- **1 strip unhidden** (`home-low-mid`)
- **5 strips resized** 9.6/1 -> 2880/226
- **4 curves redrawn** on existing strips: `home-high-mid`, `home-low-mid`,
  `one-page-mid`, `custom-build-low-mid`
- **1 strip moved** (`custom-build-low-mid`)
- **12 footers** to `height: 130px`; home also drops `aspect-ratio`
- **8 slices changed** on existing strips
- **Clip def count: 38 -> 54** in `footer-injection.html`

---

## 6. Verification after paste

1. Hard-refresh incognito. Cloudflare caches hard.
2. Chrome MCP: `location.reload(true)` + 900-1500ms wait BEFORE measuring. Do not trust
   a pre-bust reading.
3. `getComputedStyle` on live elements is the only ground truth — the Squarespace custom
   stylesheet is cross-origin, so `cssRules` is empty and `fetch()` is CORS-blocked.
4. To prove a paste landed where the change has no visual signal, build a SYNTHETIC
   element matching the FULL selector and read `getComputedStyle` on it. `decodedBodySize`
   is NOT reliable (gzip). A repo grep CANNOT detect a paste-time strip.
5. Per page, confirm: strip height 199-200px at 2545 wide (NOT 205 — borders must be 0),
   footer 135px rendered, and wave `y` positions matching the Verified figures above.

---

## 7. Rules the previews established, for the record

- Wave sits only at an ink/white boundary. Divider, never a splitter. No same-colour
  splits, no new idioms.
- Budget: count `round(page height / 2000)` +/-1, AND no gap between consecutive wave
  events above 50% of page height, with a +/-5% tolerance on both the ceiling and the
  1300px minimum clearance. Short pages are constrained by interval, tall pages by count.
- All arithmetic evaluated at **2545px** client width.
- Polarity is determined by which side is ink, never chosen.
- Last boundary before the footer strip stays bare.
- No wave on both edges of an ink band under 700px.
- Full width always; only the vertical slice varies.
- Slice register: 15pp separation between any two strips on a page, no exact sitewide
  duplicate. Mids avoid 0-10% only — below that the panorama sits at luminance 17-20
  against the ink band's 23 and merges into it.
- Placement is NOT reducible to a head-of-ink or foot-of-ink rule. Both are in use and
  both were chosen by eye during the previews.

### Panorama tonal profile (measured, luminance 0-255)

For the Phase 3 register pass. Source is 2500x1667.

| Band | L | Band | L |
|---|---|---|---|
| 0-10% | 17-20 | 50-60% | 47-51 |
| 10-25% | 30 | 60-70% | 49-54 |
| 25-40% | 36-40 | 70-80% | **97-122** |
| 40-50% | 50-51 | 80-100% | 71-95 |

---

## 8. Known open items, NOT in this brief

- `site-refresh` mid 55% vs footer 60%, and `support-retainer` mid 42% vs footer 40%:
  pre-existing 15pp register violations. Deferred to the Phase 3 register pass.
- `custom-build-mid` is the only high strip that is a 2-trough; every other is a
  3-trough. Left deliberately. One-line swap to botB if wanted.
- `custom-build` carries the site's largest gap at 4285 (riding the +5% tolerance).
  Adding a strip at the `.as-svc-bottom` -> `.as-faq--dark` boundary would give
  1366 / 2040 / 2492 / 1993 and make all three service pages structurally identical.
  Declined this session.
- `wave-clip-contact` (top hero) has uneven crests 0.72/0.77/0.79/0.76.
- 375px pass never done on contact or the editorial bands.
- `json/services/5-support.json:24` canonical points at a URL that 301s.
- Untracked `html/case-studies-terracotta-property - old copy.html` and stale
  `css/master-stylesheet-backup.css` both want binning.
