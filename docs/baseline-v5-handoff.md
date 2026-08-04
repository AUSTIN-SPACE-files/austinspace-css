# AUSTIN_SPACE - baseline v5 handoff

Written 2 August 2026, at the close of the sitewide mobile wave pass.
Supersedes `docs/baseline-v4-handoff.md`. Move v4 to `docs/superseded/`.

**Read this before touching any wave, hero, footer strip or mid strip.**

---

## 1. State

**The mobile wave pass is COMPLETE. All 16 pages, 55 curves.** No page is
left on the desktop-only treatment.

    Build       20260802-113af8
    Panel       135,557 bytes (~64KB clear of the 200,000 truncation ceiling)
    Branch      mobile-wave-batches-3-15, fast-forward merged to main

Verified live at 375px, every curve, on eight properties each: clip reference
resolving to its own `-mobile` def, aspect-ratio, `object-view-box` compared
semantically, narrow path `d` byte-exact, `-wide` hidden, `-narrow` shown,
full stroke attribute set, and stroke alignment measured against the IMAGE
rect. 45/45 on the final pass, plus the 10 from the two pilot batches.

---

## 2. Inventory - v4's figures were wrong, these are measured

v4 said "56 clip defs, 17 heroes". Both wrong. Live count:

    Desktop defs   55   =  16 heroes + 13 footers + 26 mids
    Mobile defs    55   =  one per desktop def
    TOTAL         110

16 heroes across 16 pages - one each, no orphan. v4's "15 heroes remaining"
was correct; only its headline total was not.

**The mobile treatment is ADDITIVE.** Each `-mobile` def sits alongside its
untouched desktop original. Nothing was rewritten.

Page strip counts: custom-build 5, cs-terracotta 5, cs-ddr 5,
cs-gypsy-pistoleros 5, site-refresh 4, ongoing-support 4, one-page 4,
cs-austin-space 4, home 4, about 3, services-hub 3, contact 3,
casestudies-hub 3, privacy 1, terms-of-service 1, cookies 1.

---

## 3. The mechanism

**Two sibling paths per stroke SVG, swapped by display.** Not CSS `d:`.

    .as-hero__stroke-wide      display:none below the breakpoint
    .as-hero__stroke-narrow    display:inline below the breakpoint

**The breakpoint is `@media (max-width: 600px)`, NOT 480.** Every mobile wave
rule lives in that one query, opening at `master-stylesheet.css:647`.

**The swap is GENERIC and unscoped**, added 2 August:

    :root .as-hero__stroke-narrow{ display: none; }        /* above the query */
    @media (max-width: 600px){
      :root .as-hero__stroke-wide{ display: none; }
      :root .as-hero__stroke-narrow{ display: inline; }
    }

Both generic rules are `(0,2,0)`, tying the base default; source order breaks
it. This replaced eight homepage-scoped `(0,3,0)` selectors. It keys on
classes that only exist on treated strips, so an unclassed path is untouched -
verified by negative control on an untreated page.

**Per treated strip, three changes:** the `-mobile` clipPath def in
`html/_global/footer-injection.html`, the narrow sibling in the page HTML, and
the CSS (clip-path + object-view-box, plus aspect-ratio where applicable).
No per-page swap block.

    heroes    aspect-ratio: 2 / 1
    mids      aspect-ratio: 4 / 1
    footers   NO aspect-ratio - flat 130px stands

---

## 4. Authoring rules

**Edge is preserved from the strip's existing desktop def.** It is set by
which side the ink sits on, not a free choice.

    bottom edge   M0,0 L1,0 L1,Ys C c1,Ys c2,Ye 0,Ye Z      authored right to left
    top edge      M0,Ys C c1,Ys c2,Ye 1,Ye L1,1 L0,1 Z      authored left to right

**Reading the edge: parse the first coordinate pair NUMERICALLY.** A `^M0,`
or `^M0,0` regex gives false positives, because `M0,0.30` matches both. Bottom
edge is y0 === 0 AND an immediate run to `L1,0`. Anything else is top edge.
Live split across all defs: 33 bottom, 26 top.

**Span is 24 throughout** (0.62 / 0.38). Direction and inflection vary; no two
strips on a page share both.

    down-right   bottom: Ys 0.62, Ye 0.38    top: Ys 0.38, Ye 0.62
    down-left    the reverse
    control x    bottom: c1 = infl+0.20, c2 = infl-0.20
                 top:    c1 = infl-0.20, c2 = infl+0.20
                 infl constrained to [0.20, 0.80]

**Stroke derivation, non-negotiable.** From the clip's OWN commands verbatim:
strip box-closure segments, coordinates x100, nudge Y +1 for bottom edges and
-1 for top. Hand-authoring a separate stroke always drifts. Verified against
four live homepage pairs before the pass, and CC independently re-derived all
45 and matched.

**Narrow paths carry the FULL attribute set. Nothing is inherited.**

    fill="none" stroke="#000" stroke-width="5" vector-effect="non-scaling-stroke"

A bare path draws a 1px hairline and fills black.

---

## 5. object-view-box - the maths is determined, not chosen

Horizontal inset is held at 16.67%. The vertical pair follows:

    visible height % = (100 - 2*16.67) * (W_img / H_img) / target aspect

With the asset at 2500x1667 (ratio 1.4997) that gives **50% for a 2/1 hero**
and **25% for a 4/1 mid**. Footers use **33.3%**, matching the homepage's
nominal 3/1 rather than the true box ratio - deliberate, for consistency
across all 13 footers.

Only the SPLIT between top and bottom is a judgement call; it sets the crop
centre. Centres were taken from each strip's own desktop `object-position` Y,
clamped to keep the band fully on the image with a 3% margin:

    hero    centre in [28, 72]
    mid     centre in [15.5, 84.5]
    footer  centre in [19.65, 80.35]

**This makes the true image ratio load-bearing.** The `width`/`height`
attributes across 14 files declare 2880x600 for an asset that is 2500x1667.
Wrong, and now consequential - fixing it is the highest-value open item.

`naturalWidth` reads 325x217 because srcset uses w descriptors and the value
is density-corrected. The RATIO survives (1.4977) and is all the maths needs,
but never treat that number as an intrinsic size.

---

## 6. Verification - what is trustworthy

**The canary is the only thing distinguishing "CC built it" from "Squarespace
has it".** It caught a premature verification this session.

    const e=document.createElement('div'); e.className='as-build-canary';
    document.body.appendChild(e);
    const v=getComputedStyle(e).getPropertyValue('--as-build-id').trim();
    e.remove(); v

`location.reload(true)` busts the browser cache but NOT Cloudflare's edge
copy. If the canary reads stale after a paste, hard-refresh incognito.

**NEVER string-compare computed CSS values.** Two false failures this session,
both formatting rather than fault:

    path d      "M100,42"  reserialises to  "M 100 42"
    inset()     3 values collapse to 2 when bottom equals top

Compare numerically, or expand `inset()` to canonical four values first.

**The synthetic probe replaces page loads.** Constructing
`div.as-hero--X > img.as-hero__img` off-document and reading
`getComputedStyle` returned every desktop `object-position` in ONE call
instead of 13 page loads. Works for any value coming from an unscoped rule.
Build the probe to match the FULL selector.

**Measure stroke alignment against the IMAGE rect, not the block.** Any strip
with a border reads a false 5px offset otherwise.

**Iframe harness at 375px** for mobile width - `resize_window` floors around
500px. Never re-parent a loaded iframe. `getComputedStyle` must come from
`iframe.contentWindow`. Keep under ~10 loads per call (45s CDP limit) - 13
pages needs two sweeps.

**MATCH BY SECTION, NOT BY `d`.** `2-one-page.html` has two paths with
identical `d` (low-mid and footer), and three defs sitewide share a path.
Anchor on the containing `.as-hero--<modifier>` and assert exactly one path
per section. This corrects the instruction used in batches 1-2, which happened
to be safe there but is not safe in general.

**Enumerate before concluding something is absent.** The v4 hero-count
discrepancy was a bad headline figure, not a missing def. Same failure shape
as the earlier "Gypsy Pistoleros orphaned from the hub" error, which was
counting one class and concluding from its absence.

---

## 7. Deploy loop - unchanged

CC edits repo files. **Nothing auto-deploys.**

Paste order is load-bearing:

    html/_global/footer-injection.html   ->   page HTML   ->   panel.css

A def must exist before anything references it, or the strip renders as a raw
unclipped rectangle. Between the HTML and CSS pastes both strokes draw at
once - expected and transient.

`css/master-stylesheet.css` is the commented authoring source.
`css/master-stylesheet.panel.css` is the comment-stripped build and **the one
that gets pasted**. It is a build artefact - regenerate via
`tools/build-css.js`, never hand-edit. Panel carries ZERO comments.

Every CSS rule lands in both files, so DOUBLE expected grep counts for CSS.
Clip defs and page HTML are single-file and are NOT doubled.

Audit per id, never in aggregate - an aggregate count hides a page where half
the defs landed. Demand raw output; a summary is not an audit.

**ASCII-only in CSS comments.** Em dashes and arrows break Squarespace's
parser and kill the entire sheet. This applies to the CSS panel only -
`footer-injection.html` already contains non-ASCII in its inline `<style>` and
is fine.

**No slash-form grid shorthand.** The panel silently strips any `grid-row` /
`grid-column` value containing `/`. Use the longhand start/end properties.

---

## 8. Open items

**Raised in priority by this pass:**
- `width`/`height` attributes across 14 files declare 2880x600 for a 2500x1667
  asset. The object-view-box maths depends on the true ratio.

**Cosmetic, mine to flag, yours to judge:**
- The three service-page footers all clamped to centre 80.4 and therefore
  share `inset(63.7% 16.67% 3%)`. Correct, possibly repetitive back to back.
- Gypsy Pistoleros carries the two largest clamps (hero 100 -> 72, footer
  12 -> 19.7), so its slices depart furthest from desktop intent.

**Carried forward untouched:**
- Homepage phone card still serves `Terracotta_Home.webp` in both frames;
  the swap brief was written 29 July and never executed. File is
  `html/home.html`, not `index.html`.
- AUSTIN_SPACE case-study hub row has no mobile asset.
- `.as-positioning` at 1,919px - rail measured, never previewed.
- Credit band 60/56 padding, sized for three elements when two remain.
- `wave-clip-contact` desktop hero has uneven crests 0.72/0.77/0.79/0.76.
- Footer strip heights: all 13 are 102px or 130px; earlier notes calling
  contact uniquely sized are stale.
- 320px never verified anywhere.
- `json/services/5-support.json:24` canonical points at `/services/ongoing-support`,
  which 301s.
- Untracked `html/case-studies-terracotta-property - old copy.html` and stale
  unreferenced `css/master-stylesheet-backup.css`.

**Naming note:** the support page's assets are all `ongoing-support` although
the live URL is `/services/squarespace-support-retainer`. Deliberate. Do not
"correct" it.
