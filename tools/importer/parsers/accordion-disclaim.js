/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-disclaim. Base: accordion.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (accordion-disclaim-item):
 *   - summary (text)     -> the clickable disclaimer title/label
 *   - text    (richtext) -> the disclaimer body
 * Each disclaimer = one row of 2 cells: [summary, text].
 *
 * Source .disclaimer is a flat block of footnote/disclaimer paragraphs (no
 * per-item head in the DOM). We surface it as a single accordion item with a
 * "Disclaimer" summary and the paragraph content as the body richtext.
 */
export default function parse(element, { document }) {
  const paras = Array.from(element.querySelectorAll(':scope > p, :scope > div'));
  const hasText = element.textContent && element.textContent.trim();

  if (!hasText) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const summaryCell = [document.createComment(' field:summary '), document.createTextNode('Disclaimer')];

  const textCell = [document.createComment(' field:text ')];
  if (paras.length) {
    paras.forEach((p) => textCell.push(p.cloneNode(true)));
  } else {
    const p = document.createElement('p');
    p.textContent = element.textContent.trim();
    textCell.push(p);
  }

  const cells = [[summaryCell, textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-disclaim', cells });
  element.replaceWith(block);
}
