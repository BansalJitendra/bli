/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-category. Base: cards.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (cards-category-item):
 *   - image (reference) grouped w/ imageAlt (collapses to img attr)
 *   - text  (richtext) -> heading + nudge + card link
 * Each card = one row of 2 cells: [image, text].
 *
 * Source .cardsproduct > section: leading header (.cards_header_*) is intro copy
 * (not a card) and is dropped; each .card_box_text is a category card holding an
 * icon <img> plus an anchor with heading (.card_box_heading) and nudge
 * (.card_box_nudge).
 */
export default function parse(element, { document }) {
  const cardEls = Array.from(element.querySelectorAll('.card_box_text'));

  if (cardEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cardEls.forEach((card) => {
    const img = card.querySelector('img');
    const link = card.querySelector('a.card_box, a');
    const heading = card.querySelector('.card_box_heading');
    const nudge = card.querySelector('.card_box_nudge');

    const imageCell = [];
    if (img) {
      imageCell.push(document.createComment(' field:image '));
      imageCell.push(img);
    }

    const textCell = [document.createComment(' field:text ')];
    if (heading) {
      const h = document.createElement('h3');
      h.textContent = heading.textContent.trim();
      textCell.push(h);
    }
    if (nudge && nudge.textContent.trim()) {
      const p = document.createElement('p');
      p.append(...nudge.cloneNode(true).childNodes);
      textCell.push(p);
    }
    // Card link as CTA at the bottom of the cell.
    if (link && link.getAttribute('href')) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = (heading && heading.textContent.trim()) || link.textContent.trim();
      textCell.push(a);
    }

    cells.push([
      imageCell.length ? imageCell : '',
      textCell,
    ]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-category', cells });
  element.replaceWith(block);
}
