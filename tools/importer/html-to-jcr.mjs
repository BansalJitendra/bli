/*
 * Convert content/index.plain.html -> markdown -> JCR XML for xwalk upload.
 *
 * Pipeline: helix-html2md (HTML -> MD), then helix-md2jcr (MD + UE files -> JCR).
 *
 * md2jcr is fragile on whole-document markdown: long DM image URLs overflow
 * grid-table columns, reference-definition resolution miscounts container rows,
 * and a lone link/word in a cell is misread as a component header. To be robust
 * we convert the page SECTION-BY-SECTION (sections are delimited by `---` thematic
 * breaks in the generated markdown), converting each section's markdown fragment
 * independently and stitching the resulting <root> children into one page. Each
 * fragment is tried with a few markdown "repairs" until md2jcr accepts it.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { html2md } from '@adobe/helix-html2md';
import { md2jcr } from '@adobe/helix-md2jcr/src/index.js';

const ROOT = process.cwd();
const log = {
  debug() {}, info() {}, warn() {}, error() {},
};

async function readJson(p) {
  return JSON.parse(await readFile(path.resolve(ROOT, p), 'utf-8'));
}

// ---- markdown repairs -------------------------------------------------------

/** Inline reference-style images/links and drop the trailing "[id]: url" defs. */
function inlineRefs(md) {
  const refs = {};
  const re = /^\[([^\]]+)\]:\s+(\S+)\s*$/gm;
  let m;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(md)) !== null) refs[m[1]] = m[2];
  return md
    .replace(/!\[([^\]]*)\]\[([^\]]+)\]/g, (f, alt, id) => (refs[id] ? `![${alt}](${refs[id]})` : f))
    .replace(/(^|[^!])\[([^\]]+)\]\[([^\]]+)\]/g, (f, pre, txt, id) => (refs[id] ? `${pre}[${txt}](${refs[id]})` : f))
    .replace(/^\[[^\]]+\]:\s+\S+\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n');
}

/**
 * Reflow every grid table so each column's border is wider than its widest cell
 * line. html2md sometimes emits columns narrower than their content (long DM
 * image URLs, long lines); md2jcr then mis-parses the overflowing row and reads
 * following content as a block/component header. This widens borders only —
 * multi-line wrapped cells are preserved line-for-line (never re-split), so
 * container/tab tables stay intact.
 */
function repadSingleColTables(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  const isT = (l) => l.startsWith('+') || l.startsWith('|');
  while (i < lines.length) {
    if (!isT(lines[i])) { out.push(lines[i]); i += 1; continue; }
    const run = [];
    while (i < lines.length && isT(lines[i])) { run.push(lines[i]); i += 1; }
    out.push(...reflowTable(run));
  }
  return out.join('\n');
}

function reflowTable(run) {
  // Full grid reflow that tolerates content overflowing its border and wrapped
  // (multi-physical-line) cells. Strategy:
  //  1. Column boundaries come from the FIRST separator line's interior '+'.
  //  2. Each separator line starts a new grid ROW; '|' data lines between two
  //     separators accumulate into that row's cells (one text line per cell per
  //     physical line), split at the column boundaries.
  //  3. Re-emit with per-column widths sized to the longest cell line, so no
  //     content ever overflows its border.
  const firstSep = run.find((l) => /^\+[-=+]+\+$/.test(l));
  if (!firstSep) return run;
  const cols = [];
  for (let i = 0; i < firstSep.length; i += 1) if (firstSep[i] === '+') cols.push(i);
  const ncol = cols.length - 1;
  if (ncol < 1) return run;

  // Split a data line into ncol raw segments using the ORIGINAL column
  // boundaries; the last column extends to end-of-line to keep overflow content.
  const segsOf = (l) => {
    const out = [];
    for (let c = 0; c < ncol; c += 1) {
      const start = cols[c];
      const end = (c === ncol - 1) ? l.length : cols[c + 1];
      // slice between the border chars, drop the leading '|' pad
      let seg = l.slice(start + 1, end);
      seg = seg.replace(/^\s/, '').replace(/\s*\|?\s*$/, '');
      out.push(seg);
    }
    return out;
  };

  // Build rows: group '|' lines that fall between separator lines.
  const rows = []; // each row = array of ncol arrays of text lines
  let cur = null;
  const isSep = (l) => /^\+[-=+]+\+$/.test(l);
  const seps = []; // remember separator style (= vs -) in order
  for (const l of run) {
    if (isSep(l)) { seps.push(l.includes('=') ? '=' : '-'); cur = null; continue; }
    if (!l.startsWith('|')) continue;
    if (!cur) { cur = Array.from({ length: ncol }, () => []); rows.push(cur); }
    const segs = segsOf(l);
    for (let c = 0; c < ncol; c += 1) if (segs[c] !== '') cur[c].push(segs[c]);
  }

  const widths = new Array(ncol).fill(3);
  for (const row of rows) {
    for (let c = 0; c < ncol; c += 1) {
      for (const line of row[c]) widths[c] = Math.max(widths[c], line.length);
    }
  }
  const sepFor = (ch) => `+${widths.map((w) => (ch || '-').repeat(w + 2)).join('+')}+`;

  // Re-emit: separator, then each row's cells (multi-line cells emit multiple
  // physical lines, padding shorter columns with blank cells).
  const outLines = [];
  let si = 0;
  outLines.push(sepFor(seps[si] || '-')); si += 1;
  for (const row of rows) {
    const h = Math.max(1, ...row.map((c) => c.length));
    for (let r = 0; r < h; r += 1) {
      outLines.push(`| ${row.map((c, ci) => (c[r] || '').padEnd(widths[ci])).join(' | ')} |`);
    }
    outLines.push(sepFor(seps[si] || '-')); si += 1;
  }
  return outLines;
}

/**
 * Collapse a multi-column container table's rich cells that contain inline
 * images with very long URLs into reference-style short tokens local to the
 * fragment, appended as definitions AFTER the table. Keeps grid columns narrow
 * without losing the URL. Used as a fallback repair for dense container blocks.
 */
function shortenInlineImages(md) {
  const defs = [];
  let n = 0;
  const short = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (f, alt, url) => {
    if (url.length < 60) return f;
    const id = `img${n}`;
    n += 1;
    defs.push(`[${id}]: ${url}`);
    return `![${alt}][${id}]`;
  });
  return defs.length ? `${short}\n\n${defs.join('\n\n')}\n` : md;
}

/**
 * Remove the trailing page "Metadata" grid-table from the markdown body and
 * capture Title/Description into `meta`. The Metadata block is page-level
 * front matter, not authorable section content — leaving it in the body makes
 * md2jcr / franklin.delivery render it as literal grid-table text.
 */
function extractMetadataBlock(md, meta) {
  const lines = md.split('\n');
  // Find the grid-table run whose header row is "| Metadata |".
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (/^\|\s*Metadata\s*\|/.test(lines[i]) && i > 0 && lines[i - 1].startsWith('+')) {
      start = i - 1; break;
    }
  }
  if (start === -1) return md;
  let end = start;
  for (let i = start; i < lines.length; i += 1) {
    if (lines[i].startsWith('+') || lines[i].startsWith('|')) end = i; else break;
  }
  // Parse Title / Description rows from the captured table.
  const tableText = lines.slice(start, end + 1).join('\n');
  const cell = (key) => {
    const re = new RegExp(`\\|\\s*${key}\\s*\\|([\\s\\S]*?)(?=\\n\\+)`, 'i');
    const m = tableText.match(re);
    if (!m) return '';
    return m[1].split('\n').map((l) => l.replace(/^\|/, '').replace(/\|$/, '').trim()).join(' ').replace(/\s+/g, ' ').trim();
  };
  meta.title = cell('Title');
  meta.description = cell('Description');
  // Drop the table (and any immediately-preceding '---'/blank lines) from body.
  const before = lines.slice(0, start);
  while (before.length && (before[before.length - 1].trim() === '' || before[before.length - 1].trim() === '---')) before.pop();
  const after = lines.slice(end + 1);
  return [...before, ...after].join('\n');
}

// ---- section splitting ------------------------------------------------------

/** Split page markdown into fragments on `---` thematic breaks (section bounds). */
function splitSections(md) {
  // Keep the frontmatter/metadata with the first fragment. Split on lines that
  // are exactly '---' (thematic break emitted between sections).
  const lines = md.split('\n');
  const frags = [];
  let cur = [];
  for (const l of lines) {
    if (l.trim() === '---') {
      if (cur.join('').trim()) frags.push(cur.join('\n'));
      cur = [];
    } else {
      cur.push(l);
    }
  }
  if (cur.join('').trim()) frags.push(cur.join('\n'));
  return frags;
}

// ---- extract <root> children from a converted fragment ----------------------

function extractRootChildren(xml) {
  const m = xml.match(/<root[^>]*>([\s\S]*?)<\/root>/);
  if (!m) return '';
  return m[1].replace(/^\s*\n/, '').replace(/\n\s*$/, '');
}

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const JCR_OPEN = '<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:sling="http://sling.apache.org/jcr/sling/1.0" jcr:primaryType="cq:Page">';

async function convertFragment(md, opts, label) {
  const repairs = [
    (s) => repadSingleColTables(inlineRefs(s)),
    (s) => repadSingleColTables(s), // keep refs (some container blocks prefer this)
    (s) => repadSingleColTables(shortenInlineImages(inlineRefs(s))),
  ];
  let lastErr;
  for (const repair of repairs) {
    try {
      const xml = await md2jcr(repair(md), opts);
      return xml;
    } catch (e) {
      lastErr = e;
    }
  }
  console.warn(`  ⚠️  section "${label}" failed all repairs: ${lastErr?.message?.split('\n')[0]}`);
  return null;
}

function sectionLabel(md) {
  const m = md.match(/\|\s*([A-Z][A-Za-z0-9 ]+?)\s*\|/);
  return m ? m[1].trim() : '(text)';
}

async function main() {
  const inHtml = process.argv[2] || 'content/index.plain.html';
  const base = path.basename(inHtml, '.plain.html');
  const outMd = path.resolve(ROOT, 'migration-work/jcr-content', `${base}.md`);
  const outXml = path.resolve(ROOT, 'migration-work/jcr-content', `${base}.xml`);

  const plain = await readFile(path.resolve(ROOT, inHtml), 'utf-8');
  const html = `<!DOCTYPE html><html><body><main>${plain}</main></body></html>`;

  const md = await html2md(html, {
    log,
    url: 'https://www.bajajlifeinsurance.com/',
    imageFilter: () => false,
  });
  await writeFile(outMd, md);
  console.log(`markdown written: ${outMd} (${md.length} bytes)`);

  const modelsJson = await readJson('component-models.json');
  const definition = await readJson('component-definition.json');
  const filtersJson = await readJson('component-filters.json');
  const opts = {
    models: Array.isArray(modelsJson) ? modelsJson : modelsJson.models,
    definition,
    filters: Array.isArray(filtersJson) ? filtersJson : filtersJson.filters,
    log,
  };

  // CRITICAL: resolve all reference-style images/links to inline URLs BEFORE any
  // splitting, so per-section fragments don't lose the shared trailing ref
  // definitions (which would leave `![alt][id]` unresolved in block attributes).
  let prepared = repadSingleColTables(inlineRefs(md));
  // Pull the trailing page "Metadata" block out of the body — it must become
  // page-level jcr:content properties, not a section text node. Capture Title
  // and Description for the page node.
  const meta = {};
  prepared = extractMetadataBlock(prepared, meta);

  // Try the whole (prepared) document first.
  let bodyChildren = null;
  try {
    const whole = await md2jcr(prepared, opts);
    bodyChildren = extractRootChildren(whole);
    console.log('whole-document conversion succeeded');
  } catch (e) {
    console.log(`whole-document conversion failed (${e.message.split('\n')[0]}); converting per-section`);
  }

  if (bodyChildren === null) {
    const frags = splitSections(prepared);
    console.log(`split into ${frags.length} sections`);
    const parts = [];
    let ok = 0;
    for (const frag of frags) {
      const label = sectionLabel(frag);
      // eslint-disable-next-line no-await-in-loop
      const xml = await convertFragment(frag, opts, label);
      if (xml) {
        const children = extractRootChildren(xml);
        if (children.trim()) { parts.push(children); ok += 1; } else {
          console.warn(`  ⚠️  section "${label}" produced empty output`);
        }
      }
    }
    console.log(`sections converted: ${ok}/${frags.length}`);
    bodyChildren = parts.join('\n');
  }

  const esc = (s) => (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const pageProps = [
    'cq:template="/libs/core/franklin/templates/page"',
    'sling:resourceType="core/franklin/components/page/v1/page"',
    'jcr:primaryType="cq:PageContent"',
    meta.title ? `jcr:title="${esc(meta.title)}"` : '',
    meta.description ? `jcr:description="${esc(meta.description)}"` : '',
  ].filter(Boolean).join(' ');

  const xml = `${XML_HEADER}\n${JCR_OPEN}\n`
    + `  <jcr:content ${pageProps}>\n`
    + '    <root jcr:primaryType="nt:unstructured" sling:resourceType="core/franklin/components/root/v1/root">\n'
    + `${bodyChildren}\n`
    + '    </root>\n'
    + '  </jcr:content>\n'
    + '</jcr:root>\n';

  await writeFile(outXml, xml);
  console.log(`jcr xml written: ${outXml} (${xml.length} bytes)`);
  console.log(`page title: ${meta.title || '(none)'}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
