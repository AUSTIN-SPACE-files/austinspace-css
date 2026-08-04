# AUSTIN_SPACE - baseline v4 handoff

Written 1 August 2026, early hours. Commit to `docs/baseline-v4-handoff.md`.

SUPERSEDES `docs/superseded/baseline-v3-handoff.md`. v3 is correct on capture, the v1 audit, the
shadow-deletion pass and the FAQ work. **It is WRONG on the Custom CSS panel
size ceiling**, and that error is the most dangerous kind of stale doc: a
confident number nobody will re-test. Section 2 retracts it.

Read this one. Where they disagree, this one is right.

> **Note on the chain.** v2 and v3 were originally never committed. They are now
> archived unedited at `docs/superseded/baseline-v2-handoff.md` and
> `docs/superseded/baseline-v3-handoff.md`, each carrying a header that retracts
> its panel size ceiling figure and points here. Read them for history only.

> **Verification stamp.** Every checkable claim below was re-run against the
> working tree at commit time rather than carried over. Figures that moved as a
> result are marked **[corrected 1 Aug]** inline, in sections 1, 3 and 9.
> Method: section 8.
>
> Sections 1, 2f, 3 and 9 were then re-checked again after the section 10
> retirement, which moved every size figure in the document. **Any pass that
> changes the stylesheet invalidates this table** - re-run
> `node tools/build-css.js --check` rather than quoting it.

---

## 1. Status

Site healthy, live on build `20260801-83b7c3`.

**Shipped and committed since v3:**

| pass | commit | verification |
|---|---|---|
| details-accordion retirement | (v3 era) | 46/48 |
| FAQ mobile collapse | `99ea84c` | 48/48 |
| mobile card rail + minified panel | `1d49b97` | 48/48 |
| probe environment guard | `ad95ab0` | 28 stub assertions + live |
| baseline v2/v3 archived to `docs/superseded/` | `fa5ea01` | n/a, docs only |
| `.as-cs-phase*` / `.as-cs-beforeafter*` retirement | see section 10 | 48/48, `nonExpected: []` |

**Current stylesheet sizes.** All figures are `node tools/build-css.js --check`
output, which is read-only and writes nothing. Re-run it rather than trusting
this table - it is the first thing to go stale.

| | bytes |
|---|---|
| `master-stylesheet.css` (authoring source, commented) | 278,792 |
| stripped (decommented, pre-minify) | 143,272 |
| minification saving | -18,747 |
| minified body | 124,525 |
| canary line appended post-minify | +50 |
| **`master-stylesheet.panel.css` (what Charles pastes)** | **124,575** |

Deployed `custom.css` is ~123,500 after Squarespace re-minifies.

**How the panel got here.** **[corrected 1 Aug]** - v4's first draft carried
`~284,600` for the source and a minification/rail split that did not reconcile.
The corrected chain, each step measured:

| step | panel bytes |
|---|---|
| pre-minify, pre-rail (build `20260731-c26066`) | 147,863 |
| rail rules added, +1,219 to the stripped sheet | - |
| minified for the first time, -19,547 | 129,585 |
| `.as-cs-phase*` / `.as-cs-beforeafter*` retired, 47 rules | **124,575** |

The rail pass reconciles exactly as `147,863 + 1,219 - 19,547 + 50 = 129,585`.
The retirement took a further **5,010** bytes off the panel and 7,451 off the
master. Both pre-minify estimates for the retirement (5,650 and 8,131) were
high, because minification had already absorbed most of the whitespace they
counted - which is why section 10 reports the realised figure only.

---

## 2. THE PANEL IS A LESS COMPILER. This supersedes everything about size.

### 2a. The finding

Squarespace's Custom CSS panel compiles input as **LESS**, not CSS. **Any
`calc()` whose contents include a `var()` fails the entire compile silently.**
The editor displays the full pasted text; the server saves a ~500-byte stub; the
site loses every custom rule at once.

Both operand orders fail:

```
calc(-1 * var(--x))        FAILS
calc(var(--x) * -1)        FAILS
calc(100% - var(--gutter)) FAILS (by inference, same class)
```

Isolated by single-variable live tests, each appended to a known-good sheet.

### 2b. Cleared innocent - do NOT re-suspect these

Every one of these was individually tested and saved cleanly:

- `calc(100% - 10px)` and other **literal-operand** `calc()`. The mask
  declarations `calc(100% - 56px)` and `calc(100% + 56px)` are live and fine.
- `mask-image`, `-webkit-mask-image` with `linear-gradient`
- `mask-size`, `mask-repeat` and prefixed forms
- `::-webkit-scrollbar`
- `scrollbar-width: none`
- `-webkit-overflow-scrolling: touch`
- `scroll-snap-type: x mandatory`
- minification
- file size

### 2c. RETRACTION - the size ceiling does not exist

**v3 and the earlier deploy notes both state a panel size limit. Both are
wrong.** The ~200,000 figure was never tested. The ~148,000 figure was mine, was
wrong, and was written into a brief as fact.

The binary search that produced it was confounded: every failing file happened to
contain `calc(var())`, and every passing file did not. Size correlated with
failure across five samples purely by coincidence.

The disproof is a single non-monotonic pair:

| bytes | `calc(var())` | result |
|---|---|---|
| 147,654 | no | saves |
| 147,997 | no | saves |
| **128,363** | **no** | **saves** |
| 148,386 | yes | stub |
| 149,079 | yes | stub |
| **129,545** | **yes** | **stub** |

A 129,545-byte file failed while a 147,997-byte file succeeded. No threshold
fits. Content is the variable; size is not.

**The reasoning error, named so it is not repeated:** twelve probe rules were
appended at once to test "is it content?", all twelve vanished, and that was read
as "not positional truncation, therefore size". A compiler that aborts the whole
compile produces exactly that result. Two of the twelve probes contained
`calc(var())`, so the test could never have isolated anything.

`build-css.js` no longer gates on bytes. `HARD_CEILING`/`WARN_CEILING` are gone,
replaced by a warn-only `SANITY_CEILING = 190000` (`tools/build-css.js:60`).
Nothing reports "headroom".

### 2d. The guard

`build-css.js` now runs `checkCalcVar()` (`tools/build-css.js:141`), which walks
each `calc(` to its matching close paren so nesting and depth do not matter, and
**fails the build** on any `var()` inside. It runs against the decommented
source, so it does not false-positive on `calc(` written inside a comment, and
its line numbers match the authoring file.

### 2e. The fix pattern

Where a negative or computed value is needed from a token, define it as a
literal rather than computing it:

```
:root .as-rail{
  --as-rail-bleed: var(--as-space-section-side);
  --as-rail-bleed-neg: -32px;
  margin-left: var(--as-rail-bleed-neg);
}
@media (max-width:480px){
  :root .as-rail{
    --as-rail-bleed: var(--as-space-section-side-mobile);
    --as-rail-bleed-neg: -19.2px;
  }
}
```

The two tokens **cannot derive from one another** and must be kept in sync by
hand. Every breakpoint that overrides one must override both. This is documented
in a comment block in the master.

### 2f. Diagnosing a failed paste

The deployed URL carries a revision counter:
`/custom-css/{site}/{id}/NNN/custom.css`. **A failed save still increments it**,
so the counter proves the save was accepted, not that it worked.

The reliable check is `decodedBodySize` on that resource: healthy is currently
~123,500 and a stub is under 600. The gap is three orders of magnitude, so the
exact healthy figure does not matter and should not be treated as a threshold -
read it from `--check` if you need it precise. Symptoms of a stub are total, not
partial - hero
`clip-path: none`, `.as-container` unconstrained, ink bands transparent. It
reads as a catastrophic CSS bug rather than a save failure.

**Why this went unnoticed for the codebase's whole life:** the pre-rail sheet
contained ZERO `calc()`. Not by choice - `calc()` has never been able to survive
this panel, and nobody knew.

---

## 3. Minification

`panel.css` is now whitespace-minified by `build-css.js`, one line per rule.

- saving **18,747 bytes, 13.1%** of the 143,272-byte stripped sheet. The
  percentage has held at 13.1% across both builds it has run on, which is what
  you would expect from whitespace that scales with rule count.
  **[corrected 1 Aug]** - the first draft said ~19,300 and 13.9%; neither
  matched `--check`, and 13.9% did not follow from 19,300 against any of the
  three candidate denominators.
- one line per rule costs ~1,250 bytes over fully flat, and keeps the artefact
  git-diffable at **1,249 lines**. Worth it: this file cannot be inspected once
  deployed (cross-origin, `cssRules` empty), so the repo copy is the only
  review surface there is.
- `master-stylesheet.css` is untouched and remains the authoring source

**The minifier is a state machine, not regex substitution.** Quoted strings and
`url()` emit verbatim; paren depth protects `calc()` operators; at-rule preludes
protect their own spacing. This matters - the first regex prototype emitted
`@media(max-width:767px)`, which is invalid, and was caught by the verifier
rather than by a live paste.

**`proveInert()` runs on every build** (`tools/build-css.js:445`), parsing pre-
and post-minify into (media, selector, declarations) triples and failing on any
divergence. Current run: 1,151 rules and 3,828 declarations before and after,
zero only-before, zero only-after, ordered sequence identical, flat declaration
stream identical. Every future build re-proves its own inertness rather than
trusting one result.

The rule count doubles as a delete audit. The retirement in section 10 removed
47 sole rules, and `proveInert` went 1,198 -> 1,151 on the next build. An
off-by-one there would mean a rule was merged or lost beyond the plan, so
**check the delta against the intended count on any deletion pass.**

Independently confirmed live on the rail pass: at 1505 the rail does not exist
(media-scoped below 600px), so those 16 harness cells exercised minification
alone. Zero property changes across all 1,198 rules the sheet held at that
build.

**`--check` is read-only.** Use it to re-derive any size figure in this doc
without dirtying the tree. `--no-minify` writes a diffing artefact that is
gitignored and must never be pasted.

---

## 4. Environment guard - the probe now enforces it

Committed `ad95ab0`, pushed, live on GitHub raw. `grep -c devicePixelRatio`
returns 6, was 0.

The display silently invalidated **three separate harness runs** in one session.
Symptom each time: diffuse geometry changes with `props: []` on elements
unrelated to the edit, spread across pages the change could not reach.

Two variables, both measured:

- **`devicePixelRatio`.** 1 on the 2560x1440 external display, 2 on the MacBook
  Air panel. At dpr 2 Chrome snaps layout to half pixels: text box heights move
  1-2px, widths stay identical, fractional grid tracks round differently.
  Baseline v2 was captured at dpr 1.
- **Scrollbar mode.** macOS "Show scroll bars: Always" gives `cw = vw - 15`
  (1490 / 753 / 360). Overlay gives `cw = vw`, moving every `.as-container` auto
  margin by 7.5px.

What the guard does:

- `page()` records `dpr` in the capture meta
- `diff()` returns `{ err: 'ENV devicePixelRatio ...' }` before opening a frame,
  and `{ err: 'ENV clientWidth ...' }` on scrollbar mismatch
- `sweep()` refuses to run at dpr != 1
- a baseline with no stored `dpr` is treated as unknown, not as a mismatch, so
  pre-guard cells still work

**An environment mismatch returns an error, never a zero and never a diff.**
Both are indistinguishable from a real result, and that ambiguity is the entire
problem.

`page()` also gained `{save: false}`. It previously wrote unconditionally, and
calling it to inspect its return shape overwrote two baseline cells
(`/@1505`, `/@375`). Those were repaired and self-validated: recaptured `docH`
reproduced v2's recorded 6,499 and 12,012 exactly.

---

## 5. Mobile pass - state

**SHIPPED: FAQ collapse below 860px.** 73 pairs across 12 files converted to
`details`/`summary`, shipping `open`, with a script that strips `open` below the
breakpoint. Desktop keeps `pointer-events: none` so the editorial band cannot be
collapsed by a stray click. Measured: `/contact` 6,846 -> 5,954 at 375 (13.0%),
Terracotta wrapper 12.2%. Flash-of-expanded is immaterial - the nearest FAQ to
the top of any page at 375 is `/contact` at 3,384px, 4.2 viewports below the
fold.

Re-counted 1 Aug, both figures hold: `class="as-faq__pair"` totals exactly 73
across exactly the 12 files carrying `.as-faq--dark`. Per file - about 5,
contact 5, services hub 7, one-page 7, custom-build 8, refresh 6, support 6,
case-studies hub 5, terracotta 6, ddr 6, austin-space 6, gypsy-pistoleros 6.

**SHIPPED: card rail on four service pages.** `.as-svc-included__grid` becomes a
full-bleed horizontal rail below 600px. 2,964 -> 409px at 375 on custom-build,
~7,150px across the four pages.

- **83% card width is the measured knee.** Card height falls as cards widen then
  flatlines at 385px from 83% on, so wider costs peek and buys nothing.
  1.2 cards visible, 58px peek.
- Breakpoint 600px reuses the existing rule that already dropped the grid to one
  column. Verified: 560 gives 1 column, 640 gives 2.
- Verified across the band: `-32px` at 500 and 560 reaching both edges exactly,
  `-19.2px` at 375, grid restored at 640, zero horizontal overflow throughout.

**CLOSED: 375/320 verification.** All targets pass with `docOverflow: 0`. The
case-study phone card overhang is fine; the hero collapses to one column below
960px. The only flagged elements sitewide are Squarespace-native
(`a.header-skip-link` parked at L-16000, two `div.header-menu-nav-folder`
drawers parked one viewport right).

**OPEN: tier 2 rails.** All measured as rails, all equalise to uniform card
heights, none previewed:

| component | page | before | after | saving |
|---|---|---|---|---|
| `.as-pos-cards` | home | 1,374 | 289 | 1,085 (79%) |
| `.as-about-work__grid` | about | 1,450 | 444 | 1,006 (69%) |
| `.as-about-skills__grid` | about | 1,095 | 212 | 883 (81%) |
| `.as-svc-process__steps` | service pages | 1,002 | 319 | 683 (68%) |
| `.as-hub-bar__grid` | services hub | 631 | 181 | 450 (71%) |

`.as-pos-cards` is the best next candidate - its cards are currently uneven
(343/297/343/319) and the rail tidies them to 274.

`.as-svc-process__steps` is **not recommended**: it is a numbered sequence, so
hiding steps 2-4 behind a swipe costs comprehension in a way that hiding feature
cards does not, and `.as-svc-process--three` forces 3 columns with no media
query, which a rail would have to fight.

---

## 6. Traps that cost real time

**`box-sizing` is `content-box` SITE-WIDE.** No `*` reset. This broke two rail
preview attempts: with `flex: 0 0 67%` the computed width was a correct 215px
while the rendered box was 283px, because padding and border sit outside. Rail
items set `border-box`, scoped to the rail. It is also the only property change
the harness reported for the entire rail pass.

**Flex items default to `min-width: auto`,** which lets content override a flex
basis. `min-width: 0` is required on rail items.

**Never add a child to `.as-svc-included__grid`.** Icon colours rotate on
`:nth-child(1..4)`; a sentinel or affordance element shifts every card's colour
by one. This is why the fade is a mask on the rail rather than an overlay on a
wrapper.

**`.as-svc-included__item` shares a rule** with `.as-svc-hero__right` and
`.as-svc-pricing`. Do not edit it to add rail-specific properties.

**Card shadow clearance.** Cards carry a hard `5px 5px 0 0` pop shadow and a
mask clips to its own box. Rail padding is 19.2px right and 20px bottom, giving
clearance. **Tightening that padding to reclaim space would silently clip every
card's shadow.**

**Slash-form grid shorthand is silently stripped** by the panel. Use
`grid-row-start`/`grid-row-end`. Still true, unrelated to the LESS finding.

**ASCII-only comments.** Still true.

---

## 7. Corrections carried forward from v3, all still live

- **`.as-faq--dark` is TWELVE pages**, not four or eight: about, contact, the 5
  service pages, the case-study hub, and all 4 case-study detail pages. 73 pairs.
  The genuinely FAQ-free set is `/` and the 3 policy pages. Re-verified 1 Aug.
- **Repo paths are `html/<section>/<n>-<slug>.html`**, not flat.
  `html/_global/` holds `header-code-injection.html`, `footer-injection.html`,
  `footer.html`. `html/policies/` DOES exist (v3 said otherwise; that was wrong)
  and holds `privacy.html`, `cookies.html`, `terms-of-service.html`.
  Re-verified 1 Aug.
- **The case-study hero HAS a mobile pass** at 1280 / 960 / 480. v3's claim that
  it had none came from a scan with broken brace-depth tracking. Use a
  block-aware matcher for multi-line selector lists.
- **`.as-cs-hero__link`** already has `align-self: flex-start` twice, base and
  under `:root .as-cs-v2`. Redundant restatement, not a bug.

---

## 8. Method lessons

**The recurring failure this session was asserting from stale or partial
evidence.** Four instances, all Claude's:

1. Claimed the four case-study pages had no FAQ, from files that had been in the
   working directory for hours and were never grepped.
2. Claimed the case-study hero had no mobile CSS, from a scan whose brace
   tracking was broken.
3. Twice reported files missing from the remote, having probed flat filenames
   instead of the numbered convention.
4. Concluded a size ceiling from five confounded samples, and wrote it into a
   brief as measured fact.

The shape is identical each time: **a check performed earlier for another
purpose, reused as evidence.** Grep at the moment of asserting, and when a
correlation is the basis of a claim, find the sample that breaks it before
writing it down.

**Corollary that held up well:** CC's repo greps caught three of the four. The
division of labour where Claude specs and CC verifies against the actual tree is
working, and raw command output beats a summary every time.

**Fifth instance, caught on this doc.** v4's own first draft carried two open
items that had already been resolved (footer strip heights, untracked files) and
three size figures that did not reconcile. All five were carried forward from v3
without re-checking, in a doc whose stated purpose is retracting a figure nobody
re-tested. Re-verifying the whole doc against the tree before committing it cost
one round of greps and caught all five. **Do that pass on v5 as well** - the
open-items list in section 9 is the highest-risk section, because items get
fixed in passing and nothing prompts their removal.

---

## 9. Open items

Carried forward and re-checked 1 August. Still open:

- Homepage phone card still serves `Terracotta_Home.webp` in both frames; swap
  brief written 29 July, never executed. File is `html/home.html`.
- AUSTIN_SPACE case-study hub row has no mobile asset.
- `.as-btn--white` computes pink; the class name is a lie. Confirmed - base rule
  was deleted in the Allsorts retirement, and `:root .as-btn--white`
  (`css/master-stylesheet.css:5881`) sets `background: var(--candy-pink)`.
- `json/services/5-support.json:24` canonical points at a URL that 301s.
- `wave-clip-contact` has uneven crests 0.72/0.77/0.79/0.76.
- **7** empty CSS rule bodies, in both the master and the panel.
  **[corrected 1 Aug, post-retirement]** - this was 8 until the section 10 pass.
  `.as-cs-beforeafter__inner` was simultaneously one of the 8 and one of the 18
  sole `beforeafter` rules, so it left with its block. The survivors are
  `.as-creds__item`, `.as-backstory__inner`, `.as-casestudy`,
  `.as-svc-included__inner`, `.as-svc-process__inner`, `.as-cs-solution__inner`,
  `.as-about-work__inner`.
- Hover state is still not captured by the harness. Dispatched pointer events do
  not set `:hover`. 80 of CC's 86 cascade regressions were hover-state, and
  `.as-btn` / `.as-offer` / `.as-card-lift-*` / `.as-pos-card` all express
  themselves on hover. Needs the cascade model read from the repo and asserted
  against, not live capture.

**Closed on re-check 1 August** - these were carried forward from v3 and are no
longer true. **[corrected 1 Aug]**

- ~~Footer strip heights inconsistent: contact 130px, other twelve 102px.~~
  All **thirteen** `.as-hero--*-footer` strips are 130px. The string `102px`
  does not appear anywhere in the panel. Uniform, nothing to fix.
- ~~Untracked `html/case-studies-terracotta-property - old copy.html` and stale
  `css/master-stylesheet-backup.css`.~~ Neither file exists on disk, and
  `git ls-files --others --exclude-standard` returns empty. Tree is clean.
- ~~`.as-cs-phase*` and `.as-cs-beforeafter*` are dead, held for their own
  pass.~~ **Done - see section 10.** 47 sole rules deleted, 5 selector trims,
  6 comments reworded. Panel 129,585 -> 124,575.
- ~~v2 and v3 handoffs are uncommitted, in `~/Downloads` only.~~ Archived to
  `docs/superseded/` in `fa5ea01`, each with a header retracting its own panel
  size ceiling figure.

New:

- **`docs/austinspace-spacing-desktop-spec.md` predates the section 10
  retirement** and refers to `.as-cs-phase*` / `.as-cs-beforeafter*` as live
  components. **This is correct and must not be edited.** It is a dated
  historical spec; docs record what was true when they were written, and only
  the CSS has to be true now. Noted here so the next repo-wide grep for those
  families finds an explanation rather than a loose end.
- **`.as-build-canary` is panel-only**, applied during the build, not authored
  in source. Confirmed - present as the last line of the panel, absent from the
  master. It must be bumped every pass or paste verification is blind. It went
  stale through the accordion pass for exactly this reason. In practice the
  build bumps it automatically whenever the source hash changes, so it only
  needs attention on a no-op rebuild.
- The canary date stamps UTC, so a build run after midnight BST carries the
  previous day's date. Cosmetic.
- ~116 `as-*` classes had no match in a local HTML corpus, but the list is
  contaminated and is **not** a delete list. A real unused-selector audit needs a
  repo-wide grep plus runtime-injected class names, and is its own pass.
- 141 groups of identical rule bodies under different selectors, worth ~19,000
  bytes if merged. **Not recommended** - merging changes cascade position, the
  same objection that blocked the 26 partial-pair merges. Unnecessary now that
  minification freed the space.

---

## 10. Retirement of `.as-cs-phase*` and `.as-cs-beforeafter*`

Shipped 1 August 2026. Harness **48/48**, `nonExpected: []` on every page at
every width, all four case-study pages fully clean at 1505. Verified on the
external display at dpr 1 - see section 4.

`.as-cs-gallery` and `.as-cs-results` had already replaced both components in
the markup. Zero hits in `html/` and `json/` before the pass, re-confirmed at
the moment of starting rather than trusted from the earlier scan.

**What changed**

| | count |
|---|---|
| sole rules block-deleted | 47 (29 phase, 18 before/after) |
| shared rules selector-trimmed | 5 |
| comments reworded | 6 |
| comments deleted with their blocks | 6 |
| at-rule blocks left empty | 0 |
| panel bytes | 129,585 -> **124,575** (-5,010) |
| master bytes | 286,243 -> 278,792 (-7,451) |
| `proveInert` rules | 1,198 -> 1,151 |

The rule delta is exactly the 47 deletions, which is the cheapest available
proof that nothing was merged or lost beyond the plan.

**The five shared rules were the whole risk.** Each needed a selector trim with
its body and co-tenants kept. Block-deleting any of them would have been a live
regression on pages the retired components never touched:

| rule | trimmed | live co-tenants kept |
|---|---|---|
| `@media (max-width:480px)` | `.as-cs-beforeafter` | 5 - the whole case-study mobile padding |
| `@media (max-width:1280px)` | `.as-cs-beforeafter` | **16**, spanning nearly every section on the site |
| `@media (max-width:1280px)` | `.as-cs-beforeafter__header` | 4 |
| unscoped | `:root .as-cs-phase__title` | 4 - **the Exo-trap heading rule** |
| `@media (min-width:481px)` | `:root .as-cs-beforeafter` | 1, so the list is now single-selector |

The Exo-trap rule was checked separately on a live page after the paste: all
four surviving case-study heading classes compute Fraunces. Worth keeping as a
standing check on any pass that touches a shared heading rule, because a
`font-family` regression surfaces in the harness as a wall of geometry diffs
with no obvious cause.

**Comments: reword, do not delete.** The original brief said to delete stale
comments. That is right for the satisfied-deferral case - a comment describing
work now done sends the next session chasing finished work. It is wrong for a
live rule whose comment explains *why it is the way it is*, where the reasoning
is the asset and only the cross-reference has died.

Six such comments were rewritten rather than dropped, and **none of them names
the retired selectors**. A comment saying "see `.as-cs-phase`" is worse than no
comment: the next person greps, finds one hit in a comment, and cannot tell
whether it is stale or whether they are missing something. The components are
described in prose with their retirement date instead.

`css:7687` also carried a `css:7630-7678` line reference. Those line numbers
were already wrong before this pass and would be wrong again after the next
one, so they were dropped entirely rather than updated. **Describe the thing,
not its address** - that comment now names the live copy to compare against
(`.as-cs-row__image` / `__phone`) instead of a line range.

**One claim caught before it shipped.** A draft of the `css:7030` reword
asserted the heavy `0 14px 40px rgba(0,0,0,.75)` shadow survived only on the
case-study hub row. Grep says it also survives on `.as-casestudy__card`. Both
are named in the committed comment. Same failure mode as section 8, caught by
checking a claim at the moment of writing it rather than after.
