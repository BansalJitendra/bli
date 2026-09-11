/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-resource. Base: cards.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (cards-resource-item):
 *   - image (reference) grouped w/ imageAlt (collapses to img attr)
 *   - text  (richtext) -> title, description, CTA
 * Each resource card = one row of 2 cells: [image, text].
 *
 * Mapped selector targets .lifeitembox wrappers; each holds .life-box-item cards
 * with an icon <img> (.box-img), a title (.h5), body (.box-details) and a CTA.
 */
export default function parse(element, { document }) {
  let itemEls = Array.from(element.querySelectorAll('.life-box-item'));
  if (itemEls.length === 0 && element.classList && element.classList.contains('life-box-item')) {
    itemEls = [element];
  }

  if (itemEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  itemEls.forEach((item) => {
    const img = item.querySelector('.box-img img, img');
    const title = item.querySelector('.box-img .h5, .h5');
    const desc = item.querySelector('.box-details p, .box-details');
    const link = item.querySelector('a[href]');

    const imageCell = [];
    if (img) {
      imageCell.push(document.createComment(' field:image '));
      imageCell.push(img);
    }

    const textCell = [document.createComment(' field:text ')];
    if (title && title.textContent.trim()) {
      const h = document.createElement('h4');
      h.textContent = title.textContent.trim();
      textCell.push(h);
    }
    if (desc && desc.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      textCell.push(p);
    }
    if (link && link.getAttribute('href')) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.trim() || (title && title.textContent.trim()) || link.getAttribute('href');
      textCell.push(a);
    }
    if (textCell.length === 1) textCell.push(document.createElement('p'));

    cells.push([
      imageCell.length ? imageCell : '',
      textCell,
    ]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-resource', cells });
  element.replaceWith(block);
}
