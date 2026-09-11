/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-contact. Base: cards.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (cards-contact-item):
 *   - text (richtext)   <-- the ONLY field
 * Single-field item: each card = one row of ONE cell holding all content as
 * richtext.
 *
 * Source .needHelp is a "need help / ask for an agent" widget. The authorable
 * card content is the header block (.prom-p-h): a title (.prom-p-h-h1) and a
 * subheading (.prom-p-h-h5). The popup/form/loader scaffolding is runtime UI and
 * is not imported as content.
 */
export default function parse(element, { document }) {
  const header = element.querySelector('.prom-p-h');
  const title = element.querySelector('.prom-p-h-h1');
  const sub = element.querySelector('.prom-p-h-h5');

  if ((!title || !title.textContent.trim()) && (!sub || !sub.textContent.trim()) && !header) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const textCell = [document.createComment(' field:text ')];
  if (title && title.textContent.trim()) {
    const h = document.createElement('h3');
    h.textContent = title.textContent.trim();
    textCell.push(h);
  }
  if (sub && sub.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = sub.textContent.trim();
    textCell.push(p);
  }
  if (textCell.length === 1) textCell.push(document.createElement('p'));

  const cells = [[textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-contact', cells });
  element.replaceWith(block);
}
