# Contact page: dark FAQ + proof closer

**Target:** https://www.austinspace.co.uk/contact
**Verified live:** 28 July 2026, Chrome MCP
**Scope:** contact page HTML + master stylesheet. No other page changes.

---

## What is being built

1. Contact's FAQ converts from the white accordion to the dark editorial variant already live on all eight other pages. Class swap plus markup transform, no new FAQ CSS.
2. A new closing section `.as-proof` is inserted after the FAQ. Centred: eyebrow, headline, blurb, then the Google review row with the Squarespace Circle badge stacked beneath it.
3. Section padding normalised on `.as-contact-hero` and `.as-contact-bar`.

Contact is currently the only page on the site that ends on its FAQ with no closing section. Every other page ends with a CTA band. The new `.as-proof` section fills that structural gap.

---

## PHASE 0 — investigate only. Make no edits. Report and stop.

Paste raw command output for every item. Do not summarise. Prior sessions have been burned by summarised audits.

1. Locate the contact page HTML file in `html/`. Report the path and the line numbers of the `<section class="as-faq">` block, opening tag to closing tag.

2. **The 224px override.** Grep both `css/master-stylesheet.css` and `css/master-stylesheet.panel.css` for `224` and for `collection-68f102ac56ba030aeb811c1a`. Live cascade on contact computes `.as-faq` at `96px / 224px` while all other pages compute `96px / 104px`, and it is not a `:last-child` rule (proven live by inserting a sibling after the FAQ and watching the 224 survive). Find the rule that scopes it. Report the full rule with line numbers and its complete selector list.

3. **The trust row rules.** Grep both stylesheets for `as-hero-combined__trust`. Report every rule containing any of those selectors, with line numbers, full selector lists and full rule bodies. Flag any that are written as descendant selectors rather than flat, and any whose selector list is shared with a class that is not part of the trust row.

4. Confirm `as-proof` appears nowhere in the repo. Expected count: zero, in HTML and both stylesheets.

5. From the homepage HTML file, report verbatim: the complete `<img>` tag for `.as-hero-combined__trust-badge` including its full `src`, and the complete opening `<a>` tag for `.as-hero-combined__trust-google` including `href`, `target` and `rel`. These get copied character for character. Do not retype them.

6. Report whether the padding rules for `.as-contact-hero` and `.as-contact-bar` are sole-selector or share their selector lists with other components. If shared, this becomes a selector trim, never a block edit.

7. Report current byte sizes of `css/master-stylesheet.css` and `css/master-stylesheet.panel.css`.

**STOP. Await approval before Phase 1.**

---

## PHASE 1 — HTML, contact page

### 1a. FAQ transform

Convert the existing `.as-faq` block to the dark editorial structure. **Preserve every question and answer string verbatim from the existing markup.** Do not retype the copy, do not rewrite it, do not fix anything in it. Transform the containers only.

From:

```
<section class="as-faq">
  <div class="as-faq__inner">
    <div class="as-faq__header">
      <div class="as-eyebrow"> ... </div>
      <h2 class="as-faq__headline">Common questions</h2>
    </div>
    <div class="as-faq__list">
      <details class="as-faq__item">
        <summary class="as-faq__question">QUESTION</summary>
        <p class="as-faq__answer">ANSWER</p>
      </details>
      ... 5 total
    </div>
  </div>
</section>
```

To:

```
<section class="as-faq as-faq--dark">
  <div class="as-faq__inner">
    <div class="as-faq__header">
      <div class="as-eyebrow as-eyebrow--on-dark"> ... </div>
      <h2 class="as-faq__headline">Common questions</h2>
    </div>
    <div class="as-faq__qa">
      <div class="as-faq__pair">
        <p class="as-faq__q">QUESTION</p>
        <p class="as-faq__a">ANSWER</p>
      </div>
      ... 5 total
    </div>
  </div>
</section>
```

Changes: `as-faq--dark` added to the section; `as-eyebrow--on-dark` added to the eyebrow; `__list` becomes `__qa`; each `<details class="as-faq__item">` becomes `<div class="as-faq__pair">`; each `<summary class="as-faq__question">` becomes `<p class="as-faq__q">`; each `<p class="as-faq__answer">` becomes `<p class="as-faq__a">`. The `<details>`/`<summary>` elements disappear entirely, so there is no accordion.

Keep the five pairs in their existing source order. Do not reorder them.

This is a multi-instance edit inside a single file. After the edit, paste raw grep output proving: five `as-faq__pair`, five `as-faq__q`, five `as-faq__a`, zero `as-faq__item`, zero `as-faq__question`, zero `as-faq__answer`, zero `<details`, zero `<summary`.

Reference implementation is live at `/services/squarespace-site-refresh` if you need to check structure.

### 1b. New proof section

Insert immediately after the FAQ section's closing `</section>`, before the footer wave block.

```
<section class="as-proof">
  <div class="as-proof__inner as-container">

    <div class="as-eyebrow as-proof__eyebrow">
      <div class="as-eyebrow__dot"></div>
      <span class="as-label">The receipts</span>
    </div>

    <h2 class="as-proof__headline">Checkable, not <em>claimed</em>.</h2>

    <p class="as-proof__body">Squarespace Silver Partner, working toward Gold. Client reviews published on Google under my own name. Nothing on this site is a self-assessment.</p>

    <div class="as-proof__marks">

      <a class="as-proof__google" [COPY href/target/rel VERBATIM FROM HOMEPAGE PER PHASE 0 ITEM 5]>
        <span class="as-proof__g"></span>
        <span class="as-proof__stars">
          <i class="fa-slab-duo fa-star fa-lg"></i>
          <i class="fa-slab-duo fa-star fa-lg"></i>
          <i class="fa-slab-duo fa-star fa-lg"></i>
          <i class="fa-slab-duo fa-star fa-lg"></i>
          <i class="fa-slab-duo fa-star fa-lg"></i>
        </span>
        <span class="as-proof__score">5.0</span>
        <span class="as-proof__sep">/</span>
        <span class="as-proof__meta">2 reviews on Google</span>
      </a>

      <img class="as-proof__badge" [COPY src VERBATIM FROM HOMEPAGE PER PHASE 0 ITEM 5] alt="Squarespace Circle Silver Partner" width="148" height="46">

    </div>

  </div>
</section>
```

Notes:
- `.as-proof__g` is an empty span. Its Google logo is a CSS `background-image` inherited via the selector addition in Phase 2. Do not add an `<img>`.
- The icon class is `fa-slab-duo`, not `fa-duotone fa-slab`. The latter silently falls back to single-tone black.
- There is no `__trust-rule` equivalent. The vertical hairline is dropped because the marks stack.

---

## PHASE 2 — CSS

Edit `css/master-stylesheet.css` (the commented authoring source) first, then apply the identical change to `css/master-stylesheet.panel.css` (the comment-stripped build Charles pastes). Both files must end the session in sync for this change. Report both byte sizes before and after, and headroom against the 200KB panel failure point.

ASCII-only in comments. No em dashes, no arrows. They break Squarespace's CSS parser and kill the entire stylesheet.

### 2a. Move the wave clearance off the FAQ and onto `.as-proof`

**Corrected after Phase 0. The original assumption in this spec was wrong.**

Both clearance rules use `:has(~ .as-hero--contact-footer)`, which is a **general** sibling combinator. Inserting `.as-proof` between the FAQ and the footer wave does **not** stop the FAQ matching — the wave is still a later sibling. If these rules are left in place the FAQ keeps its 224px and the page gains a second clearance below it. They must be retargeted, not merely superseded.

Two rules, both sole-selector, both confirmed safe to edit outright:

- `master-stylesheet.css:8028`, inside `@media (max-width: 480px)`: `.as-faq:has(~ .as-hero--contact-footer) { margin-bottom: 160px; }`
- `master-stylesheet.css:8050`, inside `@media (min-width: 481px)`: `.as-allsorts .as-faq:has(~ .as-hero--contact-footer) { padding-bottom: var(--as-clear-wave); }`

Plus their comment-stripped twins in `panel.css` at 6774 and 6786.

Change the subject of both selectors from `.as-faq` to `.as-proof`, keeping the `:has(~ .as-hero--contact-footer)` pattern, the media guards, the properties and the values exactly as they are. `margin-bottom: 160px` stays a margin on mobile; `padding-bottom: var(--as-clear-wave)` stays a padding on desktop. Do not convert one into the other and do not substitute a literal for the token.

Update the comment at 8024-8026 so it names `.as-proof` rather than the FAQ. Keep the note at 8042-8048 about the min-width guard and the specificity of three-class `:has()` selectors — that reasoning still applies verbatim to the new subject.

The FAQ then falls back to the standard `96px / 104px` that `.as-faq--dark` provides on every other page. Confirm by computing live, not by assuming.

Because the clearance now lives on these two rules, the `.as-proof` block in 2c must **not** declare its own `padding-bottom`. Declaring it in both places is how the value drifts.

### 2b. Selector additions for the ported marks

For each rule found in Phase 0 item 3, add the `.as-proof__` counterpart to the **same selector list**, leaving the rule body untouched. This is an addition, not a rename. The homepage keeps working unchanged.

| existing selector | add alongside |
|---|---|
| `.as-hero-combined__trust-google` | `.as-proof__google` |
| `.as-hero-combined__trust-g` | `.as-proof__g` |
| `.as-hero-combined__trust-stars` | `.as-proof__stars` |
| `.as-hero-combined__trust-stars i` | `.as-proof__stars i` |
| `.as-hero-combined__trust-score` | `.as-proof__score` |
| `.as-hero-combined__trust-sep` | `.as-proof__sep` |
| `.as-hero-combined__trust-meta` | `.as-proof__meta` |
| `.as-hero-combined__trust-badge` | `.as-proof__badge` |

Do **not** port `.as-hero-combined__trust` itself (the flex row with `gap: 28px`) or `.as-hero-combined__trust-rule`. `.as-proof__marks` supplies its own layout and the rule is dropped.

`master-stylesheet.css:491` is the one true descendant rule in the set and it is the one that carries `--fa-primary-color`, `--fa-secondary-color` and `--fa-secondary-opacity`. Without a `.as-proof__stars i` counterpart the ported stars render flat black instead of duotone sunshine. It was missing from the first version of this table; CC caught it in Phase 0.

Do not port the two `@media (min-width: 481px)` rules at 533 and 538. The first sets `gap: 28px; flex-wrap: nowrap` on `.as-hero-combined__trust`, which `.as-proof__marks` replaces with its own column layout. The second restores `.as-hero-combined__trust-rule`, which has no counterpart at all.

### 2c. New proof section rules

Place in the same region of the sheet as the other contact-page components.

```
/* PROOF CLOSER - contact page only. Closing section, sits between the dark
   FAQ and the footer wave.
   Bottom padding is NOT set here. The footer wave is position absolute,
   bottom 0, inside the page code block and overlaps the last section, so
   clearance comes from the guarded :has(~ .as-hero--contact-footer) rules
   further down the sheet. Do not add a padding-bottom to this block. */

.as-allsorts .as-proof {
  background: [MATCH THE WHITE USED BY THE NEIGHBOURING SECTIONS];
  padding-top: 112px;
  padding-left: var(--as-pad-side);
  padding-right: var(--as-pad-side);
}

.as-allsorts .as-proof__inner {
  text-align: center;
}

.as-allsorts .as-proof__eyebrow {
  justify-content: center;
}

.as-allsorts .as-proof__headline {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(2rem, 3.5vw, 3rem);
  line-height: 1.08;
  color: [MATCH EXISTING WHITE-BACKGROUND H2];
  max-width: 860px;
  margin: 24px auto 0;
}

.as-allsorts .as-proof__headline em {
  font-style: normal;
  color: var(--candy-pink);
}

.as-allsorts .as-proof__body {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: 18px;
  line-height: 1.72;
  color: var(--grey-500);
  max-width: 660px;
  margin: 20px auto 0;
}

.as-allsorts .as-proof__marks {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  margin-top: 56px;
}
```

Values needing resolution against the sheet rather than hardcoding:

- **Background.** `.as-contact-hero:2980` uses `var(--as-white)` while other rules elsewhere use `var(--white)`. Use whichever the sections immediately around `.as-proof` use, and report which.
- **Top padding.** 112px is a proposal, not a token. If a section-padding token fits the intent, use it and report the substitution. Do not invent a new token.
- **Headline colour.** Match whatever an existing H2 on a white background uses. `--ink-900` exists (`.as-hero-combined__trust-score:503` uses it) but confirm it is what the H2 layer actually uses before reaching for it. Report which rule you matched.
- `font-family` must be `var(--font-display)`, never `var(--font-heading)`. The service-page and case-study heading classes use `--font-heading` and render Exo. This one must be Fraunces.
- The `clamp(2rem, 3.5vw, 3rem)` is the sitewide H2 clamp shared by all 20 H2 classes. Use the clamp, not a hardcoded 48px.

### 2d. Mobile

Add a `@media (max-width: 480px)` block matching whatever mobile section padding `.as-faq` and `.as-contact-bar` use, and keep bottom padding at no less than 107px plus the mobile gap.

The Google row is 402px wide at desktop and will overflow a 375px viewport. Add `flex-wrap: wrap; justify-content: center;` to `.as-proof__google` inside the mobile guard. Row gap will need a value; propose one.

Guard desktop-only rules with `@media (min-width: 481px)` where they would otherwise leak.

### 2e. CUT. Do not implement.

This originally called for normalising `.as-contact-hero` to 32/96 and `.as-contact-bar` to 96/96, on the basis that 32/80 and 72/72 were off-token.

Phase 0 disproved the premise. `.as-contact-bar:4974` uses `var(--as-pad-ink) var(--as-pad-side)`, and `.as-contact-hero` sits in a six-class hero family at the 1280px breakpoint alongside `.as-svc-hero`, `.as-about-hero`, `.as-hub-hero`, `.as-cs-hub-hero` and `.as-cs-hero`. Both are already on-token and consistent with their families. The proposed change would have moved them off-token.

Leave `.as-contact-hero` and `.as-contact-bar` entirely alone, at all three breakpoints. Do not touch the shared 480px rule at 3361 or the shared 1280px rule at 4178.

The page rhythm problem is solved by the dark FAQ and the new closing section, not by padding.

---

## PHASE 3 — audit

1. Extract every top-level selector from HEAD's version of each stylesheet and from the working file. Diff the two selector lists. Account for every disappeared selector individually. Do not use raw `git diff` as proof — it misaligns in heavily edited regions and has previously rendered an intact component family as fully deleted.
2. Confirm every trimmed rule still has at least one selector.
3. Paste the grep output required by Phase 1a.
4. Report panel.css final size and headroom against 200KB.
5. Confirm zero em dashes and zero arrows in any comment added this session.

---

## Deploy sequence (Charles)

1. Contact page HTML into the page's code block.
2. `master-stylesheet.panel.css` into Squarespace Custom CSS, replace-all, Save.
3. Hard-refresh incognito. Cloudflare caches hard.
4. Verify panel save landed: `performance.getEntriesByType('resource')`, read `decodedBodySize` on `custom.css`. Far below source size means the paste truncated. The panel fails silently around 200KB — the editor shows the full text while the server saves a fragment.

## Live verification checklist (Chrome MCP)

Run `location.reload(true)` and wait 900 to 1500ms before any measurement. Stale CSS cache has produced false negatives before.

- `.as-faq` computes `rgb(23, 23, 26)` background and `96px / 104px` padding
- `.as-faq__qa` computes `column-count: 2`, `column-gap: 64px`
- Five `.as-faq__pair`, zero `details` inside `.as-faq`
- `.as-proof` computes white background, 112px top and 224px bottom (the token, arriving via the retargeted `:has` rule)
- The FAQ no longer matches any clearance rule: confirm `.as-faq` computes a 104px bottom, not 224px. This is the single most likely thing to go wrong, because the `:has(~ ...)` general sibling combinator still matches across the newly inserted section
- `.as-proof__google` and `.as-proof__badge` both centre on the container midpoint
- `.as-proof__stars i` computes font-family `Font Awesome 7 Slab Duo`, with `--fa-primary-color: #d69d1c`, `--fa-secondary-color: #fae9a6` and secondary opacity 1. Flat black means the descendant rule at 491 was not ported
- `.as-proof__g` computes a non-none `background-image`
- Footer wave overlaps the proof section's bottom padding by exactly 107px and does not cover the badge
- No horizontal page scroll
- `.as-contact-hero` still 32/80 and `.as-contact-bar` still 72/72, both unchanged

Screenshots are unreliable on this page. Use JavaScript measurement as ground truth. Do not trust box-shadow, opacity or anything mid-transition read from an unfocused MCP tab.

---

## Open, not in scope

- **FAQ column balance.** Multicol fills top-down, so the five pairs land 2 left / 3 right with the left column 71px short. Moving the second pair ("Do I need to know exactly what I want before getting in touch?", the tallest at 217px) to the right in source order evens it. Left alone deliberately pending a decision.
- **"2 reviews on Google".** The count is now hardcoded in two places, homepage and contact, and will drift. It is also the number a section headlined "Checkable, not claimed" points at. The blurb leads on the Silver Partner credential to keep the weight off it, but revisit when the count grows.
- 375px and 320px verification. `resize_window` cannot go below roughly 500px, so this needs DevTools device emulation on Charles's side.
