/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-benefit. Base: cards.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (cards-benefit-item):
 *   - text (richtext)   <-- the ONLY field
 * Since the model exposes a single field, each card = one row of ONE cell
 * holding all card content (icon image + title + body) as richtext.
 *
 * Source .cards-row-two > .card: icon <img>, .card-title, and .card-text
 * (multi-paragraph richtext with inline links).
 */
export default function parse(element, { document }) {
  let cardEls;
  if (element.classList && element.classList.contains('card')) {
    cardEls = [element];
  } else {
    cardEls = Array.from(element.querySelectorAll(':scope > .card'));
    if (cardEls.length === 0) cardEls = Array.from(element.querySelectorAll('.card'));
  }

  if (cardEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cardEls.forEach((card) => {
    const img = card.querySelector(':scope > img, img');
    const title = card.querySelector('.card-title');
    const body = card.querySelector('.card-text');

    const textCell = [document.createComment(' field:text ')];
    if (img) textCell.push(img);
    if (title && title.textContent.trim()) {
      const h = document.createElement('h3');
      h.textContent = title.textContent.trim();
      textCell.push(h);
    }
    if (body) {
      Array.from(body.childNodes).forEach((node) => textCell.push(node.cloneNode(true)));
    }

    cells.push([textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-benefit', cells });
  element.replaceWith(block);
}
