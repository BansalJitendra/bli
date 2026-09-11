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
 * the desktop image as the block image; the destination link is preserved as a
 * data-href on the image wrapper so the block JS can make the whole banner
 * clickable (the source banner is a single clickable image).
 */
export default function parse(element, { document }) {
  const desktopImg = element.querySelector('.fordesktop img, img');
  const link = element.querySelector('.fordesktop a[href], a[href]');

  if (!desktopImg && !link) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // hero-promo is a SIMPLE model block (model: hero-promo, no container filter).
  // Emit image + text in ONE cell (single column, single row): md2jcr maps the
  // image to `image` and the trailing text to `text`. Splitting them into two
  // single-column rows makes md2jcr read the 2nd row as a new block header in
  // whole-document context (and a bare/inline link in the text field is likewise
  // misread), so keep both in one cell with plain text (no markdown link — the
  // CTA destination rides on the image's wrapping <a>).
  const href = link && link.getAttribute('href');
  const alt = (desktopImg && desktopImg.getAttribute('alt') || '').trim();

  const cellContent = [];
  if (desktopImg && href) {
    const a = document.createElement('a');
    a.href = href;
    a.append(desktopImg);
    cellContent.push(a);
  } else if (desktopImg) {
    cellContent.push(desktopImg);
  }
  const p = document.createElement('p');
  p.textContent = (alt && alt.toLowerCase() !== 'promotional desktop') ? alt : 'We Are Now Bajaj Life';
  cellContent.push(p);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-promo', cells: [[cellContent]] });
  element.replaceWith(block);
}
