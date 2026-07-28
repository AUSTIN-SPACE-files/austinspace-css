# Repo restructure: html/ and json/ into nav-ordered folders

**Goal:** the file tree reads in the order the site is navigated, not alphabetically. Numeric prefixes because VS Code sorts alphabetically and offers no custom-order setting, so nav order has to be encoded in the filenames.

**Nothing in `css/`, `tools/`, `docs/`, `memory/` or `backups/` moves.** Only `html/` and `json/` are restructured, plus two deletions and a `css/` tidy.

---

## PHASE 0 — investigate only. No edits. Report and stop.

Paste raw command output. Do not summarise.

1. `git ls-files html/ json/` — the tracked set. Anything in those directories NOT in that list is untracked and needs `mv` plus `git add` rather than `git mv`.

2. Full listing of `html/` and `json/` on disk, so the mapping below can be checked for files it does not account for. Report any file present on disk but absent from the mapping table, and any mapping row whose source file does not exist.

3. Grep the whole repo, including `docs/`, `tools/`, `.claude/`, `memory/` and any README, for references to the old paths. Search for each of these strings and report every hit with file and line number:

```
html/case-studies-
html/services-hub
html/one-page-website
html/squarespace_
html/ongoing_support
html/policies-
html/header-code-injection
html/footer-injection
html/footer.html
html/core-rebuild
json/case-studies-
json/services-hub
json/one-page-website
json/squarespace-
json/ongoing-support
```

4. Confirm `html/core-rebuild.html` is tracked and unmodified against HEAD. It is a superseded working draft, already shipped into the custom build page, and is being deleted. Confirm history holds it before deleting.

5. Confirm whether `json/home.json` exists. The mapping assumes it does not.

6. List anything in `css/` that is not `master-stylesheet.css`, `master-stylesheet.panel.css` or `.panel-build.json`.

7. Confirm the working tree is clean at HEAD (`c838db4`). If anything is modified or staged, report it and stop — this restructure must start from a clean tree so the rename commit contains renames only.

**STOP.**

---

## PHASE 1 — the moves

Use `git mv` for every tracked file so history follows the rename. For untracked files use `mv` then `git add`. Create directories first.

Case sensitivity: macOS is case-insensitive, git is not. Every new filename is lowercase-hyphen. No underscores, no capitals, anywhere in the new names.

### html/

| from | to |
|---|---|
| `html/header-code-injection.html` | `html/_global/header-code-injection.html` |
| `html/footer.html` | `html/_global/footer.html` |
| `html/footer-injection.html` | `html/_global/footer-injection.html` |
| `html/services-hub.html` | `html/services/1-services-hub.html` |
| `html/one-page-website.html` | `html/services/2-one-page.html` |
| `html/squarespace_custom_build.html` | `html/services/3-custom-build.html` |
| `html/squarespace_site_refresh.html` | `html/services/4-refresh.html` |
| `html/ongoing_support.html` | `html/services/5-support.html` |
| `html/case-studies-hub.html` | `html/case-studies/1-case-studies-hub.html` |
| `html/case-studies-terracotta-property.html` | `html/case-studies/2-terracotta.html` |
| `html/case-studies-ddr-ltd.html` | `html/case-studies/3-ddr-ltd.html` |
| `html/case-studies-austin-space.html` | `html/case-studies/4-austin-space.html` |
| `html/case-studies-gypsy-pistoleros.html` | `html/case-studies/5-gypsy-pistoleros.html` |
| `html/policies-cookies.html` | `html/policies/cookies.html` |
| `html/policies-privacy.html` | `html/policies/privacy.html` |
| `html/policies-tos.html` | `html/policies/terms-of-service.html` |

Unchanged at top level: `html/about.html`, `html/contact.html`, `html/home.html`.

Deleted: `html/core-rebuild.html` (`git rm`).

### json/

| from | to |
|---|---|
| `json/services-hub.json` | `json/services/1-services-hub.json` |
| `json/one-page-website.json` | `json/services/2-one-page.json` |
| `json/squarespace-custom-build.json` | `json/services/3-custom-build.json` |
| `json/squarespace-site-refresh.json` | `json/services/4-refresh.json` |
| `json/ongoing-support.json` | `json/services/5-support.json` |
| `json/case-studies-hub.json` | `json/case-studies/1-case-studies-hub.json` |
| `json/case-studies-terracotta-property.json` | `json/case-studies/2-terracotta.json` |
| `json/case-studies-ddr-ltd.json` | `json/case-studies/3-ddr-ltd.json` |
| `json/case-studies-austin-space.json` | `json/case-studies/4-austin-space.json` |
| `json/case-studies-gypsy-pistoleros.json` | `json/case-studies/5-gypsy-pistoleros.json` |

Unchanged at top level: `json/about.json`, `json/contact.json`.

The html and json trees mirror each other exactly, so `html/services/3-custom-build.html` pairs with `json/services/3-custom-build.json` and the pairing is visible rather than remembered.

### css/ tidy

Delete `master-stylesheet.panel.css.handedited-*.bak` (both) and `ROLLBACK-panel-20260723.css`. Both are gitignored or untracked. If `ROLLBACK-panel-20260723.css` turns out to be tracked, report it and stop rather than deleting — a tracked rollback file is a deliberate artefact and not mine to bin.

---

## PHASE 2 — reference sweep

Update every hit found in Phase 0 item 3 to the new path. Report each edit with file, line number, old string and new string.

Do not rewrite paths inside `backups/` — those are point-in-time snapshots and their contents should stay as they were.

If `tools/build-css.js` references any moved path, update it and re-run `node tools/build-css.js --check` afterwards to confirm it still passes.

---

## PHASE 3 — audit

1. `git status --short` in full. Every moved file should show as `R` (rename) not as `A` plus `D`. If any show as add/delete pairs, git did not detect the rename and history will not follow — report before committing.
2. `git ls-files html/ json/` — confirm the new tree matches the mapping exactly, no strays, no missed files.
3. Confirm zero remaining hits for the Phase 0 item 3 search strings anywhere outside `backups/`.
4. `node tools/build-css.js --check` passes.
5. Confirm no filename anywhere in `html/` or `json/` contains an underscore or a capital letter.

---

## Commit

Renames only, no content changes, so this should be a clean rename commit:

```
git commit -m "Restructure html/ and json/ into nav-ordered folders

File tree now reads in site navigation order rather than alphabetically.
Numeric prefixes because VS Code sorts alphabetically with no custom order.

- html/ and json/ mirror each other exactly
- _global/ for the three injection files
- services/ and case-studies/ numbered in nav order
- policies/ grouped
- all filenames lowercase-hyphen, no underscores or capitals
- deleted core-rebuild.html, superseded draft already shipped into
  the custom build page, retained in history"
```

---

## Note for whoever reads this next

Nothing in `html/` or `json/` is ever served. These are source files for manual paste into Squarespace, so filenames carry no technical constraint and exist purely to be found quickly. That is why nav order beats URL-matching here.
