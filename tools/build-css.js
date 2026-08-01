#!/usr/bin/env node
/*
 * AUSTIN_SPACE stylesheet build
 *
 * Derives css/master-stylesheet.panel.css from css/master-stylesheet.css by
 * stripping comments and minifying whitespace. panel.css is a BUILD ARTEFACT.
 * Never hand edit it.
 *
 *   node tools/build-css.js              build
 *   node tools/build-css.js --check      verify in sync, exit 1 if not (no writes)
 *   node tools/build-css.js --no-minify  readable artefact, for diffing only
 *
 * Guarantees:
 *   1. panel.css is always derived, so the two files cannot drift
 *   2. Non ASCII characters are rejected before they can kill the parser
 *   3. Unbalanced braces are rejected before they can kill the parser
 *   4. calc() arithmetic on a var() is REJECTED -- see below, this one is fatal
 *   5. Minification is proven inert on every build, or the build fails
 *   6. A build canary is appended so a truncated paste is provable in one line
 *   7. Hand edits to panel.css are detected and reported before being clobbered
 *
 * THE PANEL COMPILES AS LESS, NOT CSS.
 *
 * Any calc() performing arithmetic on a var() fails the ENTIRE compile
 * silently and deploys a ~527 byte stub -- the whole site loses every custom
 * rule at once. Both calc(-1 * var(--x)) and calc(var(--x) * -1) fail.
 * Literal operands are fine: calc(100% - 56px) is confirmed safe by live test.
 * The trigger is var() INSIDE calc(), not calc() itself.
 *
 * Failure is SILENT and CATASTROPHIC: the editor redisplays the full text you
 * pasted while the server stores a stub. It presents as a total CSS bug, not a
 * save error. Diagnose by comparing decodedBodySize on
 * /custom-css/{site}/{id}/NNN/custom.css -- healthy is ~127000, a stub is <600.
 * The revision counter NNN still increments on a failed save, so it proves
 * nothing on its own.
 *
 * NOT the cause, each cleared by individual live test on 1 August 2026:
 * mask-image, mask-size, mask-repeat, scrollbar-width,
 * -webkit-overflow-scrolling, scroll-snap-type, ::-webkit-scrollbar,
 * minification, and FILE SIZE. An earlier binary search read a ~148000 byte
 * ceiling off these save failures; that was a coincidence of which test files
 * happened to carry a calc(var()). A 129,545 byte paste failed while a 147,997
 * byte paste saved. There is no known size limit. SANITY_CEILING below is a
 * loose backstop, not a measured constraint -- do not document it as one.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'css', 'master-stylesheet.css');
const OUT = path.join(ROOT, 'css', 'master-stylesheet.panel.css');
const LOCK = path.join(ROOT, 'css', '.panel-build.json');

// NOT a measured constraint. The ~148000 "ceiling" was a misdiagnosis of the
// calc(var()) LESS failure -- see the header. This is a loose backstop against
// runaway growth only, well above anything that has ever been pasted.
const SANITY_CEILING = 190000;

const CHECK_ONLY = process.argv.includes('--check');
const NO_MINIFY = process.argv.includes('--no-minify');

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;

function fail(msg) {
  console.error(red(`\nBUILD FAILED: ${msg}\n`));
  process.exit(1);
}

/* ---------- validation ---------------------------------------------- */

function checkAscii(src) {
  const bad = [];
  src.split('\n').forEach((line, i) => {
    for (let c = 0; c < line.length; c++) {
      const code = line.charCodeAt(c);
      if (code > 126 || (code < 9)) {
        bad.push({ line: i + 1, col: c + 1, ch: line[c], code });
        break;
      }
    }
  });
  if (bad.length) {
    console.error(red(`\n${bad.length} line(s) contain non ASCII characters.`));
    console.error('Em dashes and arrows in CSS break the Squarespace parser and kill the entire sheet.\n');
    bad.slice(0, 20).forEach((b) =>
      console.error(`  line ${b.line}, col ${b.col}: ${JSON.stringify(b.ch)} (U+${b.code.toString(16).toUpperCase().padStart(4, '0')})`)
    );
    if (bad.length > 20) console.error(`  ...and ${bad.length - 20} more`);
    fail('non ASCII characters present');
  }
}

/* Brace balance, ignoring braces inside comments and strings. */
function checkBraces(src) {
  let depth = 0, i = 0, line = 1, firstNegative = null;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '\n') { line++; i++; continue; }
    if (ch === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      if (end === -1) fail(`unterminated comment opened on line ${line}`);
      for (let k = i; k < end; k++) if (src[k] === '\n') line++;
      i = end + 2; continue;
    }
    if (ch === '"' || ch === "'") {
      const quote = ch; i++;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\') i++;
        if (src[i] === '\n') line++;
        i++;
      }
      i++; continue;
    }
    if (ch === '{') depth++;
    if (ch === '}') { depth--; if (depth < 0 && firstNegative === null) firstNegative = line; }
    i++;
  }
  if (firstNegative !== null) fail(`unbalanced braces: extra closing brace at or before line ${firstNegative}`);
  if (depth !== 0) fail(`unbalanced braces: ${depth} block(s) left open at end of file`);
}

/*
 * Reject calc() arithmetic on a var().
 *
 * This is the one that silently destroys the live site, so it is a hard fail
 * rather than a warning. Walks each calc( to its matching close paren, so
 * nested forms like calc(100% - var(--x)) and calc(var(--x) * -1) are both
 * caught regardless of depth. Literal-operand calc() is left alone.
 *
 * Run against the DECOMMENTED source so a calc() written inside an
 * explanatory comment cannot trip it, while line numbers still match the
 * authoring file (stripComments preserves newlines).
 */
function checkCalcVar(src) {
  const bad = [];
  const re = /calc\(/gi;
  let m;
  while ((m = re.exec(src)) !== null) {
    let depth = 0, j = m.index + m[0].length - 1;
    for (; j < src.length; j++) {
      if (src[j] === '(') depth++;
      else if (src[j] === ')') { depth--; if (depth === 0) break; }
    }
    const span = src.slice(m.index, j + 1);
    if (/var\(/i.test(span)) {
      bad.push({ line: src.slice(0, m.index).split('\n').length, span });
    }
  }
  if (bad.length) {
    console.error(red(`\n${bad.length} calc() expression(s) perform arithmetic on a var().`));
    console.error('The Squarespace Custom CSS panel compiles as LESS, not CSS. This fails the');
    console.error('ENTIRE compile silently and deploys a ~527 byte stub: every custom rule on');
    console.error('the site disappears at once, with no error shown in the editor.\n');
    bad.slice(0, 20).forEach((b) =>
      console.error(`  line ${b.line}: ${b.span.length > 90 ? b.span.slice(0, 90) + '...' : b.span}`)
    );
    if (bad.length > 20) console.error(`  ...and ${bad.length - 20} more`);
    console.error('\nFix: precompute the value as a literal token and reference that instead.');
    console.error('  bad:  margin-left: calc(-1 * var(--as-rail-bleed));');
    console.error('  good: --as-rail-bleed-neg: -32px;  margin-left: var(--as-rail-bleed-neg);');
    console.error('Literal-operand calc() such as calc(100% - 56px) is safe and allowed.');
    fail('calc() arithmetic on var() present');
  }
}

/* ---------- transform ------------------------------------------------ */

/* Strip /* *\/ comments without touching quoted strings or url() contents. */
function stripComments(src) {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      if (end === -1) fail('unterminated comment');
      // Preserve newlines inside the comment so line-ish structure survives.
      const chunk = src.slice(i, end + 2);
      const nl = (chunk.match(/\n/g) || []).length;
      out += '\n'.repeat(nl);
      i = end + 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < src.length && src[j] !== quote) {
        if (src[j] === '\\') j++;
        j++;
      }
      out += src.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

function tidy(src) {
  return src
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '')
    .trimEnd() + '\n';
}

/*
 * Whitespace minifier.
 *
 * A state machine, not regex substitution, because the two ways to destroy this
 * sheet are both context sensitive:
 *
 *   calc() REQUIRES spaces around + and -. calc(100%-56px) is invalid and the
 *   whole declaration is dropped. Paren depth protects it structurally, so no
 *   future calc() can be missed.
 *
 *   @media REQUIRES the space before its query and around and/not/only.
 *   Feature colons are inert: (max-width:480px) is valid.
 *
 * Quoted strings and url() are emitted verbatim. Selector context never loses a
 * descendant combinator. One newline per closing brace keeps the artefact
 * diffable for ~1300 bytes, which buys a reviewable git diff on the artefact.
 *
 * Never emit slash-form grid shorthand upstream of this: the panel silently
 * strips "grid-row: 1 / 2". The codebase uses longhand; keep it that way.
 */
function minify(src) {
  let out = '';
  let i = 0;
  const n = src.length;

  let inBlock = false;       // between { and } -> declaration context
  let parenDepth = 0;
  const parenFn = [];        // function name owning each open paren
  let atRulePrelude = false; // inside @media ... before its { or ;
  let pendingNL = false;     // newline owed after a closing brace

  const isWS = (c) => c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f';
  const last = () => out[out.length - 1] || '';
  const trimEnd = () => { while (out.length && out[out.length - 1] === ' ') out = out.slice(0, -1); };
  const flush = () => { if (pendingNL) { out += '\n'; pendingNL = false; } };

  while (i < n) {
    const ch = src[i];

    /* quoted string: verbatim, so braces and semicolons inside cannot confuse us */
    if (ch === '"' || ch === "'") {
      flush();
      const q = ch;
      let j = i + 1;
      while (j < n && src[j] !== q) { if (src[j] === '\\') j++; j++; }
      out += src.slice(i, Math.min(j + 1, n));
      i = j + 1;
      continue;
    }

    /* unquoted url(...): verbatim, minus internal whitespace */
    if ((ch === 'u' || ch === 'U') && /^url\(/i.test(src.slice(i, i + 4))) {
      const close = src.indexOf(')', i);
      if (close !== -1 && !/["']/.test(src.slice(i, close + 1))) {
        flush();
        out += src.slice(i, close + 1).replace(/\s+/g, '');
        i = close + 1;
        continue;
      }
      /* quoted url() falls through; the string branch handles its contents */
    }

    if (isWS(ch)) {
      let j = i;
      while (j < n && isWS(src[j])) j++;
      const prev = last();
      const next = src[j] || '';
      let keep;

      if (parenDepth > 0) {
        /* Operators inside calc() live here and MUST keep their spaces. A bare
           paren with no function name inside an at-rule prelude is a media
           feature, where the space after ":" is inert. */
        const bareFeature = atRulePrelude && parenFn[parenFn.length - 1] === '';
        keep = !(
          prev === '(' || prev === ',' || next === ')' || next === ',' ||
          (bareFeature && prev === ':')
        );
      } else if (atRulePrelude) {
        keep = !(
          prev === '(' || prev === ',' || prev === ':' ||
          next === ')' || next === ',' || next === '{'
        );
      } else if (inBlock) {
        keep = !(
          prev === '' || prev === '{' || prev === ';' || prev === ':' || prev === ',' ||
          next === '' || next === '}' || next === ';' || next === ':' || next === ',' || next === '{'
        );
      } else {
        /* Selector context. Descendant combinators are load bearing. */
        keep = !(
          prev === '' || prev === '}' || prev === '{' || prev === ',' || prev === ';' ||
          prev === '>' || prev === '+' || prev === '~' ||
          next === '' || next === '{' || next === ',' ||
          next === '>' || next === '+' || next === '~'
        );
      }

      if (keep) { flush(); out += ' '; }
      i = j;
      continue;
    }

    if (ch === '{') {
      flush(); trimEnd();
      out += '{';
      inBlock = true;
      atRulePrelude = false;
      i++; continue;
    }
    if (ch === '}') {
      flush(); trimEnd();
      if (last() === ';') out = out.slice(0, -1); // final semicolon is inert
      out += '}';
      pendingNL = true;
      inBlock = false;
      i++; continue;
    }
    if (ch === ';') {
      flush(); trimEnd();
      if (last() === ';' || last() === '{') { i++; continue; } // empty declaration
      out += ';';
      atRulePrelude = false;
      i++; continue;
    }
    if (ch === '(') {
      flush();
      const m = /([-\w]*)$/.exec(out);
      parenFn.push((m ? m[1] : '').toLowerCase());
      parenDepth++;
      /* In an at-rule prelude a space before "(" always follows @media, and,
         not or only, where it is REQUIRED. Everywhere else it is inert. */
      if (!atRulePrelude) trimEnd();
      out += '(';
      i++; continue;
    }
    if (ch === ')') {
      flush(); trimEnd();
      parenFn.pop();
      parenDepth--;
      out += ')';
      i++; continue;
    }
    if (ch === ',') {
      flush(); trimEnd();
      out += ',';
      i++; continue;
    }
    if (ch === '@') {
      flush();
      atRulePrelude = true;
      out += ch;
      i++; continue;
    }

    flush();
    out += ch;
    i++;
  }

  return out.trim() + '\n';
}

/* ---------- proof of inertness ---------------------------------------- */

/*
 * Parse a sheet into an ordered list of (at-rule context, selector list,
 * declaration list) triples with all whitespace normalised. Run over the input
 * and output of minify() on every build: if the two differ in any way, the
 * build fails rather than shipping a sheet nobody can prove is equivalent.
 */
function ruleTriples(src) {
  const rules = [];
  const ctx = [];
  let i = 0, buf = '';
  const n = src.length;
  const norm = (s) => s.replace(/\s+/g, ' ').trim();

  while (i < n) {
    const ch = src[i];
    if (ch === '"' || ch === "'") {
      const q = ch; let j = i + 1;
      while (j < n && src[j] !== q) { if (src[j] === '\\') j++; j++; }
      buf += src.slice(i, j + 1); i = j + 1; continue;
    }
    if (ch === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2; continue;
    }
    if (ch === '{') {
      const head = norm(buf); buf = '';
      if (/^@(media|supports|document|layer|scope|container)/i.test(head)) {
        ctx.push(head.replace(/\s*:\s*/g, ':').replace(/\s*,\s*/g, ',').replace(/\s+/g, ' '));
        i++; continue;
      }
      let depth = 1, j = i + 1, body = '';
      while (j < n && depth > 0) {
        const c = src[j];
        if (c === '"' || c === "'") {
          const q = c; let k = j + 1;
          while (k < n && src[k] !== q) { if (src[k] === '\\') k++; k++; }
          body += src.slice(j, k + 1); j = k + 1; continue;
        }
        if (c === '{') depth++;
        if (c === '}') { depth--; if (depth === 0) break; }
        body += c; j++;
      }
      const decls = body.split(';').map(norm).filter(Boolean).map((d) => {
        const p = d.indexOf(':');
        if (p === -1) return d;
        return norm(d.slice(0, p)) + ':' +
               norm(d.slice(p + 1)).replace(/\s*,\s*/g, ',');
      });
      rules.push({
        ctx: ctx.join(' >> '),
        sel: head.replace(/\s*,\s*/g, ',').replace(/\s*([>+~])\s*/g, '$1'),
        decls
      });
      i = j + 1; continue;
    }
    if (ch === '}') { ctx.pop(); buf = ''; i++; continue; }
    if (ch === ';' && norm(buf).startsWith('@')) { buf = ''; i++; continue; }
    buf += ch; i++;
  }
  return rules;
}

function proveInert(before, after) {
  const a = ruleTriples(before);
  const b = ruleTriples(after);
  const key = (r) => `${r.ctx}||${r.sel}||${r.decls.join(';')}`;
  const ka = a.map(key), kb = b.map(key);
  const sa = new Set(ka), sb = new Set(kb);
  const onlyA = [...sa].filter((k) => !sb.has(k));
  const onlyB = [...sb].filter((k) => !sa.has(k));
  const ordered = ka.length === kb.length && ka.every((k, x) => k === kb[x]);

  /* Flat declaration stream, independent of how rules are grouped. Catches
     value level corruption that the triple comparison could mask. */
  const fa = a.flatMap((r) => r.decls);
  const fb = b.flatMap((r) => r.decls);
  const flatSame = fa.length === fb.length && fa.every((d, x) => d === fb[x]);

  const report = [
    `  rules        ${a.length} -> ${b.length}`,
    `  declarations ${fa.length} -> ${fb.length}`,
    `  only before  ${onlyA.length}    only after ${onlyB.length}`,
    `  ordered sequence identical      ${ordered}`,
    `  flat declaration stream identical ${flatSame}`
  ].join('\n');

  const ok = onlyA.length === 0 && onlyB.length === 0 && a.length === b.length && ordered && flatSame;
  if (!ok) {
    console.error(report);
    if (onlyA.length) { console.error('\n  only before (first 5):'); onlyA.slice(0, 5).forEach((k) => console.error('    ' + k.slice(0, 200))); }
    if (onlyB.length) { console.error('\n  only after (first 5):');  onlyB.slice(0, 5).forEach((k) => console.error('    ' + k.slice(0, 200))); }
    if (!flatSame) {
      for (let x = 0; x < Math.max(fa.length, fb.length); x++) {
        if (fa[x] !== fb[x]) { console.error(`\n  first declaration divergence at ${x}:\n    before: ${fa[x]}\n    after:  ${fb[x]}`); break; }
      }
    }
    fail('minification changed the stylesheet. It is NOT inert. Nothing written.');
  }
  return report;
}

/* ---------- main ------------------------------------------------------ */

if (!fs.existsSync(SRC)) fail(`source not found: ${SRC}`);
const source = fs.readFileSync(SRC, 'utf8');

checkAscii(source);
checkBraces(source);

const decommented = stripComments(source);
checkCalcVar(decommented);
const stripped = tidy(decommented);

let body = stripped;
let inertReport = null;
if (!NO_MINIFY) {
  body = minify(stripped);
  inertReport = proveInert(stripped, body);
}

const buildId = new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + sha(body).slice(0, 6);
const canary = `.as-build-canary{--as-build-id:"${buildId}"}\n`;
const panel = body + canary;

const bytes = Buffer.byteLength(panel, 'utf8');
const srcBytes = Buffer.byteLength(source, 'utf8');
const strippedBytes = Buffer.byteLength(stripped, 'utf8');

console.log(bold('\nAUSTIN_SPACE stylesheet build'));
console.log(`  source     ${srcBytes.toLocaleString()} bytes (commented)`);
console.log(`  stripped   ${strippedBytes.toLocaleString()} bytes (-${(srcBytes - strippedBytes).toLocaleString()} comments)`);
if (NO_MINIFY) {
  console.log(yellow(`  minify     SKIPPED (--no-minify). For diffing only, do NOT paste this.`));
} else {
  console.log(`  minified   ${Buffer.byteLength(body, 'utf8').toLocaleString()} bytes (-${(strippedBytes - Buffer.byteLength(body, 'utf8')).toLocaleString()} whitespace)`);
}
console.log(`  panel      ${bytes.toLocaleString()} bytes`);
console.log(`  build id   ${buildId}`);
console.log(green(`  no calc() arithmetic on var()`));

if (inertReport) {
  console.log(bold('\n  minification proven inert'));
  console.log(inertReport);
}

/* Loose backstop against runaway growth. There is NO known size limit -- the
   real failure mode is calc(var()), guarded above. Do not treat this number as
   a measured constraint or quote it as headroom. */
if (bytes >= SANITY_CEILING) {
  console.log(yellow(`\n  WARNING: panel is ${bytes.toLocaleString()} bytes, past the ${SANITY_CEILING.toLocaleString()} sanity backstop.`));
  console.log(yellow('  This is not a known limit, but the sheet has grown a long way. Worth a dead code sweep.'));
}

/* --no-minify is a diffing aid, not a deliverable. It is over budget by
   construction, so it must never clobber the real artefact or the lock. */
if (NO_MINIFY) {
  if (CHECK_ONLY) fail('--no-minify cannot be combined with --check');
  const READABLE = path.join(ROOT, 'css', 'master-stylesheet.panel.readable.css');
  fs.writeFileSync(READABLE, panel, 'utf8');
  console.log(green(`\n  Wrote ${path.relative(ROOT, READABLE)} for diffing.`));
  console.log(`  panel.css and .panel-build.json were NOT touched. Do not paste this file.\n`);
  process.exit(0);
}

/* Detect hand edits to the build artefact. */
let lock = null;
if (fs.existsSync(LOCK)) {
  try { lock = JSON.parse(fs.readFileSync(LOCK, 'utf8')); } catch (e) { lock = null; }
}
if (fs.existsSync(OUT) && lock && lock.panelHash) {
  const current = sha(fs.readFileSync(OUT, 'utf8'));
  if (current !== lock.panelHash) {
    console.log(yellow('\n  WARNING: panel.css has changed since the last build.'));
    console.log(yellow('  It was hand edited, or built from a different source.'));
    console.log(yellow('  Those edits are NOT in master-stylesheet.css and are about to be overwritten.'));
    if (!CHECK_ONLY) {
      const backup = OUT + '.handedited-' + Date.now() + '.bak';
      fs.copyFileSync(OUT, backup);
      console.log(yellow(`  Backup written to ${path.basename(backup)}`));
    }
  }
}

if (CHECK_ONLY) {
  const existing = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  // Compare ignoring the canary line, which changes on every build.
  const strip = (s) => s.replace(/^\.as-build-canary\{--as-build-id:"[^"]*"\}\n?$/m, '');
  if (strip(existing) !== strip(panel)) {
    fail('panel.css is out of sync with master-stylesheet.css. Run: node tools/build-css.js');
  }
  console.log(green('\n  In sync.\n'));
  process.exit(0);
}

fs.writeFileSync(OUT, panel, 'utf8');
fs.writeFileSync(LOCK, JSON.stringify({
  builtAt: new Date().toISOString(),
  buildId,
  sourceHash: sha(source),
  panelHash: sha(panel),
  panelBytes: bytes
}, null, 2) + '\n', 'utf8');

console.log(green(`\n  Wrote ${path.relative(ROOT, OUT)}`));
console.log(`\n  Paste that file into Squarespace, then verify the paste landed:\n`);
console.log(`    (() => { const e=document.createElement('div'); e.className='as-build-canary';`);
console.log(`      document.body.appendChild(e);`);
console.log(`      const v=getComputedStyle(e).getPropertyValue('--as-build-id').trim();`);
console.log(`      e.remove(); return v; })()\n`);
console.log(`  Expected: "${buildId}". Anything else means the paste truncated.\n`);
