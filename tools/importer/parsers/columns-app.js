/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-app. Base: columns.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * Columns block: the second table row holds one cell per column. Per the
 * field-hinting rules, Columns blocks do NOT use field:* comments — only default
 * content in the cells.
 *
 * Source .alip-container is a two-column "Life Insurance App" promo:
 *   - .alip-left  -> app hero image (column 1)
 *   - .alip-right -> heading, feature list, download CTAs, QR code (column 2)
 */
export default function parse(element, { document }) {
  const left = element.querySelector(':scope > .alip-left');
  const right = element.querySelector(':scope > .alip-right');

  if (!left && !right) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const leftCell = document.createElement('div');
  if (left) {
    Array.from(left.childNodes).forEach((node) => leftCell.append(node.cloneNode(true)));
  }

  const rightCell = document.createElement('div');
  if (right) {
    Array.from(right.childNodes).forEach((node) => rightCell.append(node.cloneNode(true)));
  }

  const cells = [[leftCell, rightCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-app', cells });
  element.replaceWith(block);
}
