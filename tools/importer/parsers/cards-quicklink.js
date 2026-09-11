/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-quicklink. Base: cards.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (cards-quicklink-item):
 *   - image (reference) grouped w/ imageAlt (collapses to img attr)
 *   - text  (richtext) -> quick-link title + destination link
 * Each quick link = one row of 2 cells: [image, text].
 *
 * Source section.our_offering: intro header (.head-details) is dropped; each
 * .services-ibox holds an icon <img> plus an anchor (.services_item_bx) whose
 * label is in .h4. The trailing "View All" link is intro/nav, not a card.
 */
export default function parse(element, { document }) {
  const cardEls = Array.from(element.querySelectorAll('.services-ibox'));

  if (cardEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cardEls.forEach((card) => {
    const img = card.querySelector('.cardhedaimg img, img');
    const link = card.querySelector('a.services_item_bx, a');
    const title = card.querySelector('.h4');

    const imageCell = [];
    if (img) {
      imageCell.push(document.createComment(' field:image '));
      imageCell.push(img);
    }

    const textCell = [document.createComment(' field:text ')];
    const label = (title && title.textContent.trim()) || (link && link.textContent.trim()) || '';
    if (link && link.getAttribute('href')) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = label;
      textCell.push(a);
    } else if (label) {
      const p = document.createElement('p');
      p.textContent = label;
      textCell.push(p);
    }

    cells.push([
      imageCell.length ? imageCell : '',
      textCell,
    ]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-quicklink', cells });
  element.replaceWith(block);
}
