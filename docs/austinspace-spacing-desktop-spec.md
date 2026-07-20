# AUSTIN_SPACE — Spacing Pass (Desktop)

**Date:** 13 July 2026
**Scope:** 14 live pages, desktop only (>= 481px)
**Status:** Spec. Not yet executed.
**Predecessor:** Typography pass (closed, verified live 13 July 2026). Do not re-litigate.

---

## 0. The condition (measured, not assumed)

Three layers are fighting:

1. **Base layer** — `padding: var(--as-space-section) var(--as-space-section-side)` on ~24 section
   selectors. `--as-space-section` is `7rem` (112px). **This never renders.** It loses to layer 3.
2. **Mobile layer** — `@media (max-width: 480px)` sets the mobile tokens (`4rem` / `1.2rem`).
   Correct, and it wins below 481 because layer 3 is guarded.
3. **Allsorts layer** — `@media (min-width: 481px) .as-allsorts .as-x { padding-top: 84px; ... }`.
   Two classes, so it outspecifies layer 1 and 2. **This is what actually renders on desktop.**

The token system exists and is not in use. The live values are hardcoded in layer 3.

### The one exception, and it is the bug

Nine ink-band rules sit in the Allsorts layer but carry **no media guard**:

```
padding: 70px 0 74px
```

| Line | Selector | Guard |
|---|---|---|
| 5621 | `.as-allsorts .as-contact-bar` | none |
| 5854 | `.as-allsorts .as-about-skills` | none |
| 5922 | `.as-allsorts .as-about-solo` | none |
| 6104 | `.as-allsorts .as-casestudy` | none |
| 6267 | `.as-allsorts .as-creds` | none |
| 6552 | `.as-allsorts .as-hub-bar` | none |
| 7047 | `.as-allsorts .as-svc-process` | none |
| 7430 | `.as-allsorts .as-cs-hub-grid` | `@media (min-width: 481px)` |
| 7850 | `.as-allsorts .as-cs-solution` | `@media (min-width: 481px)` |

Unguarded means they beat the `max-width: 480px` mobile rule on specificity (media queries add none).
The middle `0` is the horizontal padding. Result, verified live at 600px:

| Element | computed left |
|---|---|
| `.as-casestudy__client` (home) | **0** |
| `.as-svc-process__header` (3 service pages) | **0** |
| `.as-cs-solution__header` (3 case studies) | **0** |

Headings flush to the screen edge. Fixing the `0` and adding the guard fixes the asymmetry, the
gutter, and the layering, in one edit.

### Footer wave clearance: three budgets, one wave

Every footer hero overlaps the section above it by exactly **-107px**. The clearance above it is not:

| Page | Section | pad-b | margin-b | Total |
|---|---|---|---|---|
| 3 service pages, services hub, cs hub | `as-svc-cta` / `as-hub-notsure` / `as-cs-hub-cta` | 100 | 0 | **100** |
| `/`, `/about` | `as-cta` | 168 | 0 | **168** |
| 3 case studies | `as-cs-page-cta` | 100 | **160** | **260** |
| `/contact` | `as-faq` | 84 | **160** | **244** |

The two `:has()` rules (css 8055, 8060) add 160px on top of a 100px that eight other pages prove is
sufficient. Case studies and contact are carrying ~160px of dead air each.

Only `/` has a genuine claim to extra: its footer wave is the inverted one (lobes bulge upward).
`/about` inherits 168 for no reason.

---

## 1. Non-goals

- Mobile (<= 480px). Separate pass. The gutter fix below happens to repair mobile as a side effect;
  no other mobile value is touched.
- Heroes and wave clip-paths.
- Terracotta / DDR testimonial blocks and their Google Maps review links.
- `.as-cosmos-band`, `.as-sell-*`, `.as-solid-band` — one-page-website template, not live on any of
  the 14 pages. The `250px` / `190px` / `130px` values belong to these. Leave them.
- Typography. Closed.

---

## 2. Pre-flight (CC: verify before any edit, paste raw output)

1. Confirm every `.as-allsorts` section padding rule other than the nine above is inside
   `@media (min-width: 481px)`. Grep and paste.
2. Enumerate the **section header** selectors using `gap: 0.8rem`. From the earlier dump these are
   the nine live ones: `.as-creds__header`, `.as-services__header`, `.as-svc-included__header`,
   `.as-svc-process__header`, `.as-cs-solution__header`, `.as-cs-beforeafter__header`,
   `.as-about-work__header`, `.as-hub-services__header`, `.as-faq__header`.
   The other 14 uses of `gap: 0.8rem` are **not** headers (card hover links, list items, action
   rows). **Do not blanket-replace `0.8rem`.** Confirm the split and paste it.
3. For each of the nine headers, confirm the child structure (eyebrow / h2 / lead paragraph) and
   which children are actually present. Some may lack a lead.
4. Enumerate every selector using `gap: 1.8rem`, `gap: 1.4rem`, `gap: 1.2rem`, `gap: 1rem` and mark
   which are `__left`-style vertical text stacks vs. something else.
5. Enumerate every card-padding rule so the three tiers in section 6 can be assigned by selector,
   not by guess.

Do not proceed to edits until 1-5 are pasted and approved.

---

## 3. New tokens

Add to the `.as-allsorts` block (not `:root` — the `:root` set is legacy and stays untouched):

```css
.as-allsorts {
  --as-pad-band: 80px;
  --as-pad-ink: 72px;
  --as-pad-cta-top: 80px;
  --as-pad-side: 32px;
  --as-clear-wave: 96px;
  --as-clear-wave-home: 160px;
}
```

Rationale: `84` -> `80` and `70/74` -> `72/72` put both bands on the 8px grid. The 4px ink asymmetry
was never chosen; it was copy-pasted nine times.

Grid rule for the whole pass: **snap to the nearest 0.25rem.** Every rem value already at a multiple
of 0.5rem is on grid. The off-grid values are the odd decimals: `0.2 0.3 0.4 0.45 0.6 0.7 0.75 0.8
1.2 1.4 1.8 2.2 2.4 2.8`.

---

## 4. Bands

All inside `@media (min-width: 481px)`.

| Component | Now | New |
|---|---|---|
| White content band (all) | 84 / 84 | `var(--as-pad-band)` both |
| Ink band (the nine) | `70px 0 74px` | `var(--as-pad-ink) var(--as-pad-side)` |
| `.as-cs-stats` | 56 / 56 | **unchanged** — deliberately tighter |
| `.as-cs-testimonial` | 96 / 96 | **unchanged** — deliberately grander |
| `.as-services` (home) | 8 / 100 | **`0`** top / `var(--as-clear-wave)` bottom |

`.as-services` top pad = 0 is a decision, not a tidy: positioning + services read as one continuous
block, which is why the 8px was there. Approved 13 July. The 80px from positioning's bottom does the
work. Do not "fix" this to match other sections.

The `.as-allsorts .as-cs-hub-grid` and `.as-cs-solution` rules already carry the 481 guard — keep it.
The other seven need it added.

---

## 5. Footer wave clearance

**Delete** both:

```css
.as-faq:has(~ .as-hero--contact-footer)           { margin-bottom: 160px; }   /* css ~8055 */
.as-cs-page-cta:has(~ .as-hero[class*="-footer"]) { margin-bottom: 160px; }   /* css ~8060 */
```

**Replace** with a single mechanism — padding-bottom, one token, one exception:

```css
.as-allsorts .as-cta,
.as-allsorts .as-svc-cta,
.as-allsorts .as-hub-notsure,
.as-allsorts .as-cs-hub-cta,
.as-allsorts .as-cs-page-cta   { padding-bottom: var(--as-clear-wave); }

.as-allsorts .as-faq:has(~ .as-hero--contact-footer) { padding-bottom: var(--as-clear-wave); }

.as-allsorts .as-cta:has(~ .as-hero--home-footer)    { padding-bottom: var(--as-clear-wave-home); }
```

CTA top padding on all of the above: `var(--as-pad-cta-top)` (80px, unchanged).

Net effect: case studies lose ~164px of dead air, contact loses ~148px, `/about` loses 72px, `/`
loses 8px (168 -> 160, invisible).

`--as-clear-wave-home: 160px` is the on-grid neighbour of the current 168 — a deliberate no-op, so
this pass ships without a visual change on the homepage. Tightening it (96 / 128) is a separate,
optional decision to be made against a live preview, not in this spec.

---

## 6. Intra-section (this is the actual polish)

### 6a. The header stack — the "cramped" fix

Every section header is a flex column at `gap: 0.8rem` (12.8px). That single value sits between the
eyebrow, the H2, and the lead. The H2 grew 41.6 -> 48px in the typography pass; the gap under it did
not. A 48px Fraunces heading with 13px of air under it is what reads as cramped, on every section of
every page.

For the **nine header selectors only** (confirmed in pre-flight step 2):

```css
gap: 16px;                       /* was 0.8rem / 12.8px */
```

and on the lead paragraph inside each header:

```css
margin-top: 8px;                 /* total 24px under the H2 */
```

**Header -> content**: standardise on **56px**. Currently 56 on `.as-services__header` and
`.as-hub-services__header`, 48 on `.as-faq__header`, `.as-hub-bar__header`, `.as-contact-bar__header`.
(`margin-bottom: 3.5rem` x7 and `margin-bottom: 48px` x4 in the frequency table.)

### 6b. Text stacks

Five values doing one job. Collapse to two:

| Context | Now | New |
|---|---|---|
| Hero left column (`hero-combined`, `svc-hero`, `cs-hero`, `about-hero`, `cs-hub-hero__inner`) | 1.8rem / 1.4rem (29 / 22) | **32px** |
| Body left column (`positioning`, `cta`, `contact-form`, `about-background`, `svc-cta`, `hub-notsure`, `cs-challenge`, `cs-page-cta`, `svc-bottom__col`, `cs-hub-cta__left`) | 1.2 / 1.4 / 1rem / 0.8rem / 1.8rem (19 / 22 / 16 / 13 / 29) | **24px** |

Corrections logged during execution, not in the original draft above: `.as-cs-hub-hero__inner` (single-column hero on the case-studies-hub page, no `__left` sibling since there's no two-column split) and `.as-svc-bottom__col` (two-column body layout, "perfect for" + pricing) were flagged in pre-flight item 4 as genuine vertical text stacks matching these two groups by structure, but were missing from the class lists above — added to Hero and Body respectively. `.as-cs-hub-cta__left` was the direct twin of `.as-cs-page-cta__left` (same shape, different page) and was missed from the Body list in the same pass — added.

Assign by selector from pre-flight step 4. Anything in that grep that is not a vertical text stack
stays as it is.

### 6c. Card padding

Nine values -> three tiers:

| Tier | Value | Components |
|---|---|---|
| Compact | `24px 32px` | `.as-row-item`, `.as-faq__question`, `.as-svc-pricing__tier` |
| Standard | `32px` | `.as-services__card`, `.as-hub-card`, `.as-svc-included__item`, `.as-about-role`, `.as-about-work__card`, `.as-cs-stats__item` |
| Panel | `48px` | `.as-svc-cta__inner`, `.as-hub-notsure__inner`, `.as-cf-wrap` |

**Risk, flag before shipping:** the homepage service card goes `28px 26px` -> `32px`, which drops its
content column from 315px to 303px. That column was tuned in the typography pass so card titles do
not wrap to two lines. **Verify live.** If titles re-wrap, the fix is the grid gap or the copy — not
a bespoke padding that re-forks this component.

### 6d. Two-column gaps

Already healthy (24 / 32 / 48 / 64 / 80 / 96, all on grid). Two changes only:

- `.as-about-solo__inner` 80 -> **96** (matches every other text-to-text two-column)
- `.as-casestudy__inner` 48 — **keep**. Deliberate: it is an image pair, not a text column.

Card grid gaps are a consistent 24 across services / hub / about-work / svc-included. Leave alone.

### 6e. Spelling normalisation

Same value, three spellings. Not a rendering bug, but it is why the drift was invisible to grep:

| Value | Spellings in use |
|---|---|
| 8px | `gap: 8px` x5, `gap: 0.5rem` x11, `gap: .5rem` x1 |
| 16px | `gap: 16px` x1, `gap: 1rem` x15 |
| 24px | `gap: 24px` x2, `gap: 1.5rem` x11 |
| 40px | `gap: 40px` x2, `gap: 2.5rem` x2 |
| 48px | `gap: 48px` x1, `gap: 3rem` x2 |
| 64px | `gap: 64px` x1, `gap: 4rem` x2 |

Normalise to **px** throughout. Low priority, do last, do not let it delay the rest.

---

## 7. Deletions

- `--space-lg` / `--space-md` / `--space-sm` and `.as-section` (css 68, 80). Three uses total, all
  legacy. Confirm zero live HTML uses `.as-section`, then remove.
- The base-layer `padding: var(--as-space-section) var(--as-space-section-side)` rules on the eight
  ink-band selectors. **Dead code** — overridden by the Allsorts ink rule and never rendered.
  **Selector trim, not block delete.** Grep the repo first; some of these rules carry other
  declarations that ARE live.

---

## 8. Verification (Chrome MCP, after paste)

Cache-bust before every read: `location.reload(true)` + `setTimeout` 900-1500ms.

1. **Gutter.** At 600px viewport, `.as-casestudy__client`, `.as-svc-process__header`,
   `.as-cs-solution__header` must all compute `left: 32px`, not 0. All 14 pages.
2. **Bands.** White = 80/80, ink = 72/72, on all 14 pages.
3. **Clearance.** Every footer wave still clears its content. Case studies and contact will drop by
   ~160px — eyeball those two hardest.
4. **Homepage service card.** Content column and title wrap. This is the one thing likeliest to
   regress.
5. **Header stack.** 16px eyebrow->H2, 24px H2->lead, 56px header->content. Nine sections.
6. **Page heights.** Expect small reductions everywhere, ~160px on case studies and contact.

**Do not trust paint-adjacent reads from the MCP tab** (shadows, transitions, opacity). Layout
geometry is trustworthy. If a paint-dependent check comes back negative, hand it to Charles.

**For any multi-instance edit inside a single file, demand raw grep output, not a summary.** This
failed once already on the case-study hub — three near-identical edits, only one landed, the audit
was asserted rather than re-run.

---

## 9. Open, deliberately

- `--as-clear-wave-home`. Set to 160 (no-op). Whether the inverted homepage wave actually needs more
  than the standard 96 is a live-preview question, not a spec question. Park it.
- Whether `.as-cs-stats` (56/56) and `.as-cs-testimonial` (96/96) should join the standard ink band.
  Both look deliberate. Leaving them.
