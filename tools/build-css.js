#!/usr/bin/env node
/*
 * AUSTIN_SPACE stylesheet build
 *
 * Derives css/master-stylesheet.panel.css from css/master-stylesheet.css by
 * stripping comments. panel.css is a BUILD ARTEFACT. Never hand edit it.
 *
 *   node tools/build-css.js           build
 *   node tools/build-css.js --check   verify in sync, exit 1 if not (no writes)
 *
 * Guarantees:
 *   1. panel.css is always derived, so the two files cannot drift
 *   2. Non ASCII characters are rejected before they can kill the parser
 *   3. Unbalanced braces are rejected before they can kill the parser
 *   4. Byte size is reported and the build FAILS above the panel ceiling
 *   5. A build canary is appended so a truncated paste is provable in one line
 *   6. Hand edits to panel.css are detected and reported before being clobbered
 */

'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'css', 'master-stylesheet.css');
const OUT = path.join(ROOT, 'css', 'master-stylesheet.panel.css');
const LOCK = path.join(ROOT, 'css', '.panel-build.json');

// Squarespace Custom CSS panel truncates silently somewhere near 200000 bytes.
const HARD_CEILING = 200000;
const WARN_CEILING = 185000;

const CHECK_ONLY = process.argv.includes('--check');

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

/* ---------- main ------------------------------------------------------ */

if (!fs.existsSync(SRC)) fail(`source not found: ${SRC}`);
const source = fs.readFileSync(SRC, 'utf8');

checkAscii(source);
checkBraces(source);

const stripped = tidy(stripComments(source));

const buildId = new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + sha(stripped).slice(0, 6);
const canary = `.as-build-canary{--as-build-id:"${buildId}"}\n`;
const panel = stripped + canary;

const bytes = Buffer.byteLength(panel, 'utf8');
const srcBytes = Buffer.byteLength(source, 'utf8');
const headroom = HARD_CEILING - bytes;

console.log(bold('\nAUSTIN_SPACE stylesheet build'));
console.log(`  source   ${srcBytes.toLocaleString()} bytes (commented)`);
console.log(`  panel    ${bytes.toLocaleString()} bytes (stripped)`);
console.log(`  saved    ${(srcBytes - bytes).toLocaleString()} bytes of comments`);
console.log(`  headroom ${headroom.toLocaleString()} bytes to the ${HARD_CEILING.toLocaleString()} ceiling`);
console.log(`  build id ${buildId}`);

if (bytes >= HARD_CEILING) {
  fail(`panel build is ${bytes.toLocaleString()} bytes, at or over the ${HARD_CEILING.toLocaleString()} ceiling.\n` +
       `The Squarespace panel will truncate this SILENTLY and the site will lose all custom styling.\n` +
       `Remove dead CSS before shipping.`);
}
if (bytes >= WARN_CEILING) {
  console.log(yellow(`\n  WARNING: within ${(HARD_CEILING - WARN_CEILING).toLocaleString()} bytes of the ceiling. Schedule a dead code sweep.`));
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
