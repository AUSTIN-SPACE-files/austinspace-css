> # SUPERSEDED - archived 1 August 2026. Do not act on this document.
>
> Superseded by `docs/superseded/baseline-v3-handoff.md`, in turn superseded by
> **`docs/baseline-v4-handoff.md`**. Read v4. Archived unedited below the line
> for the record; nothing in it has been corrected in place.
>
> ## RETRACTED: the Custom CSS panel size ceiling
>
> Section 1 below records `155,000 -> 147,863 bytes, headroom 52,137`. That
> "headroom" derives from a ~200,000-byte Custom CSS panel limit. **That limit
> does not exist and was never tested.** Any byte-budget reasoning in this
> document is void.
>
> The panel compiles as **LESS**, not CSS. What actually fails a paste is any
> `calc()` whose contents include a `var()` - it aborts the whole compile
> silently and deploys a ~500-byte stub. Size is not the variable. The disproof
> is non-monotonic: a 129,545-byte file failed while a 147,997-byte file saved.
>
> See **v4 section 2c** for the full retraction and 2d for the build guard.
> `build-css.js` no longer gates on bytes and nothing reports "headroom".

---

# AUSTIN_SPACE - baseline v2 handoff

Written 31 July 2026, evening. Commit to docs/baseline-v2-handoff.md.

SUPERSEDES the morning doc "baseline v2 spec + mobile pass handoff". That
version was never in the repo, which is the same failure that lost v1's probe.
Read this one. Where they disagree, this one is right, and section 2 says why.

---

## 1. Status

Baseline v2 is CAPTURED and PROVEN.

    16 pages x 3 widths (1505, 768, 375)
    96 localStorage keys, ~2.0MB, against ~4.5MB free on the origin
    1,921 groups / 3,567 elements at 1505
    probe: tools/baseline-v2-probe.js  (IN THE REPO - run it from there)

v1 is FULLY AUDITED and can be deleted at will.

    1,681 groups matched geometry exactly
       16 were body.as-allsorts, one per page, retired on purpose
    -----
    1,697 = v1's own stored total. Nothing unexplained.

The .as-allsorts retirement moved ZERO geometry on any page. That is now
verified against a pre-retirement baseline rather than assumed.

Shadow-deletion pass shipped: 296 dead bare declarations removed, panel
155,000 -> 147,863 bytes, headroom 52,137. Build id 20260731-c26066.
Verified zero property changes across all 48 page/width diffs.

Commits today: 4403ef3 (retirement, previously uncommitted), ab64d20
(shadow deletion), plus the probe itself.

---

## 2. Corrections to the morning doc - all verified, not argued

**resize_window is NOT floored at 500px.** It works. The morning claim came
from a measurement taken in a BACKGROUND tab, which never re-lays-out on
resize and keeps reporting its last layout. A hidden tab on this machine
reports innerWidth 2560 / clientWidth 2545 no matter what size the window is.
Check document.visibilityState before trusting any width reading.

**v1's capture viewport was 1505 x 1080, not "1440 x 900 requested".** Its own
doc recorded a resize that silently never took - the same background-tab
failure. Recovered by brute-forcing iframe height against v1's stored hero
hash: 813, 900 and 940 all produce 1q2xd0s; only 1080 produces v1's 1q2xd48.
The homepage hero is the only thing on the site that sizes off viewport
height, which is why it was the tell.

**"153 partial pairs, ~114 collapsible for ~4,500 bytes" was wrong.**
DUPLICATE pairs: 0, in both files. Not one pair was a pure restatement, so the
mechanical collapse that figure describes does not exist as an operation. The
real operation was per-DECLARATION shadow deletion: 296 declarations, 7,137
bytes off panel. The 26 PARTIAL pairs remain unmerged and are a separate
decision needing live probing, because merging them PROMOTES live declarations
from (0,1,0) to (0,2,0) and anything beating them at (0,1,1) would start
losing.

**v1's style column is gone forever, its geometry column is not.** The probe
that wrote v1 was authored in a Chrome MCP tool call and never saved. It is
absent from the working tree, all 363 git objects, every branch, the reflog,
stashes, ~/Downloads, ~/Documents and /tmp. The djb2 was RECONSTRUCTED and
proved correct by reproducing v1's stored boxHashes byte-for-byte, so geometry
compares. The 34-property list and its order are unrecoverable, so style does
not. The 46 style-only differences v1 recorded are now permanently closed
rather than merely unresolved.

---

## 3. Using the harness

Load it from the committed file, never from a paste buffer:

    const src = await fetch('https://raw.githubusercontent.com/'
      + 'AUSTIN-SPACE-files/austinspace-css/main/tools/baseline-v2-probe.js'
      + '?cb=' + Date.now()).then(r => r.text());
    (0,eval)(src);

Then: __ASB2.sweep(w, pages) to capture, __ASB2.diff(path, w) to compare,
__ASB2.attribute(sel, prop) for same-parent vs body clone attribution,
__ASB2.compareV1Box(path) while v1 still exists.

**Chunk to 6 pages per call.** The CDP bridge times out at 45s and each page
costs roughly 4s. Sixteen in one call fails.

**Return counts, never records.** Tool output truncates around 50KB. Do not
enumerate custom properties - Squarespace's token set alone blows the limit.

**Prove a paste landed with the canary, not decodedBodySize.** A synthetic
div.as-build-canary computes --as-build-id. gzip makes byte size useless.

---

## 4. What is proven and what is not

PROVEN: the harness returns zero on an unchanged site (pre-paste control, 5
page/width combinations), zero on a genuinely inert change (all 48 diffs after
the shadow deletion), and correctly attributed a real difference to
.as-hero-combined and its two children when the frame height was wrong.

NOT YET EXERCISED: per-property attribution on a change that alters a
property. Nothing changed in the shadow-deletion run, by design. The first
real mobile edit is its proper trial - treat the first non-zero diff with
suspicion until it has been confirmed by hand.

NOT CAPTURED: hover state. Dispatched pointer events do not set :hover, and
element.matches(':hover') stays false. 80 of CC's 86 cascade regressions were
hover-state, and .as-btn / .as-offer / .as-card-lift-* / .as-pos-card all
express themselves on hover, so this is a real blind spot. It needs CC's
cascade model read from the repo and asserted against, not live capture.

NOT WIRED: classToggleCount and panelBytes as standing assertions. The probe
covers classPresent, inlineScriptsWithClass and docH.

---

## 5. Mobile pass - scope and traps

Charles's list: scrollable card sections; FAQs collapsed by default to cut
page height; full tablet pass after mobile.

**Every new rule needs the `:root ` prefix.** Without it the rule sits one
class below the rest of the sheet and is beatable by Squarespace and Font
Awesome, which load after custom.css. Never `:where(:root)` - zero
specificity, silently reopens the vacuum.

**The harness is 15px narrow at mobile.** An iframe at 375 gives clientWidth
360, because Chrome draws a classic scrollbar inside it. Real phones use
overlay scrollbars. Fine for regression detection, wrong for judging how
something LOOKS. Use 390, or Charles's DevTools device emulation.

**Never verified at 375 or 320:** the case-study hero phone card -6% overhang,
/contact, and the two service-page editorial bands. A blunt overflow scan is
not enough - it flags intentionally offset elements sitting inside
overflow:hidden ancestors. The phone card needs a purpose-built check.

Page height at 1505 / 768 / 375 on the homepage: 6,499 / 8,579 / 12,012.

---

## 6. Open items unrelated to mobile

- Homepage phone card still serves Terracotta_Home.webp in both frames; swap
  brief written 29 July, never executed. File is html/home.html.
- AUSTIN_SPACE case-study hub row has no mobile asset.
- .as-btn--white computes pink; the class name is now a lie.
- .as-cs-hero__link stretches full column width; fix is align-self:flex-start.
- json/services/5-support.json:24 canonical points at a URL that 301s.
- Footer strip heights inconsistent: contact 130px, other twelve 102px.
- wave-clip-contact has uneven crests 0.72/0.77/0.79/0.76.
- Untracked "html/case-studies-terracotta-property - old copy.html" and stale
  css/master-stylesheet-backup.css both want binning.
- 8 empty CSS rule bodies: 6 pre-existing, 2 created by the shadow deletion
  (.as-creds__item in its 480px block, .as-casestudy). Harmless, deliberately
  left, removable as a separate pass.
- The 5 conservatively-missed shadowed declarations CC identified (`:root` with
  no media vs bare inside @media). Genuinely dead, left alone this pass, would
  need their own !important check first.
- One non-ASCII character in tools/baseline-v2-probe.js, believed to be an
  arithmetic sign in a diagnostic string. Harmless in JS. Find with:
  grep -nP "[^\x00-\x7F]" tools/baseline-v2-probe.js
