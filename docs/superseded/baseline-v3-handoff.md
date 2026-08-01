> # SUPERSEDED - archived 1 August 2026. Do not act on this document.
>
> Superseded by **`docs/baseline-v4-handoff.md`**. Read v4. Archived unedited
> below the line for the record; nothing in it has been corrected in place.
>
> ## RETRACTED: the Custom CSS panel size ceiling
>
> Section 1 below records `Headroom 52,137 -> 53,272`. That "headroom" derives
> from a ~200,000-byte Custom CSS panel limit. **That limit does not exist and
> was never tested.** Any byte-budget reasoning in this document is void.
>
> The panel compiles as **LESS**, not CSS. What actually fails a paste is any
> `calc()` whose contents include a `var()` - it aborts the whole compile
> silently and deploys a ~500-byte stub. Size is not the variable. The disproof
> is non-monotonic: a 129,545-byte file failed while a 147,997-byte file saved.
>
> A later brief hardened this into a ~148,000 figure presented as measured
> fact. That was the same error with a tighter number: the binary search behind
> it was confounded, because every failing sample happened to contain
> `calc(var())` and every passing one did not.
>
> See **v4 section 2c** for the full retraction and 2d for the build guard.
> `build-css.js` no longer gates on bytes and nothing reports "headroom".

---

# AUSTIN_SPACE - baseline v3 handoff

Written 31 July 2026, late evening. Commit to `docs/baseline-v3-handoff.md`.

SUPERSEDES `baseline-v2-handoff.md`. v2 remains correct on capture, v1 audit, and
the shadow-deletion pass. This document corrects v2's scope section, adds two
environmental preconditions v2 did not know about, and records the first
non-inert change the harness has ever validated.

---

## 1. Status

Two passes shipped tonight, both verified live, BOTH STILL UNCOMMITTED at time of
writing. The remote is at `20260731-c26066` and knows about neither.

**Pass 1 - details-accordion retirement.** 11 sole rule blocks deleted, 3 selector
trims, 4 comment edits. Panel 147,863 -> 146,728 (-1,135). Master -1,209.
Headroom 52,137 -> 53,272. Harness: 46/48 clean zero, the two exceptions being
homepage cells damaged mid-session and since repaired (section 4).

**Pass 2 - FAQ mobile collapse.** 73 pairs across 12 files converted from
`div`/`p` to `details`/`summary`, 8 new CSS rules, one site-wide script in
`html/_global/header-code-injection.html`. Build id `20260731-a4d1e8`.
Harness: 48/48 as predicted, ZERO property changes anywhere.

Baseline v2 itself is unchanged and still valid: 16 pages x 3 widths, 96
localStorage keys, probe at `tools/baseline-v2-probe.js`.

---

## 2. Environmental preconditions - NEW, and non-negotiable

v2 did not record these. Both were discovered the hard way tonight, and each one
independently produces diffuse false diffs that look exactly like a real CSS
regression.

**Display: the 2560x1440 external monitor, `devicePixelRatio` 1.** On the
MacBook Air panel (dpr 2) Chrome snaps layout to half pixels instead of whole
pixels. Text line boxes gain 1-2px of height while widths stay identical, and
fractional grid tracks round differently. Symptom: scattered geometry changes on
text-bearing flex containers (footer link lists, form rows, CTA action rows)
with `props: []` on almost all of them, plus one or two `gridTemplateColumns`.

**macOS Show scroll bars: Always.** Classic scrollbars give `cw = vw - 15`
(1490 / 753 / 360). Overlay scrollbars give `cw = vw`. Symptom: a flood of
`marginLeft`/`marginRight` at 1505 (every `.as-container` auto margin moves by
7.5px) which becomes `gridTemplateColumns` below 1160 where containers fill
instead of centring.

Assert both before any diff. The harness records `cw` in its meta but never
checks it, and does not record dpr at all:

```js
if (window.devicePixelRatio !== 1) throw new Error('wrong display');
// then confirm cw is 1490 / 753 / 360 against a reference page
```

Diagnostic that distinguishes environment from regression: environmental drift
gives `gone: 0, added: 0` with changes spread across unrelated pages including
ones the edit cannot touch. A real regression is scoped to the components you
edited.

---

## 3. Harness corrections

**`page()` WRITES UNCONDITIONALLY.** `localStorage.setItem` at probe line 234,
no dry-run flag. Calling it to inspect its return shape overwrites that cell of
the baseline. This cost two cells tonight. A `page(path, w, {save:false})`
option would make the capture primitive safe to inspect.

**`diff()` is read-only.** Reads the baseline, opens a frame, compares in
memory. Safe to repeat indefinitely.

**The sig is `tagName.classList`.** Any change of element tag registers as
`gone` plus `added`, even when the rendering is pixel-identical. This is
expected behaviour, not a fault, and must be predicted in advance for any
markup conversion.

**Box hashes are brute-forceable but not always as `WxH`.** The technique
recovered `.as-footer__links` as `548x166` against a live `548x168`, but failed
on `div.as-cs-v2` across a 6,500px search range. Where it fails, a direct A/B
measurement on a single load is better evidence anyway: load the page, measure,
mutate the DOM, measure again.

**Suggested probe changes, none made yet:**
1. record `devicePixelRatio` in the meta
2. `diff()` asserts stored `cw` and `dpr` against live, aborting loudly on
   mismatch - either guard would have caught tonight's drift on call 1 instead
   of call 12
3. `page()` gains a no-write option

---

## 4. The two damaged cells, and their repair

`/@1505` and `/@375` were overwritten by an exploratory `page()` call made while
the environment was in the wrong state (overlay scrollbars, dpr 2). `/@768`
survived.

Repaired once the correct environment was restored, and the repair
self-validates: recaptured `docH` came back 6,499 at 1505 and 12,012 at 375,
matching v2's recorded figures to the pixel, with `els` 304 and `gr` 173
identical across all three widths. Round-trip diffs return zero.

Cause and correctness are therefore both established. No action outstanding.

---

## 5. Pass 1 - details-accordion retirement

The `<details>`-based FAQ component (`.as-faq__item`, `__question`, `__answer`,
`__list`, plus `[open]` and `::-webkit-details-marker` pseudo rules) was retired
when Charles moved expanded FAQs to the black editorial band. Repo-wide grep of
`html/` returned zero references.

Shape of the edit: 11 sole blocks block-deleted, 3 selector trims where the class
sat in a shared list, 3 comment rewrites plus 1 orphaned comment.

**The trap, for next time.** `:root .as-faq__item {` was the LAST selector in its
list and carried the opening brace. Deleting that line alone strips the `{` and
breaks the block - which in the Squarespace panel fails silently. It needed the
preceding `:root .as-row-item,` rewritten to `:root .as-row-item {` in the same
edit. Always check whether a trimmed selector is list-final.

**Shared-selector rate held at roughly 1 in 5 here.** Three of the blocks that
name-matched `as-faq__` had to be left completely alone (`__headline` x2,
bare `.as-faq`), and one trim (`:root .as-faq__answer,`) had six live
co-tenants. A grep-and-delete would have stripped body copy off unrelated
selectors across the contact page and hub.

---

## 6. Pass 2 - FAQ mobile collapse

**Decision: ship `<details open>` plus a script that strips `open` below the
breakpoint and restores it above.** CSS alone cannot do expanded-desktop /
collapsed-mobile, because a closed `<details>` hides its content at UA level and
no media query can reopen it. Shipping open means a script failure degrades to
"mobile users see everything" rather than "mobile users see nothing".

**Breakpoint 860px**, reusing the existing one where `.as-faq__qa` already drops
to `column-count: 1`. This collapses tablet as well as mobile, deliberately - at
768 the FAQ is already single-column and just as tall a wall of text as at 375.

**Desktop gets `pointer-events: none`** so a desktop visitor cannot collapse a
question and contradict the editorial band. Verified: `nChanged: 0` and
`props: {}` on all twelve pages at 1505.

**Flash-of-expanded is measured and immaterial.** The nearest FAQ section to the
top of any page at 375 is `/contact` at 3,384px, 4.2 viewports below the fold.
Furthest is custom-build at 10,966px. No mitigation needed.

**Measured savings at 375:**

| page | before | after | saving |
|---|---|---|---|
| `/contact` | 6,846 | 5,954 | 892px, 13.0% |
| Terracotta `.as-cs-v2` | 13,589 | 11,935 | 1,654px, 12.2% |

FAQ sections were 18.7% to 28.8% of mobile page height; only the answers are
recoverable, so 12-15% is the realistic figure.

---

## 7. `.as-faq--dark` IS TWELVE PAGES, NOT FOUR OR EIGHT

This was the session's worst error and it was Claude's. The collapse brief
asserted eight FAQ pages and named the four case-study detail pages as having no
FAQ at all. CC caught it. All four carry a full `.as-faq.as-faq--dark` section
with six pairs each.

**The twelve, with pair counts:**

| file | pairs |
|---|---|
| `html/about.html` | 5 |
| `html/contact.html` | 5 |
| `html/services/1-services-hub.html` | 7 |
| `html/services/2-one-page.html` | 7 |
| `html/services/3-custom-build.html` | 8 |
| `html/services/4-refresh.html` | 6 |
| `html/services/5-support.html` | 6 |
| `html/case-studies/1-case-studies-hub.html` | 5 |
| `html/case-studies/2-terracotta.html` | 6 |
| `html/case-studies/3-ddr-ltd.html` | 6 |
| `html/case-studies/4-austin-space.html` | 6 |
| `html/case-studies/5-gypsy-pistoleros.html` | 6 |
| **total** | **73** |

**The genuinely FAQ-free set is four pages:** `/` and the three policy pages.

**Why it happened.** The four case-study files had been sitting in the working
directory for hours, fetched and read for a different purpose. The assertion was
made from recollection rather than from a grep. This is the third repetition of
the same lesson in this project's history: a scan you did earlier for another
reason is not a check. Grep at the moment of asserting.

---

## 8. Repo path convention - Claude got this wrong twice

Files are at `html/<section>/<n>-<slug>.html`, not flat. Claude probed flat
filenames, got 404s, and twice told Charles that files were missing from the
remote when they were present under the numbered convention.

```
html/home.html, html/about.html, html/contact.html
html/services/{1-services-hub,2-one-page,3-custom-build,4-refresh,5-support}.html
html/case-studies/{1-case-studies-hub,2-terracotta,3-ddr-ltd,4-austin-space,5-gypsy-pistoleros}.html
html/_global/{header-code-injection,footer-injection,footer}.html
json/services/{1..5}-*.json
tools/baseline-v2-probe.js
css/master-stylesheet.css, css/master-stylesheet.panel.css
```

`docs/` HAS NEVER BEEN PUSHED. Every spec document lives only on Charles's
machine. This is the same failure that lost v1's probe, and it is why v2's
morning doc was superseded. **Push `docs/`.**

Unverified observation: `html/_global/footer-injection.html` contains 55 unique
`wave-clip-*` ids. Earlier notes say 38. Worth confirming which is right; not
investigated tonight.

---

## 9. Mobile pass - corrected scope

v2 section 5 listed three items. Two are now closed and the third is unstarted.

**CLOSED - 375/320 verification.** All targets pass with `docOverflow: 0` at both
widths, using an ancestor-aware check that skips elements inside
`overflow:hidden` ancestors:

- case-study hero phone card overhang: single column below 960px, phone card
  right edge 356 inside cw 360 at 375, and 298 inside 305 at 320. Overhangs into
  the page margin as designed without breaking the viewport.
- `/contact`, `/services/squarespace-site-refresh`,
  `/services/squarespace-support-retainer`: clean.
- The only flagged elements are Squarespace-native and identical on every page:
  `a.header-skip-link` parked at L-16000, and two `div.header-menu-nav-folder`
  drawers parked one viewport right. No `.as-*` element breaks the viewport
  anywhere.

**CORRECTION: the case-study hero DOES have a mobile pass.** Claude asserted it
had no media-query rules at any breakpoint, from a scan whose brace-depth
tracking was broken. It has three:

```
@media (max-width: 1280px)  gap 3.5rem, hero padding 2rem
@media (max-width:  960px)  .as-cs-hero__inner { grid-template-columns: 1fr }
                            .as-cs-hero__right { position: static }
@media (max-width:  480px)  section padding to mobile tokens
```

Use a block-aware matcher for any multi-line selector list. A line-oriented grep
inside `@media` blocks will produce false negatives.

**CLOSED - FAQs collapsed by default.** Pass 2 above.

**OPEN - scrollable card sections.** Not started. There is no existing idiom to
extend: zero `overflow-x: auto|scroll`, zero `scroll-snap-*`, zero
`-webkit-overflow-scrolling` in either stylesheet. Genuinely a build from
scratch.

**Still true from v2:** every new rule needs the `:root ` prefix, never
`:where(:root)`. The harness is 15px narrow at mobile (iframe at 375 gives
clientWidth 360) - fine for regression detection, wrong for judging how
something looks; use 390 or DevTools device emulation.

**Still true, still unaddressed:** hover state is not captured. Dispatched
pointer events do not set `:hover`. 80 of CC's 86 cascade regressions were
hover-state, and `.as-btn` / `.as-offer` / `.as-card-lift-*` / `.as-pos-card`
all express themselves on hover. Needs CC's cascade model read from the repo and
asserted against, not live capture.

---

## 10. Per-property attribution - NOW EXERCISED

v2 section 4 listed this as never trialled and said to treat the first non-zero
diff with suspicion. Pass 2 was that trial. The expectation was written into the
brief BEFORE the run and the outcome matched.

Predicted: twelve pages show `gone: [div.as-faq__pair, p.as-faq__q]`,
`added: 2`; 1505 shows nothing further; four pages clean zero.

Observed, exactly that, plus one conservative miss in Claude's favour: the
prediction assumed everything below the FAQ would shift as `docH` dropped. It
did not. `nonFaqChanged: []` on the eight non-case-study FAQ pages, because the
FAQ sits late enough on every page that nothing follows it. The four case-study
pages showed one extra element, `div.as-cs-v2`, the wrapper containing the FAQ,
confirmed by direct A/B as height-only with width identical at 360.

**ZERO property changes across the entire 48-cell run.** The harness is now
trusted for markup conversions as well as inert deletions.

---

## 11. Open items carried forward from v2

Unchanged, none addressed tonight:

- Homepage phone card still serves `Terracotta_Home.webp` in both frames; swap
  brief written 29 July, never executed. File is `html/home.html`.
- AUSTIN_SPACE case-study hub row has no mobile asset.
- `.as-btn--white` computes pink; the class name is a lie.
- `json/services/5-support.json:24` canonical points at a URL that 301s.
- Footer strip heights inconsistent: contact 130px, other twelve 102px.
- `wave-clip-contact` has uneven crests 0.72/0.77/0.79/0.76.
- Untracked `html/case-studies-terracotta-property - old copy.html` and stale
  `css/master-stylesheet-backup.css` both want binning.
- 8 empty CSS rule bodies, harmless, removable as a separate pass.
- The 5 conservatively-missed shadowed declarations.
- One non-ASCII character in `tools/baseline-v2-probe.js` line 303: a `x` sign
  in the diagnostic string `' script x'`. Confirmed harmless, no action.

Closed since v2:

- `.as-cs-hero__link` full-column stretch: `align-self: flex-start` is already
  present twice, in the base rule and again under `:root .as-cs-v2`. The second
  is a redundant restatement, a cleanup candidate but not a bug.

New:

- `.as-build-canary` lives in `panel.css` ONLY, not master - it is applied
  during the comment-strip build, not authored in source. Because both passes
  hand-edited the two files rather than regenerating panel from master, the
  stamp does not move on its own and must be bumped by hand every pass. It went
  stale through pass 1 and was unusable for verifying that paste. Bumped in pass
  2 to `20260731-a4d1e8` and confirmed working. **Automating the comment-strip
  as a build step would fix this and the two-file divergence risk together.**
