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

## 5. Shipped state

All 13 pages complete and verified live. Contact was frozen and received only a
stroke-colour change.

- **17 new strips** placed, plus 1 unhidden (`home-low-mid`)
- **5 strips resized** from `2880 / 300` to `2880 / 226`
- **4 curves redrawn** on existing strips: `home-high-mid`, `home-low-mid`,
  `one-page-mid`, `custom-build-low-mid`
- **1 strip moved** (`custom-build-low-mid`, to before `.as-svc-fit`)
- **13 footers** unified on `height: 130px`
- **8 slices** repositioned during the build, **2 more** in the Phase 3 register pass,
  plus **1** in the custom-build fifth-strip pass
- **Clip def count 38 -> 55**
- **52 strips total** across the 13 content pages, plus 3 policy-page heroes

Wave count per page against `round(height / 2000)` +/-1:

| Page | Waves | Rule | |
|---|---|---|---|
| home | 4 | 3 | within +/-1 |
| about | 3 | 3 | exact |
| services hub | 3 | 3 | exact |
| cs hub | 3 | 3 | exact |
| site-refresh | 4 | 3 | within +/-1 |
| support | 4 | 3 | within +/-1 |
| one-page | 4 | 4 | exact |
| custom-build | 5 | 4 | within +/-1 |
| terracotta | 5 | 5 | exact |
| ddr | 5 | 5 | exact |
| austin-space | 4 | 4 | exact |
| gypsy-pistoleros | 5 | 5 | exact |
| contact | 3 | 2 | frozen |

### Counting rules for any future audit

**Count strips by CLASS NAME, not by grep pattern.** The 8 mids added in section 4
are split across two CSS conventions: single-line (home, about, both hubs, all
four case studies) and multi-line (site-refresh, support, matching their existing
`-mid` siblings). A pattern keyed to either shape silently misses the other.
`aspect-ratio: 2880 / 226` catches both.

**custom-build is the only page whose mids span both conventions.** `custom-build-mid`
and `custom-build-low-mid` are multi-line; `custom-build-faq-mid`, added in the
fifth-strip pass, is single-line. Every other page's mids sit wholly in one shape, so
custom-build is the one page a convention-keyed count gets partially right and
therefore silently wrong.

**Inventory curves by DEF ID, never by `d` value.** Geometry is reused, so `d`
values are duplicated across up to six defs. Current multiplicity:

| Curve | Defs |
|---|---|
| botB | 6 |
| botA | 5 |
| invD | 4 |
| invB | 2 |
| invC | 2 |

**Stroke `d` values exist in two spellings.** Coordinate form was matched per
page and per family, so the same curve appears as both `M100,45 C94,45...` and
`M100 45 C94 45...`. The two are distinct byte strings, so a grep for one form
finds only some of the occurrences. Not normalised, deliberately — see §8.

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

## 7. Rules as they actually stand

Amended during the build. Where a rule was retracted, the reason is recorded so
it does not get reinvented.

### Placement

1. **A wave sits only at an ink/white boundary.** Divider, never a splitter. No
   same-colour splits. No new idioms.
2. **Budget, two tests, both apply.** Count `round(page height / 2000)` with a
   +/-1 tolerance, AND no gap between consecutive wave events above 50% of page
   height. Short pages are constrained by interval; tall pages by count. On tall
   pages the count test binds and the interval test is slack; on short pages the
   reverse.
3. **Tolerances: +5% on the interval ceiling, -5% on the 1300px minimum
   clearance.** Both were added because real pages failed by 0.4% to 3.6% and
   the strictly-legal alternative broke a harder rule. Two pages ride them:
   austin-space at 1276px clearance, custom-build at a 4285px gap.
4. **The last boundary before the footer strip stays bare.**
5. **No wave on both edges of an ink band under 700px.**
6. **Polarity is determined, not chosen.** Ink above means bottom-edge; white
   above means inverted.
7. **All arithmetic is evaluated at 2545px client width.** Heroes are
   aspect-ratio sized, so every pixel figure moves with viewport width. A mid is
   200px at 2545 and 99px at 1265.

### RETRACTED: the head-of-ink rule

Proposed mid-build after two edits both moved a strip to the top of an ink band.
It does not survive: on home the wave went to the head of an ink band, on
terracotta to the foot, and both are live. The pre-existing site is split the
same way. **Placement is a judgement call per boundary, derived from the
arithmetic above and then overruled on the visual.** Do not try to reduce it to
a rule again.

### Geometry

8. **Mids: `aspect-ratio: 2880 / 226`. Footers: `height: 130px`.** Both declared
   values. `.as-hero` is `box-sizing: content-box` with a 5px `border-bottom`, so
   a declared 130 renders 135. Never write a rendered figure into CSS.
9. **Lobe count by rendered aspect ratio:** 3 to 4 on footers (~24:1), 2 to 3 on
   mids (~12.7:1). Crest and trough depths uniform within a curve; only widths
   and edge exits vary.
10. **The curve design space is effectively exhausted.** Six inverted and four
    bottom-edge variants exist, and at 2-3 lobes with depths shallow enough to
    read at 12.7:1, new curves land within about 0.03 of an existing one on every
    parameter. **Reuse is the resolution:** geometry is shared across pages, def
    ids stay per-page, and no page uses the same curve twice.
11. **Three same-polarity strips on one page cannot all differ in lobe count**,
    since only 2 and 3 are permitted. Put the odd one in the middle so the two
    matching curves are as far apart as possible.

### Slice register

12. **Full width always; only the vertical slice varies.** `object-position:
    center N%`. Three strips were left-anchored (`0px 100%`) and were corrected.
13. **15pp separation between any two strips on a page.**
14. **Mids avoid 0-10% only.** The original 20% floor was a guess and was too
    conservative. Measured: the panorama sits at luminance 17-20 in the top 10%
    against the ink band's 23, so a strip there merges into the ink. Above 10% it
    is dark ground with bright saturated shapes and reads fine — three mids are
    live at 21%, 25% and 32%.
15. **On five-strip pages the hero and footer slices must sit near the extremes**
    of the usable range. Five strips at 15pp need 60pp of spread; a hero parked
    mid-range splits the range into pockets too small to hold three separated
    mids. This is what forced footer slice moves on ddr, austin-space and
    gypsy-pistoleros.

### RETRACTED: two register clauses

- **"No more than two strips sitewide in any 5-point band."** Arithmetically
  impossible with 51 strips across 100 points.
- **"No exact sitewide duplicate."** Four duplicate pairs are live and invisible,
  because nobody sees two pages at once. Worth attention only where a slice is
  used three times or more — currently 100%, on home's footer, one-page's footer
  and the gypsy hero.

### Panorama tonal profile

Measured by canvas readback, mean luminance 0-255, source 2500x1667. The ink band
is 23. This is the measurement tool for any future register review — pull each
strip's slice, look up the luminance of the band it abuts.

| Band | L | Band | L |
|---|---|---|---|
| 0-10% | 17-20 | 50-60% | 47-51 |
| 10-25% | 30 | 60-70% | 49-54 |
| 25-40% | 36-40 | 70-80% | **97-122** |
| 40-50% | 50-51 | 80-100% | 71-95 |

70-85% is the brightest region by a wide margin and the most visually valuable
slice on the panorama.

---

## 8. Open items

### Cannot be fixed

- **contact `faq-mid` 65% vs `footer` 75% is a 10pp separation violation.** The
  page is frozen. Notable because contact is the reference page the rules were
  partly derived from, which is mild evidence the 15pp figure is stricter than it
  needs to be.

### Accepted, recorded so they are not re-litigated

- **Three mids below luminance 40:** custom-build 25% (L 38), ddr high-mid 21%
  (L 30), gypsy high-mid 32% (L 36). All above the 10% floor, all approved on
  screen. ddr's is the darkest mid on the site if one ever wants revisiting.
- **The 100% slice is used three times** — home footer, one-page footer, gypsy
  hero.
- **Coordinate form is not normalised.** On the service pages it resolves per
  strip by family (bottom-edge comma, inverted space); terracotta is all space
  and ddr all comma. Normalising would rewrite a dozen live stroke paths for zero
  visual change. Consequence: curves cannot be inventoried by `d` value.
- **The cs hub's top hero uses comma-form** while both its strips use space-form.
- **`custom-build-mid` is the only high strip that is a 2-trough**; every other is
  a 3-trough. Deliberate, and it offsets the uniformity of the reused botB.
- **One page rides a tolerance:** austin-space at 1276px minimum clearance
  (needs 1235 at -5%). custom-build no longer does — the fifth strip closed its
  4285px gap.
- **`custom-build-footer` at 6% is the darkest footer slice sitewide.** Chosen
  because with the hero at 87% it was the only slice clearing 15pp from all four
  other strips on the page. Next darkest footer is gypsy-pistoleros at 12%.

### Worth doing

- **The `~60px intrusion` figure** in the master comment near `.as-cs-page-cta`
  is unreliable. It describes the visible depth the wave troughs reach into the
  white, not block overlap — measured block overlap is exactly 135px, the strip's
  full height, because the strip sits inside the CTA's `padding-bottom:
  var(--as-clear-wave)`. Deriving from the curve puts the visible intrusion nearer
  100px than 60px, but that is arithmetic on a curve rather than a measurement, so
  the figure was left alone. Clearance token is 224px, so there is 89px of margin
  and nothing renders wrong.
- **`wave-clip-contact`** (top hero) has uneven crests 0.72 / 0.77 / 0.79 / 0.76.
  Regeneration offered twice, not taken.
- **375px and 320px pass never done** on contact, the two service editorial bands,
  or any of the 17 new strips. `resize_window` cannot go below ~500px, so this
  needs DevTools device emulation.
- **`json/services/5-support.json:24`** canonical points at
  `/services/ongoing-support`, which 301s to `squarespace-support-retainer`.
- **Untracked `html/case-studies-terracotta-property - old copy.html`** and
  **unreferenced, 2+ month stale `css/master-stylesheet-backup.css`** both want
  binning.
- **Public repo secrets audit** on `html/header-code-injection.html`, `.claude/`
  and `backups/` is still outstanding from a previous session.

### Resolved during this work — do not go looking for these

- site-refresh and support 15pp register collisions (footers moved to 82% and 97%)
- `stroke="#0d0d0d"` on 15 strips, now `#000` sitewide, 54 occurrences, zero others
- `loading="lazy"` missing on home's two mids and about's one
- Three comments quoting the old 107px rendered footer height, now 135px
- Three comments asserting a three-page case-study template, now four
- The `.as-allsorts .as-hero--home-low-mid { display: none }` block and its comment
- The master comment claiming ddr was the last page of the footer rollout
- **custom-build's fifth strip**, previously "worth doing". `custom-build-faq-mid`
  added at the `.as-svc-bottom` -> `.as-faq--dark` boundary, invC on a second def,
  slice `center 43%`. Gaps now 1366 / 2040 / 2427 / 2058, inside tolerance with no
  ride. The footer slice moved 44% -> 6% to free a register-compliant slice for it.

---

## Process lessons worth carrying

- **Never replace-all across a token boundary.** `object-position:50% ` ->
  `object-position:center` produced `object-position:center8%`, which parses as
  garbage and drops the declaration silently. The strip keeps its default and
  looks almost right. Scope by selector block or match whole declarations.
- **Edit clip defs by clipPath id; edit strokes by old `d` value.** Defs have ids
  and duplicate `d` values; strokes have no ids. Two defs held byte-identical `d`
  values before this work and one string was shared by four defs — a `d`-keyed
  edit would have rewritten three strips nobody asked to change.
- **Anchor HTML insertions on comment text plus the following section line, and
  insert before the comment.** Every insertion target on every page has a
  descriptive HTML comment above it, which would otherwise end up captioning the
  wave. Text-unique anchors also make line drift irrelevant.
- **Verify a paste with a synthetic element, not a repo grep.** A grep cannot
  detect a paste-time strip, and `decodedBodySize` reads low because of gzip.
  Build a div matching the full selector and read `getComputedStyle`.
- **Split `location.reload(true)` from the measurement.** Reloading inside the
  same evaluation tears down the context mid-run.
- **Confirm the viewport width before trusting any pixel figure.** A window that
  moved to a smaller display silently invalidated a whole page's arithmetic.
