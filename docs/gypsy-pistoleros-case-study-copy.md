# Gypsy Pistoleros case study: copy deck

Slug: `/case-studies/gypsy-pistoleros`
Template: v2 (`as-cs-v2`)
Authorship framing: A (standard industry language)
Every figure below is evidenced. Sources noted in square brackets for your
records only. Strip the brackets before this goes into HTML.

---

## HERO

**Eyebrow:** Case study

**H1:** Nine pages of defaults.

**Desc:**
Gypsy Pistoleros bill themselves as the world's only glam punk goth 'n' roll
outlaws. Six albums, a European touring schedule, a merch operation, and a
website running on the platform template exactly as it shipped. This is the
stabilisation pass: a full structural and design rebuild carried out inside
Bandzoogle, without moving them off the platform their whole operation runs
on.

**Spec line (`.as-cs-hero__spec`, middot separated):**
Glam Punk Goth 'n' Roll · Worcester, UK · Bandzoogle · Phase 1 Stabilisation

**Media:** device pair, home after-capture in both frames (one-file-two-crops).

---

## STATS BAND

| Figure | Label |
|---|---|
| 0 | Lines of custom CSS inherited |
| 12,730px | Homepage length before [PDF capture, 14 May 2026, 2,560 wide] |
| 8 | Pages rebuilt |
| 24 | Reviews structured [reviews.json] |

---

## CHALLENGE

**H2:** Everything was centred.

**Body:**

The band had been on Bandzoogle for years and had never touched it. Not
badly configured. Untouched. Zero lines of custom CSS, no analytics, the
logo not in use anywhere, and every page running on the template exactly as
it shipped.

The result was a site where the design made no decisions on the band's
behalf, so the content had to fend for itself, and it could not.

Everything was centred. The press release, every review quote, the full tour
date list, the management and booking contacts, all running down the middle
of the screen at the same size and the same weight, full width, with no
hierarchy below the logo. The homepage ran to 12,730 pixels.

The videos page was ten full-width embeds stacked in a single column with
nothing grouping them by release. The members area, which is the band's
actual revenue tool, was one continuous page carrying the entire back
catalogue of video updates and photo albums with no way to navigate into it.
The store was a flat, undifferentiated product grid.

Of the nine pages, one was a navigation item that sent visitors off the site
entirely, to a third party distributor.

**The constraint:**

The obvious answer is to move platforms. That was never available. The
band's show scheduling and their fan club subscriptions both run natively on
Bandzoogle, and both were working. Moving would have meant rebuilding a
functioning revenue system to fix a presentation problem.

So the job was to build a modern site inside a platform that had no interest
in letting me, and to do it without breaking anything that was already
earning.

---

## SOLUTION SPINE (4 steps)

### 1. Get the stylesheet out of the platform

Bandzoogle's custom CSS field was rejecting my stylesheet and not saying so.
Two causes: an undocumented size ceiling, and a CSS validator old enough to
reject `pointer-events` and `::part()` as invalid. It had been silently
falling back to the last version it had accepted, which meant an unknown
number of earlier design passes had never actually been live.

Hosting the CSS in Bandzoogle's own file system was not an option either, as
it serves `.css` as `text/plain`.

So the stylesheet moved out entirely, to external hosting, loaded by a single
link in the site's head. The platform's CSS field has been empty ever since.
Every change since has deployed properly, and I can prove what is live.

### 2. Build as an override layer, not a replacement

The platform owns the cascade and does not give it up. The whole build is
anchored to a single container ID, which beats the theme on specificity
rather than carpet-bombing everything with `!important`. Where the platform
fought back with its own `!important` rules, the answer was a second anchor,
not a louder one.

That discipline is why the client can still edit the site in Bandzoogle's
own editor without any of it coming apart.

### 3. Give the content a structure it never had

The reviews, the shows and the video catalogue were all sitting as loose
text and embeds. Each became a data file with its own renderer: 24 reviews
structured and sorted, the tour dates rendered as a real table, and the
videos grouped by album with a facade pattern so the page is not loading ten
YouTube players before anyone has clicked one.

The store got the same treatment from the other direction. Rather than
replace the platform's commerce, I restyled the markup it emits, and used
its own section feature to split a flat grid into five categories: New in,
Music, Apparel, Accessories, and Signed & rare. The last of those is where
the stage-worn one-offs live, and it did not previously exist as a concept.

### 4. Ship it, break it, revert it

Two days after launch, roughly half of every page stopped rendering. It was
my code. I found it, told the client the same morning before they had
noticed, reverted the whole stylesheet to the last known-good deployment,
and had it back inside the hour.

I mention it because it is the reason step 1 matters. Being able to identify
exactly what was live, and roll back to a specific version of it, is the
difference between a bad morning and a bad week.

---

## GALLERY (4 tabs, before / after pairs)

- **Home** — before capture 14 May 2026, after capture current
- **Press kit** — before / after
- **Videos** — before / after
- **Store** — before / after

**Credit line beneath gallery:**
Band photography by Jay Shredder.

---

## TESTIMONIAL

**Quote:**
Just WOW! It looks stunning. Cannot thank you enough.

**Attribution:**
Lee, Gypsy Pistoleros

*No "View on Google" link on this one. Add it if the review lands before
publication.*

---

## ROADMAP

**H2:** What happens next.

**Body:**

Phase 1 was stabilisation. Structure and design, to get the site to a
standard the band's actual reputation deserves. It is delivered and live.

**Phase 2, Optimisation.** Search and performance. The site currently runs
on auto-generated page titles and meta descriptions, because nothing has
been done on that front yet. That work covers keyword research, page titles
and descriptions written properly, image sizing and alt text, structured
data including FAQ and review schema, and analytics. The 24 structured
reviews exist partly so this phase has something to work with.

**Phase 3, Design.** A full styling pass building on what Phases 1 and 2
put in place.

Stating that plainly is deliberate. Phase 1 did not touch search, so this
page does not claim it did.

---

## FAQ

**Why didn't you just move them off Bandzoogle?**
Because two things on it were working and earning. Their show scheduling and
their fan club subscriptions both run natively on the platform, and the fan
base is already inside it. Moving platforms to fix a presentation problem
would have meant rebuilding a functioning revenue system for no reason. The
right call was to make the platform do more than it wanted to. A migration
may make sense later, once there is a reason for it beyond design.

**What was actually wrong with the old site?**
Nothing was broken. It was untouched. Zero custom CSS, no analytics, the
logo unused, every page on the template defaults, and the entire body of
every page centre-aligned at one size. The homepage ran to 12,730 pixels.
Content that had never been given a structure was doing all the work on its
own.

**You mostly build on Squarespace. Why does this one look different?**
Because the platform was already chosen and staying. Most of my work is
Squarespace, but the underlying job is the same either way: work out what
the platform will and will not do, then decide what is worth fighting it
over. On this one that meant hosting the stylesheet externally and building
an override layer, which is not how you would ever start from scratch, and
is exactly right when you inherit something that works.

**The site went down after launch. What happened?**
My code, two days in. About half of every page stopped rendering. I found
the cause, told the band the same morning before they had spotted it, and
rolled the stylesheet back to the last known-good version. Back up within
the hour. It is on this page because how a build fails matters more than
whether it ever does.

**Is the work finished?**
Phase 1 is. Search, performance and analytics are Phase 2 and have not
started, which is why there are no traffic or ranking numbers on this page.
Anything claiming otherwise would be made up.

**Do you take on music and merch clients?**
Yes, and it is where I started. Before AUSTIN_SPACE I spent close to a
decade building and maintaining over 200 eCommerce stores for artists on
Shopify and Shopify Plus, including launches that peaked above 30,000
concurrent users.

---

## CTA

Standard sitewide component.

---

## FLAGS BEFORE THIS SHIPS

1. **Fix the booking email.** Lee instructed `info@thenewchurchrecords.com`
   twice, 8 June and 8 July. The live site shows `bookings@`.
2. **"est. MMXXVI"** is still in the footer and on the homepage strip.
   Visible in any screenshot published here.
3. **Nav / footer naming mismatch.** Nav says "Become a Member of The CULT
   of the Pistoleros!", footer says "The Inner Circle", same page.
4. **Decide on the pro bono fact.** It is not in this copy. Putting it in
   states publicly that the band received free work, so it needs a courtesy
   check with Lee first if you want it.
5. **The Jay Shredder credit line may be the only new CSS on the page.**
   The v2 template has no caption component that I know of. Have CC confirm
   rather than assume.
