---
name: JSON-LD structured data sync
description: When updating body copy that mirrors FAQ or page schema in JSON-LD files, include those updates in the plan by default
type: feedback
---

Always include JSON-LD structured data updates in copy rewrite plans without asking. When FAQ answers, page descriptions, or other body copy appears in both an HTML file and a corresponding JSON file (e.g. json/contact.json), flag what was found and update both in the same pass.

**Why:** The site has JSON-LD schema files that mirror body copy. Letting them diverge affects search appearance. User confirmed this pattern applies to all pages in the rewrite.

**How to apply:** For every page rewrite, check whether a matching JSON file exists under json/. If it contains text that mirrors copy being changed (FAQ answers, descriptions, etc.), include those changes in the plan automatically.
