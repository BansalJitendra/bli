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

  // hero-promo is a SIMPLE model block (model: hero-promo, no container filter).
  // md2jcr maps its rows to model fields POSITIONALLY, so we must NOT emit
  // field:* hint comments here — a hinted single-column row is otherwise parsed
  // as a separate block header. Row 1 -> image, Row 2 -> text (richtext).
  const cells = [];

  // Row 1: image (positional -> field "image")
  cells.push([desktopImg || '']);

  // Row 2: text (positional -> field "text"). A paragraph with a short lead-in
  // plus the inline CTA link (a lone link is misread as a component header).
  const alt = (desktopImg && desktopImg.getAttribute('alt') || '').trim();
  const p = document.createElement('p');
  if (link && link.getAttribute('href')) {
    const lead = (alt && alt.toLowerCase() !== 'promotional desktop') ? alt : 'Explore this offer';
    p.append(document.createTextNode(`${lead}. `));
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    const linkText = (link.textContent || '').trim();
    a.textContent = (linkText && linkText !== alt) ? linkText : 'Check Now';
    p.append(a);
  } else {
    p.textContent = alt || 'Promotional banner';
  }
  cells.push([[p]]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-promo', cells });
  element.replaceWith(block);
}
