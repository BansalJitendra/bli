/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-claimbar. Base: columns.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * Columns block: content laid out side by side; the second table row holds one
 * cell per column. Per the field-hinting rules, Columns blocks do NOT use
 * field:* comments — only default content in the cells.
 *
 * Source .nhcontb-one is the "Number of Claims Settled" claim bar: a label plus
 * a row of individual digit boxes. We present the label in one column and the
 * assembled number in a second column.
 */
export default function parse(element, { document }) {
  const label = element.querySelector(':scope > span, :scope > .nhcbo-label');
  const digitEls = Array.from(element.querySelectorAll('.nhcbb-num'));

  if (!label && digitEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Column 1: the label
  const labelCell = document.createElement('div');
  if (label) labelCell.append(label.cloneNode(true));

  // Column 2: the settled-claims number, assembled from the digit boxes
  const numberCell = document.createElement('div');
  const digits = digitEls.map((d) => d.textContent.trim()).join('');
  if (digits) {
    const p = document.createElement('p');
    p.textContent = digits;
    numberCell.append(p);
  }

  const cells = [[labelCell, numberCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-claimbar', cells });
  element.replaceWith(block);
}
