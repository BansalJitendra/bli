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

/** Widen SINGLE-COLUMN grid tables so no cell overflows its border. */
function repadSingleColTables(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  const isT = (l) => l.startsWith('+') || l.startsWith('|');
  while (i < lines.length) {
    if (!isT(lines[i])) { out.push(lines[i]); i += 1; continue; }
    const run = [];
    while (i < lines.length && isT(lines[i])) { run.push(lines[i]); i += 1; }
    const dataRows = run.filter((l) => l.startsWith('|'));
    const cols = (l) => l.split('|').slice(1, -1).length;
    if (dataRows.length && !dataRows.some((l) => cols(l) > 1)) {
      const cell = (l) => l.split('|').slice(1, -1)[0].trim();
      const w = Math.max(...dataRows.map((l) => cell(l).length), 10);
      run.forEach((l) => out.push(l.startsWith('+')
        ? `+${(l.includes('=') ? '=' : '-').repeat(w + 2)}+`
        : `| ${cell(l).padEnd(w)} |`));
    } else {
      out.push(...run);
    }
  }
  return out.join('\n');
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

  // Try the whole document first (fast path).
  let bodyChildren = null;
  try {
    const whole = await md2jcr(repadSingleColTables(inlineRefs(md)), opts);
    bodyChildren = extractRootChildren(whole);
    console.log('whole-document conversion succeeded');
  } catch (e) {
    console.log(`whole-document conversion failed (${e.message.split('\n')[0]}); converting per-section`);
  }

  if (bodyChildren === null) {
    const frags = splitSections(md);
    console.log(`split into ${frags.length} sections`);
    const parts = [];
    let ok = 0;
    for (const frag of frags) {
      const label = sectionLabel(frag);
      // eslint-disable-next-line no-await-in-loop
      const xml = await convertFragment(frag, opts, label);
      if (xml) {
        const children = extractRootChildren(xml);
        if (children.trim()) { parts.push(children); ok += 1; }
      }
    }
    console.log(`sections converted: ${ok}/${frags.length}`);
    bodyChildren = parts.join('\n');
  }

  const xml = `${XML_HEADER}\n${JCR_OPEN}\n`
    + '  <jcr:content cq:template="/libs/core/franklin/templates/page" sling:resourceType="core/franklin/components/page/v1/page" jcr:primaryType="cq:PageContent">\n'
    + '    <root jcr:primaryType="nt:unstructured" sling:resourceType="core/franklin/components/root/v1/root">\n'
    + `${bodyChildren}\n`
    + '    </root>\n'
    + '  </jcr:content>\n'
    + '</jcr:root>\n';

  await writeFile(outXml, xml);
  console.log(`jcr xml written: ${outXml} (${xml.length} bytes)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
