/* AUSTIN_SPACE - baseline v2 probe
 * Written 31 July 2026. Commit this to the repo: tools/baseline-v2-probe.js
 *
 * WHY THIS FILE EXISTS AT ALL
 * v1's probe was authored inside a Chrome MCP javascript_tool call and never
 * written to disk. On 31 July it was searched for across the working tree, all
 * 363 git objects, every branch, the reflog, stashes, ~/Downloads, ~/Documents
 * and /tmp. Zero hits. The 73KB of v1 fingerprints in localStorage are now
 * permanently unreadable because the hash function that produced them is gone.
 * Do not run a capture from a paste buffer. Run it from this file.
 *
 * WHAT v1 DID (recovered from the 31 July transcript, for the record)
 *   record   sig|count|styleHash|boxHash
 *   sig      tag + all as-/fa-/surface-/on-speckle classes, sorted
 *   styleHash  djb2 over 34 computed properties, all instances concatenated
 *   boxHash    djb2 over rounded WxH, all instances concatenated
 *   vw       window.innerWidth, recorded as 1505
 *   scale    1,697 groups across 3,221 elements, 16 pages
 *
 * v1 IS HALF RECOVERABLE - VERIFIED 31 JULY, NOT ASSUMED
 * The djb2 above was reconstructed and PROVED correct: replaying it against the
 * live homepage reproduced v1's stored boxHash byte-for-byte on 145 of 149
 * groups. So v1's GEOMETRY column is comparable to v2's. Its STYLE column is
 * not, and never will be - that needed the 34-property list and its order,
 * which is gone.
 *
 * Two things must be done to reach that 145, both at comparison time:
 *   1. v1 did NOT sort the class list, it used DOM order (its own sig
 *      "a.as-offer.as-offer--sm.as-offer--refresh" is not alphabetical).
 *      v2 sorts, because authored class order changing should not read as a
 *      regression. Normalise v1's sigs with normSig() when diffing. Raw
 *      comparison scores 129; normalised scores 145.
 *   2. v1's TRUE capture viewport was 1505 x 1080, NOT the "1440 x 900
 *      requested" its own doc claims. The resize silently never took - the
 *      same background-tab failure reproduced on 31 July, where resize_window
 *      reports success while a hidden tab never re-lays-out. Recovered by
 *      brute-forcing iframe height against v1's stored hero hash: 813, 900 and
 *      940 all give 1q2xd0s; only 1080 gives v1's 1q2xd48.
 *
 * After both corrections the ONLY v1 group with no v2 counterpart is
 * body.as-allsorts, which is the retirement and is supposed to be gone.
 *
 * WHAT v2 CHANGES
 * v1's single styleHash could never be attributed to a property, which is why
 * 46 group differences closed unresolved. v2 stores ONE HASH PER PROPERTY, so
 * a diff names the property in the same call that finds it.
 */

window.__ASB2 = (function () {

  /* ---------------------------------------------------------------- config */

  var VERSION = '2.0';
  var PREFIX  = '__asb2';           // v1 keys (__asb / __asbm) are left intact
  var TRACK   = /^(as-|fa-|surface-|on-speckle)/;

  /* DELIBERATE DIVERGENCE FROM v1 - DO NOT "FIX" THIS.
   * v1 selected its nodes by `as-` class ONLY, while building sigs that
   * included fa- classes. v2 selects on all four prefixes, which adds the bare
   * Font Awesome icon elements carrying no as- class at all (45 of them on the
   * homepage). That is the whole of the +224 group / +346 element gap against
   * v1's site totals, verified 31 July:
   *
   *     v1 homepage      els 260   gr 149
   *     v2 as-only       els 259   gr 148
   *     difference       exactly body.as-allsorts, and nothing else
   *
   * The wider net is intentional. FA has caused repeated silent failures on
   * this codebase - tofu from an omitted style class, `fa-duotone fa-slab`
   * falling back to single-tone, nth-child colour rotations shifting when a
   * topper is inserted - and a baseline blind to every bare icon cannot see
   * any of it. v1 comparison is unharmed: matching is per-sig, so the extra
   * groups simply report as onlyV2. */

  /* Ordered. Index position is part of the format - APPEND ONLY, never insert
   * or reorder, or every stored record silently misaligns against its labels.
   * Chosen for this codebase specifically: clipPath/aspectRatio/objectPosition
   * carry the entire hero and wave system; borderTopWidth catches the mid-strip
   * "must explicitly zero the 5px base" rule; fontFamily catches the Exo trap. */
  var PROPS = [
    'display', 'position', 'boxSizing', 'zIndex', 'overflow',
    'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight',
    'letterSpacing', 'textTransform', 'textAlign', 'textDecorationLine',
    'color', 'backgroundColor', 'backgroundImage', 'opacity',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'borderTopWidth', 'borderBottomWidth', 'borderTopColor', 'borderTopStyle',
    'borderRadius', 'boxShadow',
    'flexDirection', 'justifyContent', 'alignItems', 'gap',
    'gridTemplateColumns', 'gridRowStart', 'gridRowEnd',
    'transform', 'transition',
    'aspectRatio', 'objectFit', 'objectPosition', 'clipPath'
  ];

  /* 1505 is not arbitrary: it is v1's recorded innerWidth, so the desktop
   * column stays comparable in geometry terms even though v1's hashes do not.
   * NOTE the old doc recorded "window 1440x900 requested -> innerWidth 1505",
   * which never reconciled. Targeting innerWidth directly makes it moot. */
  var WIDTHS = [1505, 768, 375];
  var FRAME_H = 1080;                 // v1's recovered viewport height

  /* SCROLLBAR CAVEAT, verified 31 July. An iframe at 375 yields innerWidth 375
   * but documentElement.clientWidth 360, because Chrome draws a classic 15px
   * scrollbar inside the frame. Real phones use overlay scrollbars and give the
   * full 375. Measured: 1505 -> 1490, 768 -> 753, 375 -> 360.
   * Regression detection is unaffected, since v2 only ever compares against v2
   * at the same width. But do NOT judge whether something LOOKS right at 375
   * from this harness - it is 15px narrow. Bump the frame to 390 for that, or
   * use Charles's DevTools device emulation. Both vw and cw are stored per
   * capture so the distinction is always recoverable. */

  /* v1 stored sigs in DOM class order; v2 sorts. Normalise v1's before any
   * comparison or every multi-class element reads as a false add/remove pair. */
  function normSig(s) {
    var i = s.indexOf('.');
    if (i < 0) return s;
    return s.slice(0, i) + '.' + s.slice(i + 1).split('.').sort().join('.');
  }

  var PAGES = [
    '/', '/about', '/contact',
    '/services/view-all',
    '/services/squarespace-custom-build',
    '/services/squarespace-site-refresh',
    '/services/squarespace-support-retainer',
    '/services/one-page-website',
    '/case-studies/view-all',
    '/case-studies/terracotta-property',
    '/case-studies/ddr-ltd',
    '/case-studies/austin-space',
    '/case-studies/gypsy-pistoleros',
    '/policies/privacy', '/policies/cookies', '/policies/terms-of-service'
  ];

  /* ----------------------------------------------------------------- utils */

  function h(s) {                                    // djb2, same as v1
    var x = 5381;
    for (var i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) >>> 0;
    return x.toString(36);
  }

  function sigOf(el) {
    var cls = [];
    for (var i = 0; i < el.classList.length; i++) {
      if (TRACK.test(el.classList[i])) cls.push(el.classList[i]);
    }
    cls.sort();
    return el.tagName.toLowerCase() + (cls.length ? '.' + cls.join('.') : '');
  }

  function key(path, w)  { return PREFIX + ':'  + path + '@' + w; }
  function mkey(path, w) { return PREFIX + 'm:' + path + '@' + w; }

  /* ---------------------------------------------------- iframe at a width */

  /* resize_window is unreliable here: on 31 July it reported success at every
   * size while the MCP tab, being a BACKGROUND tab, never re-laid-out and kept
   * reporting innerWidth 2560 / clientWidth 2545. An iframe's viewport is set
   * by CSS, so it is immune to window size, tab focus and background relayout.
   * It is also the only route to 375 and 320, which resize cannot reach. */
  function openFrame(path, w, cb) {
    var old = document.getElementById('asb2-frame');
    if (old) old.remove();
    var f = document.createElement('iframe');
    f.id = 'asb2-frame';
    /* HEIGHT IS LOAD-BEARING, DO NOT "TIDY" IT TO 900. The homepage hero
     * (.as-hero-combined and its __content / __fade children) sizes off
     * viewport height, so height changes the boxHash on those three groups and
     * on nothing else. 1080 is v1's recovered height - see header. */
    f.style.cssText = 'position:fixed;left:-10000px;top:0;border:0;width:' +
                      w + 'px;height:' + FRAME_H + 'px';
    f.src = path;
    document.body.appendChild(f);
    var done = false;
    function go() {
      if (done) return; done = true;
      setTimeout(function () { cb(f, f.contentDocument, f.contentWindow); }, 1500);
    }
    f.onload = go;
    setTimeout(go, 20000);
    return f;
  }

  /* --------------------------------------------------------------- capture */

  function captureFrame(doc, win, path, w) {
    var all = doc.querySelectorAll('*'), nodes = [], i, j;
    for (i = 0; i < all.length; i++) {
      for (j = 0; j < all[i].classList.length; j++) {
        if (TRACK.test(all[i].classList[j])) { nodes.push(all[i]); break; }
      }
    }

    var g = {};
    for (i = 0; i < nodes.length; i++) {
      var el = nodes[i], sig = sigOf(el);
      var cs = win.getComputedStyle(el), r = el.getBoundingClientRect();
      if (!g[sig]) { g[sig] = { n: 0, p: [], b: [] }; for (j = 0; j < PROPS.length; j++) g[sig].p.push([]); }
      g[sig].n++;
      for (j = 0; j < PROPS.length; j++) g[sig].p[j].push(cs[PROPS[j]]);
      g[sig].b.push(Math.round(r.width) + 'x' + Math.round(r.height));
    }

    var sigs = Object.keys(g).sort(), lines = [];
    for (i = 0; i < sigs.length; i++) {
      var rec = g[sigs[i]], ph = [];
      for (j = 0; j < PROPS.length; j++) ph.push(h(rec.p[j].join('#')));
      lines.push(sigs[i] + '|' + rec.n + '|' + h(rec.b.join('#')) + '|' + ph.join(','));
    }
    var body = lines.join('\n');

    /* standing assertions - recorded as numbers so regressions surface as data */
    var scripts = doc.querySelectorAll('script'), withClass = 0;
    for (i = 0; i < scripts.length; i++) {
      if ((scripts[i].textContent || '').indexOf('as-allsorts') > -1) withClass++;
    }

    var meta = {
      v: VERSION,
      vw: win.innerWidth,
      cw: doc.documentElement.clientWidth,
      els: nodes.length,
      gr: lines.length,
      docH: Math.round(doc.documentElement.scrollHeight),
      classPresent: doc.body.classList.contains('as-allsorts'),   // must be false
      inlineScriptsWithClass: withClass,                          // must be 0
      props: PROPS.length,
      agg: h(body),
      at: Date.now()
    };

    try {
      localStorage.setItem(key(path, w), body);
      localStorage.setItem(mkey(path, w), JSON.stringify(meta));
      meta.stored = true;
    } catch (e) {
      meta.stored = false;
      meta.err = String(e).slice(0, 80);          // quota is the likely cause
    }
    meta.bytes = body.length;
    return meta;
  }

  /* ------------------------------------------------------------ public api */

  return {
    VERSION: VERSION, PROPS: PROPS, WIDTHS: WIDTHS, PAGES: PAGES,
    FRAME_H: FRAME_H, h: h, normSig: normSig,

    /* Geometry-only diff against the surviving v1 baseline. Style is not
     * available and must not be inferred. Only meaningful at w = 1505, since
     * that is the sole width v1 ever captured. */
    compareV1Box: async function (path) {
      var raw = localStorage.getItem('__asb:' + path);
      if (!raw) return { err: 'no v1 baseline for ' + path };
      var v1 = {};
      raw.split('\n').forEach(function (l) {
        var p = l.split('|');
        v1[normSig(p[0])] = p[3];                  // field 3 is v1's boxHash
      });
      var m = await this.page(path, 1505);
      var cur = localStorage.getItem(key(path, 1505));
      if (!cur) return { err: 'v2 capture failed', meta: m };
      var v2 = {};
      cur.split('\n').forEach(function (l) {
        var p = l.split('|');
        v2[p[0]] = p[2];                           // field 2 is v2's boxHash
      });
      var out = { path: path, match: 0, diff: 0, onlyV1: [], onlyV2: 0, diffList: [] };
      Object.keys(v1).forEach(function (s) {
        if (!(s in v2)) { out.onlyV1.push(s); return; }
        if (v1[s] === v2[s]) out.match++;
        else { out.diff++; if (out.diffList.length < 10) out.diffList.push(s); }
      });
      Object.keys(v2).forEach(function (s) { if (!(s in v1)) out.onlyV2++; });
      return out;
    },

    /* one page at one width */
    page: function (path, w) {
      return new Promise(function (res) {
        openFrame(path, w, function (f, doc, win) {
          var m;
          try { m = captureFrame(doc, win, path, w); }
          catch (e) { m = { err: String(e).slice(0, 120) }; }
          f.remove();
          res(m);
        });
      });
    },

    /* every page at one width, sequential. Returns totals only - tool output
     * truncates at roughly 1KB, so never return the records themselves. */
    sweep: async function (w, pages) {
      var list = pages || PAGES, out = { w: w, ok: 0, fail: 0, bytes: 0, gr: 0, els: 0, bad: [] };
      for (var i = 0; i < list.length; i++) {
        var m = await this.page(list[i], w);
        if (m && m.stored && !m.err) {
          out.ok++; out.bytes += m.bytes; out.gr += m.gr; out.els += m.els;
          if (m.vw !== w) out.bad.push(list[i] + ' vw=' + m.vw);
          if (m.classPresent) out.bad.push(list[i] + ' CLASS BACK');
          if (m.inlineScriptsWithClass) out.bad.push(list[i] + ' script×' + m.inlineScriptsWithClass);
        } else {
          out.fail++; out.bad.push(list[i] + ' ' + ((m && (m.err || 'unstored')) || '?'));
        }
      }
      return out;
    },

    /* diff a live page against its stored baseline, naming the property */
    diff: async function (path, w) {
      var base = localStorage.getItem(key(path, w));
      if (!base) return { err: 'no baseline for ' + path + '@' + w };
      var live = null;
      await new Promise(function (res) {
        openFrame(path, w, function (f, doc, win) {
          var all = doc.querySelectorAll('*'), nodes = [], i, j;
          for (i = 0; i < all.length; i++)
            for (j = 0; j < all[i].classList.length; j++)
              if (TRACK.test(all[i].classList[j])) { nodes.push(all[i]); break; }
          var g = {};
          for (i = 0; i < nodes.length; i++) {
            var el = nodes[i], sig = sigOf(el), cs = win.getComputedStyle(el),
                r = el.getBoundingClientRect();
            if (!g[sig]) { g[sig] = { n: 0, p: [], b: [] }; for (j = 0; j < PROPS.length; j++) g[sig].p.push([]); }
            g[sig].n++;
            for (j = 0; j < PROPS.length; j++) g[sig].p[j].push(cs[PROPS[j]]);
            g[sig].b.push(Math.round(r.width) + 'x' + Math.round(r.height));
          }
          var sigs = Object.keys(g).sort(), lines = [];
          for (i = 0; i < sigs.length; i++) {
            var rec = g[sigs[i]], ph = [];
            for (j = 0; j < PROPS.length; j++) ph.push(h(rec.p[j].join('#')));
            lines.push(sigs[i] + '|' + rec.n + '|' + h(rec.b.join('#')) + '|' + ph.join(','));
          }
          live = lines.join('\n');
          f.remove(); res();
        });
      });

      var A = {}, B = {}, out = { path: path, w: w, changed: [], gone: [], added: 0, props: {} };
      base.split('\n').forEach(function (l) { A[l.split('|')[0]] = l; });
      live.split('\n').forEach(function (l) { B[l.split('|')[0]] = l; });

      Object.keys(A).forEach(function (sig) {
        if (!B[sig]) { out.gone.push(sig); return; }
        if (A[sig] === B[sig]) return;
        var a = A[sig].split('|'), b = B[sig].split('|');
        var hit = { sig: sig, box: a[2] !== b[2], props: [] };
        var ap = a[3].split(','), bp = b[3].split(',');
        for (var j = 0; j < PROPS.length; j++) {
          if (ap[j] !== bp[j]) {
            hit.props.push(PROPS[j]);
            out.props[PROPS[j]] = (out.props[PROPS[j]] || 0) + 1;
          }
        }
        if (a[1] !== b[1]) hit.count = a[1] + '->' + b[1];
        out.changed.push(hit);
      });
      Object.keys(B).forEach(function (sig) { if (!A[sig]) out.added++; });

      out.nChanged = out.changed.length;
      out.changed = out.changed.slice(0, 12);   // truncation guard
      return out;
    },

    /* attribution, on demand only. Same-parent clone = our sheet + ancestor
     * context. Body clone = unscoped rules only. A value the live element shows
     * that neither clone reproduces means an external sheet won.
     * CAVEAT: the clone is appended last, so any nth-child rotation (creds band,
     * case-study hub rows) resolves differently on the clone. Read those two
     * components' colours from the live element only. */
    attribute: function (sel, prop) {
      var el = document.querySelector(sel);
      if (!el) return { err: 'no match' };
      var live = getComputedStyle(el)[prop];
      var a = el.cloneNode(false); el.parentNode.appendChild(a);
      var av = getComputedStyle(a)[prop]; a.remove();
      var b = el.cloneNode(false); document.body.appendChild(b);
      var bv = getComputedStyle(b)[prop]; b.remove();
      return {
        prop: prop, live: live, sameParent: av, body: bv,
        verdict: live !== av ? 'element-specific (inline/id/state)'
               : av !== bv   ? 'ancestor-scoped'
               : 'unscoped rule'
      };
    },

    /* housekeeping */
    stored: function () {
      return Object.keys(localStorage).filter(function (k) {
        return k.indexOf(PREFIX) === 0;
      }).length;
    },
    weight: function () {
      var n = 0;
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf(PREFIX) === 0) n += k.length + localStorage.getItem(k).length;
      });
      return n;
    },
    /* v1 keys are NOT touched. Clear them only once v2 is captured and signed
     * off, and accept that their contents are already unreadable. */
    clearV1: function () {
      var n = 0;
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf('__asb:') === 0 || k.indexOf('__asbm:') === 0) {
          localStorage.removeItem(k); n++;
        }
      });
      return n;
    }
  };
})();
