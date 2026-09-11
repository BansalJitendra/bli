/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-stat. Base: cards.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (cards-stat-item):
 *   - image (reference) grouped w/ imageAlt (collapses to img attr)
 *   - text  (richtext)
 * Each card = one row of 2 cells: [image, text]; image cell may be empty but
 * must still be present.
 *
 * Source .w-li-container carries an optional header (.w-li-header) and the main
 * disclaimer copy (.w-li-main-para). No card imagery, so image cell is empty.
 */
export default function parse(element, { document }) {
  const header = element.querySelector('.w-li-header');
  const para = element.querySelector('.w-li-main-para');

  if ((!header || !header.textContent.trim()) && (!para || !para.textContent.trim())) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const textCell = [document.createComment(' field:text ')];
  if (header && header.textContent.trim()) {
    const h = document.createElement('h3');
    h.textContent = header.textContent.trim();
    textCell.push(h);
  }
  if (para) {
    Array.from(para.childNodes).forEach((node) => textCell.push(node.cloneNode(true)));
  }

  const cells = [['', textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-stat', cells });
  element.replaceWith(block);
}
