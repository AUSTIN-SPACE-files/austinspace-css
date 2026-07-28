CONTEXT

Building html/case-studies-gypsy-pistoleros.html, the fourth case study, on
the shared v2 template. Stage 0 and 0B are complete and cleared.

Method: clone html/case-studies-terracotta-property.html and replace content.
Do NOT author markup from scratch. The v2 inner markup is the thing being
preserved. Every class, attribute, ARIA role and inline script stays exactly
as it is on Terracotta unless this document says otherwise.

Copy is in the separate file gypsy-pistoleros-case-study-copy.md. Use it
verbatim. Do not rewrite, tighten or improve any sentence in it.

ASCII only in anything you write. Em dashes and arrows in CSS comments break
Squarespace's parser and kill the entire stylesheet.

PRE-CONDITION: the working tree must be committed before Stage 1 begins.
If git status is not clean, stop and say so.


=================================================================
STAGE 1 - BUILD
=================================================================

1. BACKUP

Back up nothing (the page does not exist yet), but create the backup
directory for Stage 2 rollback of the CSS and footer-injection edits:

  backups/cs-gypsy-pistoleros-YYYYMMDD-HHMMSS/css/master-stylesheet.css
  backups/cs-gypsy-pistoleros-YYYYMMDD-HHMMSS/html/footer-injection.html

Match the existing naming convention exactly.


2. CLIP DEFS - html/footer-injection.html

Append these two clipPath elements alongside the existing 33, following the
file's existing formatting. Do not reformat, tidy or "correct" the path data.
Do not touch any existing clip def.

<clipPath id="wave-clip-case-study-gypsy-pistoleros" clipPathUnits="objectBoundingBox">
  <path d="M0,0 L1,0 L1,0.44 C0.95,0.44 0.87,0.80 0.80,0.80 C0.73,0.80 0.65,0.38 0.58,0.38 C0.51,0.38 0.43,0.81 0.36,0.81 C0.29,0.81 0.21,0.39 0.14,0.39 C0.09,0.39 0.04,0.46 0,0.46 Z"/>
</clipPath>

<clipPath id="wave-clip-cs-gypsy-pistoleros-footer" clipPathUnits="objectBoundingBox">
  <path d="M0,0.30 C0.05,0.30 0.10,0.05 0.16,0.05 S0.27,0.32 0.33,0.32 S0.45,0.05 0.51,0.05 S0.63,0.32 0.69,0.32 S0.82,0.05 0.88,0.05 S0.97,0.29 1,0.29 L1,1 L0,1 Z"/>
</clipPath>

New total must be 35.


3. CSS - css/master-stylesheet.css ONLY

Do NOT hand-edit css/master-stylesheet.panel.css. It is derived. You will
rebuild it in step 6.

3a) Insert after line 4639 (.as-hero--case-study-austin-space aspect-ratio):

.as-hero--case-study-gypsy-pistoleros { aspect-ratio: 2880 / 300; }

3b) Insert after line 4667 (the austin-space per-page clip line):

.as-hero--case-study-gypsy-pistoleros .as-hero__img { clip-path: url(#wave-clip-case-study-gypsy-pistoleros); object-position: center 55%; }

3c) Append after the cs-ddr-footer block (currently ending near line 8570).
Comment is ASCII only, deliberately:

/* ============================================================
   CS GYPSY PISTOLEROS FOOTER STRIP - inverted top-edge cosmos.
   Scoped to /case-studies/gypsy-pistoleros ONLY. The footer strip
   markup lives in this page's own HTML, not the shared .as-cs-*
   template. Last element before the strip is the LIGHT
   .as-cs-page-cta, same as terracotta, so the wave emerges from
   off-white. Additive only.
   ============================================================ */
.as-hero--cs-gypsy-pistoleros-footer{
  position:absolute;
  left:0; right:0; bottom:0;
  width:100%; height:102px;
  border-top:0;
  border-bottom:5px solid var(--liquorice);
  overflow:hidden;
  background:transparent;
}
.as-hero--cs-gypsy-pistoleros-footer .as-hero__img{
  width:100%; height:100%;
  object-fit:cover;
  object-position:50% 70%;
  clip-path:url(#wave-clip-cs-gypsy-pistoleros-footer);
  display:block;
}
.as-hero--cs-gypsy-pistoleros-footer .as-hero__stroke{
  position:absolute; inset:0;
  width:100%; height:100%;
  pointer-events:none;
  z-index:1;
}

That is the complete CSS addition. If you find yourself needing any other
rule, STOP and report rather than adding it.


4. THE PAGE - html/case-studies-gypsy-pistoleros.html

Clone Terracotta, then apply the following. Section order is DELIBERATE and
differs from Terracotta.

4a) Wrapper: <div class="as-cs-v2"> with NO second modifier class. Follow
    austin-space, not terracotta. There is no .as-cs-gypsy-pistoleros rule
    and none is being created.

4b) Header hero:
    <div class="as-hero as-hero--case-study-gypsy-pistoleros">
    Stroke path, exactly as given, nothing else changed in the svg element:

    M100 45 C95 45 87 81 80 81 C73 81 65 39 58 39 C51 39 43 82 36 82 C29 82 21 40 14 40 C9 40 4 47 0 47

4c) Footer hero:
    <div class="as-hero as-hero--cs-gypsy-pistoleros-footer">
    Stroke path, exactly as given:

    M0 29 C5 29 10 4 16 4 S27 31 33 31 S45 4 51 4 S63 31 69 31 S82 4 88 4 S97 28 100 28

    Leave the img src on both heroes pointing at whatever Terracotta uses.
    Charles will swap the cosmos slice manually.

4d) SECTION ORDER, in document order:

    as-hero (header)
    as-breadcrumb
    as-cs-hero
    as-cs-stats
    as-cs-challenge
    as-cs-solution          <- the solution spine, 4 steps
    as-cs-solution          <- the roadmap, 3 steps, SECOND instance
    as-cs-gallery
    script
    as-cs-testimonial
    as-faq as-faq--dark
    as-cs-page-cta
    as-hero (footer)

    NOTE: as-cs-results is ABSENT. Do not include it.
    NOTE: the gallery moves AFTER the roadmap. This is not a mistake.
    NOTE: the inline gallery script must move with the gallery and stay
    immediately after it.

4e) Stats band, 4 items in this order:

    0          Lines of custom CSS inherited
    12,730px   Homepage length before
    8          Pages rebuilt
    24         Reviews structured

4f) Solution spine, 4 steps, markers fa-slab-press fa-1 through fa-4,
    matching austin-space. Content from the copy deck.

4g) Roadmap, SECOND .as-cs-solution section, 3 steps, markers
    fa-slab-press fa-1, fa-2, fa-3. Content from the copy deck's ROADMAP
    section. Each step's own header/title/body maps onto the same step
    structure the spine uses.

    Do NOT invent a status badge, pill, tag or icon for "delivered" versus
    "not started". The component has no such concept and the copy already
    carries it. If the structure seems to want one, leave it out.

4h) Gallery, 4 tabs: Home, Press kit, Videos, Store.
    Update the ids from the tcgal- prefix to gpgal-, consistently across
    button id, aria-controls, panel id and aria-labelledby.
    Update the captions array in the inline script to 4 entries matching
    the tabs.
    Leave img src attributes pointing at Terracotta's images. Charles will
    swap them.
    Intro line links to https://gypsypistoleros.com.

4i) IMMEDIATELY AFTER the existing <p class="as-cs-gallery__cap"
    data-gallery-caption> paragraph, add:

    <p class="as-cs-gallery__cap">Band photography by Jay Shredder.</p>

    This second paragraph MUST NOT carry the data-gallery-caption
    attribute. The inline script selects on that attribute and would
    overwrite the credit on every tab click.

4j) Testimonial:
    Quote: Just WOW! It looks stunning. Cannot thank you enough.
    Name: Lee
    Role: Gypsy Pistoleros
    REMOVE the .as-casestudy__quote-source anchor entirely. There is no
    Google review for this client yet. Do not substitute another link.
    Do not add any CSS to compensate for its absence.

4k) FAQ: 6 pairs from the copy deck.

4l) Hero link: include the .as-cs-hero__link "View live site" button as
    Terracotta has it, pointing at https://gypsypistoleros.com.


5. WHAT NOT TO TOUCH

- .as-casestudy__quote-source. LOCKED. Do not edit, reuse, or add any rule
  that could inherit onto it. It styles the Terracotta and DDR Google review
  links.
- The Terracotta and DDR testimonial blocks.
- Any existing clip def.
- Any existing .as-hero--* rule.
- css/master-stylesheet.panel.css by hand.


6. REBUILD

Run: node tools/build-css.js
Then: node tools/build-css.js --check

Report both outputs verbatim, including the new panel byte size and
remaining headroom against the 200,000 ceiling.

STOP HERE. Report and wait for approval before Stage 2.


=================================================================
STAGE 2 - AUDIT. ONLY AFTER I APPROVE STAGE 1.
=================================================================

Raw command output for every check. No summaries. No asserted counts.
Multi-instance checks inside one file have been reported wrongly on this
project before, so this is mandatory.

a) grep -c for as-cs-gallery__tab and as-cs-gallery__panel in the new file.
   Expected 4 and 4.

b) grep -n for as-cs-gallery__cap in the new file. Expected exactly 2 hits,
   and exactly ONE of them carrying data-gallery-caption. Paste both lines.

c) grep -n for as-casestudy__quote-source across ALL of html/. Expected: hits
   in case-studies-terracotta-property.html and case-studies-ddr-ltd.html
   ONLY, and ZERO in the new file. Paste raw output.

d) grep -c for 'class="as-cs-solution"' in the new file. Expected 2.
   Then paste the full class attribute of every <section> in the new file in
   document order, and confirm it matches 4d exactly.

e) grep -n for as-cs-results in the new file. Expected zero hits.

f) grep -c for wave-clip- in html/footer-injection.html. Expected 35.
   Then paste the two new clip defs verbatim from the file and confirm they
   are byte-identical to the ones in this document.

g) Paste both as-hero__stroke path d values from the new file and confirm
   byte-identical to 4b and 4c.

h) Paste every line in css/master-stylesheet.css containing
   gypsy-pistoleros, with line numbers. Confirm the total is exactly the
   additions in section 3 and nothing else.

i) Confirm .as-cs-terracotta count is still 0 in both stylesheets, and
   .as-cs-v2 counts still match between source and panel after the rebuild.

j) grep for every fa- class used in the new file. Confirm every one appears
   elsewhere in a LIVE page in html/. Explicitly flag any whose only other
   occurrence is in case-studies-austin-space-original.html or
   "case-studies-ddr-ltd - orig copy.html", as those are untracked backups
   and are NOT evidence the icon is in the kit.

k) Confirm no em dash, en dash or arrow character exists anywhere in the new
   file or in the CSS added. Paste the command used.

l) git diff --stat. Confirm only the expected files changed.


Report all twelve. Do not proceed to any further work.
