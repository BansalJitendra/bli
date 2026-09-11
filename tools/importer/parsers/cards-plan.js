/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-plan. Base: cards.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (cards-plan-item):
 *   - image (reference) grouped w/ imageAlt (collapses to img attr)
 *   - text  (richtext) -> plan name, subheading, benefit points, CTAs
 * Each plan card = one row of 2 cells: [image, text].
 *
 * The mapped selector targets individual .life-comp2-card elements. When the
 * parser runs on the container it may receive the wrapper; handle both by
 * collecting the card(s) within (or the element itself if it is a card).
 */
export default function parse(element, { document }) {
  let cardEls;
  if (element.classList && element.classList.contains('life-comp2-card')) {
    cardEls = [element];
  } else {
    cardEls = Array.from(element.querySelectorAll('.life-comp2-card'));
  }

  if (cardEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cardEls.forEach((card) => {
    // Icon image inside the "best selling" badge button, if any.
    const img = card.querySelector('.termplan button img, img');

    const imageCell = [];
    if (img) {
      imageCell.push(document.createComment(' field:image '));
      imageCell.push(img);
    }

    const textCell = [document.createComment(' field:text ')];
    const category = card.querySelector('.termplan .h4');
    const badge = card.querySelector('.termplan button');
    const heading = card.querySelector('.bajaj-smart .h2');
    const sub = card.querySelector('.subheading-asynctabs');

    if (category && category.textContent.trim()) {
      const p = document.createElement('p');
      p.append(...category.cloneNode(true).childNodes);
      textCell.push(p);
    }
    if (badge && badge.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = badge.textContent.trim();
      textCell.push(p);
    }
    if (heading && heading.textContent.trim()) {
      const h = document.createElement('h3');
      h.textContent = heading.textContent.trim();
      textCell.push(h);
    }
    if (sub && sub.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = sub.textContent.trim();
      textCell.push(p);
    }
    const points = Array.from(card.querySelectorAll('.card2-middle-details .h3'));
    if (points.length) {
      const ul = document.createElement('ul');
      points.forEach((pt) => {
        const li = document.createElement('li');
        li.append(...pt.cloneNode(true).childNodes);
        ul.append(li);
      });
      textCell.push(ul);
    }
    card.querySelectorAll('.card2-last a[href]').forEach((a) => {
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent.trim();
      textCell.push(link);
    });

    cells.push([
      imageCell.length ? imageCell : '',
      textCell,
    ]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-plan', cells });
  element.replaceWith(block);
}
