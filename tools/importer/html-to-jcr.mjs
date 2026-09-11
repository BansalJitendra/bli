/*
 * Convert content/index.plain.html -> markdown -> JCR XML for xwalk upload.
 * Pipeline: helix-html2md (HTML -> MD) then helix-md2jcr (MD + UE files -> JCR XML).
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { html2md } from '@adobe/helix-html2md';
import { md2jcr } from '@adobe/helix-md2jcr/src/index.js';

const ROOT = process.cwd();

const log = {
  debug() {}, info() {}, warn(...a) { console.warn(...a); }, error(...a) { console.error(...a); },
};

async function readJson(p) {
  return JSON.parse(await readFile(path.resolve(ROOT, p), 'utf-8'));
}

/**
 * Re-pad grid tables so every column border is wider than its widest cell.
 * Operates on contiguous runs of lines that are grid-table rows (start with
 * '+' or '|'). A separator line ('+---+') defines the column boundaries; every
 * data row in the run is re-split on those boundaries, then all rows + separators
 * are re-emitted using per-column widths = max(content) across the run.
 */
function normalizeGridTables(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  const isTableLine = (l) => l.startsWith('+') || l.startsWith('|');
  while (i < lines.length) {
    if (!isTableLine(lines[i])) { out.push(lines[i]); i += 1; continue; }
    // collect the run
    const run = [];
    while (i < lines.length && isTableLine(lines[i])) { run.push(lines[i]); i += 1; }
    out.push(...repadRun(run));
  }
  return out.join('\n');
}

function repadRun(run) {
  // Only handle SINGLE-COLUMN tables (one cell per data row) — that's where the
  // overflow bug bites (long image URLs / long CTA text in 1-col block cells).
  // Multi-column tables (container items, tabs) use wrapped multi-line cells that
  // must NOT be re-split; leave those runs untouched.
  const dataRows = run.filter((l) => l.startsWith('|'));
  if (dataRows.length === 0) return run;
  const colCount = (l) => l.split('|').slice(1, -1).length;
  const anyMultiCol = dataRows.some((l) => colCount(l) > 1);
  if (anyMultiCol) return run; // leave complex tables as-is

  // Single-column run: widen every border/line to the widest content line.
  const cellOf = (l) => l.split('|').slice(1, -1)[0].trim();
  const width = Math.max(...dataRows.map((l) => cellOf(l).length), 10);
  const result = [];
  for (const l of run) {
    if (l.startsWith('+')) {
      result.push(`+${(l.includes('=') ? '=' : '-').repeat(width + 2)}+`);
    } else {
      result.push(`| ${cellOf(l).padEnd(width)} |`);
    }
  }
  return result;
}

async function main() {
  const inHtml = process.argv[2] || 'content/index.plain.html';
  const base = path.basename(inHtml, '.plain.html');
  const outMd = path.resolve(ROOT, 'migration-work/jcr-content', `${base}.md`);
  const outXml = path.resolve(ROOT, 'migration-work/jcr-content', `${base}.xml`);

  const plain = await readFile(path.resolve(ROOT, inHtml), 'utf-8');
  // .plain.html is body content; html2md needs a <main> wrapper.
  const html = `<!DOCTYPE html><html><body><main>${plain}</main></body></html>`;

  let md = await html2md(html, {
    log,
    url: 'https://www.bajajlifeinsurance.com/',
    // keep external/DM image URLs as-is; no media handler upload in this pass
    mediaHandler: undefined,
    imageFilter: () => false, // do not attempt to fetch/upload images
  });

  // md2jcr miscounts container-block item rows when reference-style images
  // ([img][id] + trailing "[id]: url" definitions) resolve into a rich-text cell.
  // Inline every reference-style image/link and drop the trailing definitions so
  // each block table is self-contained.
  const refs = {};
  const refRe = /^\[([^\]]+)\]:\s+(\S+)\s*$/gm;
  let rm;
  // eslint-disable-next-line no-cond-assign
  while ((rm = refRe.exec(md)) !== null) refs[rm[1]] = rm[2];
  md = md
    .replace(/!\[([^\]]*)\]\[([^\]]+)\]/g, (f, alt, id) => (refs[id] ? `![${alt}](${refs[id]})` : f))
    .replace(/(^|[^!])\[([^\]]+)\]\[([^\]]+)\]/g, (f, pre, txt, id) => (refs[id] ? `${pre}[${txt}](${refs[id]})` : f))
    .replace(/^\[[^\]]+\]:\s+\S+\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n');

  // html2md's grid-table stringifier can emit columns NARROWER than their cell
  // content (long DM image URLs, long lines). md2jcr then mis-parses the row and
  // reads following content as a block/component header. Re-pad every grid table
  // so each column is at least as wide as its widest cell.
  md = normalizeGridTables(md);

  await writeFile(outMd, md);
  console.log(`markdown written: ${outMd} (${md.length} bytes)`);

  const models = await readJson('component-models.json');
  const definition = await readJson('component-definition.json');
  const filters = await readJson('component-filters.json');

  const xml = await md2jcr(md, {
    models: Array.isArray(models) ? models : models.models,
    definition,
    filters: Array.isArray(filters) ? filters : filters.filters,
    log,
  });
  await writeFile(outXml, xml);
  console.log(`jcr xml written: ${outXml} (${xml.length} bytes)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
