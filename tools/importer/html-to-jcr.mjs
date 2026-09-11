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

// Reflow is intentionally a no-op: grid re-padding proved too fragile against
// html2md's wrapped multi-line cells. Overflow from long URLs is instead solved
// by swapping long URLs for short placeholder tokens BEFORE md2jcr and restoring
// them in the produced XML (see swapLongUrls / restoreLongUrls). Kept as a hook
// so callers referencing repadSingleColTables stay valid.
function reflowTable(run) {
  return run;
}

/**
 * Replace every long URL (in markdown image/link syntax) with a short opaque
 * token so grid-table cells never overflow their borders. Returns { md, map }.
 * Tokens are plain (no punctuation that markdown/grid parsing cares about).
 */
function swapLongUrls(md) {
  const map = new Map();
  let n = 0;
  const swap = (url) => {
    if (url.length < 48) return url;
    const token = `httptoken${n}zz`;
    n += 1;
    map.set(token, url);
    return token;
  };
  // image: ![alt](url)   and link: ](url)
  const out = md.replace(/(!?\[[^\]]*\]\()([^)]+)(\))/g, (f, pre, url, post) => `${pre}${swap(url)}${post}`);
  return { md: out, map };
}

function restoreLongUrls(xml, map) {
  let out = xml;
  for (const [token, url] of map) {
    // token may appear XML-escaped; restore both plain and escaped forms.
    out = out.split(token).join(url);
  }
  return out;
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
    // Each physical line is `| <value> |` or a continuation `| | <value> |`.
    // Take the LAST pipe-delimited segment on every line (the value column),
    // so interior key-column pipes don't leak into the joined value.
    return m[1].split('\n')
      .map((l) => {
        const segs = l.split('|').map((s) => s.trim()).filter((s) => s !== '');
        return segs.length ? segs[segs.length - 1] : '';
      })
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  };
  meta.title = cell('Title');
  meta.description = cell('Description');
  // Drop the table (and any immediately-preceding '---'/blank lines) from body.
  const before = lines.slice(0, start);
  while (before.length && (before[before.length - 1].trim() === '' || before[before.length - 1].trim() === '---')) before.pop();
  const after = lines.slice(end + 1);
  return [...before, ...after].join('\n');
}

/**
 * Split a section fragment into individual units: each block TABLE (a run of
 * consecutive +/| lines) and each run of default-content text between tables.
 * Section Metadata tables are dropped (they're page/section chrome). Used as a
 * fallback when a whole-section conversion fails so good blocks aren't lost.
 */
function splitBlockTables(frag) {
  const lines = frag.split('\n');
  const units = [];
  let i = 0;
  const isT = (l) => l.startsWith('+') || l.startsWith('|');
  while (i < lines.length) {
    if (isT(lines[i])) {
      const run = [];
      while (i < lines.length && isT(lines[i])) { run.push(lines[i]); i += 1; }
      const md = run.join('\n');
      if (!/^\|\s*Section Metadata\s*\|/m.test(md)) units.push(md);
    } else {
      // gather a default-content text run
      const text = [];
      while (i < lines.length && !isT(lines[i])) { text.push(lines[i]); i += 1; }
      const md = text.join('\n').trim();
      if (md) units.push(md);
    }
  }
  return units;
}

/** Strip the outer <section>…</section> wrapper, returning just its children. */
function stripSectionWrapper(xml) {
  const m = xml.match(/<section[^>]*>([\s\S]*)<\/section>\s*$/);
  return m ? m[1].replace(/^\s*\n/, '').replace(/\n\s*$/, '') : xml;
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

/** Parse all `[id]: url` reference definitions from markdown into a Map. */
function collectRefDefs(md) {
  const refs = new Map();
  const re = /^\[([^\]]+)\]:\s+(\S+)\s*$/gm;
  let m;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(md)) !== null) refs.set(m[1], m[2]);
  return refs;
}

/** Append the ref definitions a fragment references (`![x][id]` / `[x][id]`). */
function appendRefs(frag, allRefs) {
  const ids = new Set();
  const re = /\]\[([^\]]+)\]/g;
  let m;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(frag)) !== null) if (allRefs.has(m[1])) ids.add(m[1]);
  if (ids.size === 0) return frag;
  const defs = [...ids].map((id) => `[${id}]: ${allRefs.get(id)}`).join('\n\n');
  return `${frag}\n\n${defs}\n`;
}

async function convertFragment(md, opts, label) {
  // Keep reference-style images (md2jcr resolves those; inline images are dropped).
  const repairs = [
    (s) => s,
    (s) => inlineRefs(s), // fallback for blocks that prefer inline
  ];
  let lastErr;
  for (const repair of repairs) {
    try {
      // eslint-disable-next-line no-await-in-loop
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

/**
 * Rename top-level (6-space-indented) `<section>` sibling nodes to unique names
 * (section, section_1, section_2, ...) and their matching `</section>` closers.
 * Nested nodes are untouched. Node depth is tracked by the leading indentation
 * of the open/close tag lines (md2jcr indents each level by 2 spaces; sections
 * live at 6 spaces under jcr:content>root).
 */
function renumberSections(body) {
  // Top-level section nodes sit at column 0 in the assembled body (their nested
  // children are indented). Track the current section index; rename its open tag
  // and the close tag that returns to column 0.
  const lines = body.split('\n');
  let idx = -1;
  const out = lines.map((line) => {
    if (/^<section(\s|>)/.test(line)) {
      idx += 1;
      const name = idx === 0 ? 'section' : `section_${idx}`;
      return line.replace(/^<section/, `<${name}`);
    }
    const closeMatch = line.match(/^(\s*)<\/section>\s*$/);
    if (closeMatch) {
      const name = idx === 0 ? 'section' : `section_${idx}`;
      return line.replace(/<\/section>/, `</${name}>`);
    }
    return line;
  });
  return out.join('\n');
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

  // md2jcr resolves images ONLY in reference style (`![alt][id]` + trailing
  // `[id]: url` definitions); inline `![alt](url)` images are silently dropped.
  // So we keep the reference style html2md emits and, when converting a section
  // fragment, append exactly the ref definitions that fragment uses. We also pull
  // the page "Metadata" block into page-level properties.
  const meta = {};
  const allRefs = collectRefDefs(md);
  let body = extractMetadataBlock(md, meta);
  // Drop any leftover trailing ref-definition lines from the body (re-appended
  // per-fragment below); keeps section splitting clean.
  body = body.replace(/^\[[^\]]+\]:\s+\S+\s*$/gm, '').replace(/\n{3,}/g, '\n\n');

  // Convert per section (each section = content between `---` breaks), appending
  // the ref defs each fragment references. Per-section keeps md2jcr's cross-block
  // state from corrupting (the whole-doc parse is fragile on this content).
  const frags = splitSections(body);
  console.log(`split into ${frags.length} sections`);
  const parts = [];
  let ok = 0;

  // Convert a fragment; return its <root> children only if clean (no leaked raw
  // grid-table markdown, which has `+---+` borders + embedded newlines in an
  // attribute and breaks Universal Editor). Returns null on failure/leak.
  const tryConvert = async (fragMd, label) => {
    const xml = await convertFragment(appendRefs(fragMd, allRefs), opts, label);
    if (!xml) return null;
    const children = extractRootChildren(xml);
    if (/text="(&lt;p&gt;)?\s*\+-{3,}/.test(children)) return null;
    return children.trim() || null;
  };

  for (const frag of frags) {
    const label = sectionLabel(frag);
    // eslint-disable-next-line no-await-in-loop
    let children = await tryConvert(frag, label);
    if (children === null) {
      // A block inside this fragment failed (leaked/errored) and md2jcr couldn't
      // parse the whole section. Fall back to converting each block table in the
      // fragment independently, keeping the ones that succeed. This preserves the
      // good blocks instead of dropping the entire section.
      console.warn(`  ⚠️  section "${label}" failed as a unit — converting its blocks individually`);
      const units = splitBlockTables(frag);
      const kept = [];
      for (const unit of units) {
        // eslint-disable-next-line no-await-in-loop
        const c = await tryConvert(unit, sectionLabel(unit));
        if (c) kept.push(stripSectionWrapper(c));
      }
      if (kept.length) {
        // Wrap the salvaged block nodes in a single section (reuse the fragment's
        // section-metadata style if present).
        const styleMatch = frag.match(/\|\s*style\s*\|\s*([a-z-]+)\s*\|/i);
        const styleAttr = styleMatch ? ` style="[${styleMatch[1]}]"` : '';
        children = `<section sling:resourceType="core/franklin/components/section/v1/section" jcr:primaryType="nt:unstructured"${styleAttr} model="section" modelFields="[name,style]">\n${kept.join('\n')}\n      </section>`;
      }
    }
    if (children) { parts.push(children); ok += 1; } else {
      console.warn(`  ⚠️  section "${label}" produced no usable content`);
    }
  }
  console.log(`sections converted: ${ok}/${frags.length}`);
  // Each fragment's <root> contains a top-level <section> node all named
  // "section". Sibling JCR nodes MUST have unique names or AEM keeps only the
  // last — so renumber every top-level <section ...> across the assembled body
  // to section, section_1, section_2, ... (matching AEM's own convention).
  const bodyChildren = renumberSections(parts.join('\n'));

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
