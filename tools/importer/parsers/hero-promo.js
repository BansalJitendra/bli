/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-promo. Base: hero.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk simple block. Model (hero-promo):
 *   - image (reference) grouped w/ imageAlt (collapses to img attr)
 *   - text  (richtext)
 * Simple block: one column, one row per field (image row, then text row).
 *
 * Source .promotionalbanner holds a desktop (.fordesktop) and mobile
 * (.formobile) variant of the same promo, each an <a> wrapping an <img>. We use
 * the desktop image as the block image and carry the promo link as the text CTA.
 */
export default function parse(element, { document }) {
  const desktopImg = element.querySelector('.fordesktop img, img');
  const link = element.querySelector('.fordesktop a[href], a[href]');

  if (!desktopImg && !link) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 1: image
  const imageCell = [];
  if (desktopImg) {
    imageCell.push(document.createComment(' field:image '));
    imageCell.push(desktopImg);
  }
  cells.push([imageCell.length ? imageCell : '']);

  // Row 2: text — the promo destination link
  const textCell = [document.createComment(' field:text ')];
  if (link && link.getAttribute('href')) {
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    const alt = desktopImg && desktopImg.getAttribute('alt');
    a.textContent = (alt && alt.trim()) || 'View offer';
    textCell.push(a);
  } else {
    textCell.push(document.createElement('p'));
  }
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-promo', cells });
  element.replaceWith(block);
}
