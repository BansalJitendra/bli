/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (accordion-faq-item):
 *   - summary (text)     -> the clickable question/title (collapses? NO — "summary"
 *                           does not end with a collapsed suffix, so it needs a hint)
 *   - text    (richtext) -> the answer body
 * Each FAQ = one row of 2 cells: [summary, text].
 *
 * Source .faq: each .itemFAQ has .item-head (question in .h2) and .hidden-box
 * (answer richtext).
 */
export default function parse(element, { document }) {
  const itemEls = Array.from(element.querySelectorAll('.itemFAQ'));

  if (itemEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  itemEls.forEach((item) => {
    const question = item.querySelector('.item-head .h2, .item-head p, .item-head');
    const answer = item.querySelector('.hidden-box');

    const summaryCell = [document.createComment(' field:summary ')];
    summaryCell.push(document.createTextNode(question ? question.textContent.trim() : ''));

    const textCell = [document.createComment(' field:text ')];
    if (answer) {
      Array.from(answer.childNodes).forEach((node) => {
        // Skip empty text/whitespace-only nodes at top level
        if (node.nodeType === 3 && !node.textContent.trim()) return;
        textCell.push(node.cloneNode(true));
      });
    }
    if (textCell.length === 1) textCell.push(document.createElement('p'));

    cells.push([summaryCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
