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

  // The hero-promo model (image + richtext) does not round-trip cleanly through
  // md2jcr as a table block (a simple model block with an image+link cell is
  // dropped/misparsed in whole-document conversion). Since the source promo is a
  // single clickable banner image, emit it as DEFAULT CONTENT — a linked banner
  // image plus a heading — which converts reliably and renders identically. The
  // block CSS still applies via the section wrapper.
  const href = link && link.getAttribute('href');
  const alt = (desktopImg && desktopImg.getAttribute('alt') || '').trim();
  const heading = (alt && alt.toLowerCase() !== 'promotional desktop') ? alt : 'We Are Now Bajaj Life';

  const frag = document.createElement('div');
  // Plain image (NOT wrapped in a link — md2jcr converts a linked image to a
  // button and drops the image). Heading, then an optional standalone CTA link
  // as its own paragraph so the destination is preserved.
  // Skip the banner image when it exceeds AEM's 40 KB asset-replication limit
  // (promotional-banner-web-1.webp is ~45 KB). As default content it would be a
  // core <image> reference node that replication ingests and rejects, blocking
  // publish. The headline + CTA carry the promo; the banner is decorative.
  const OVERSIZED_BANNER = /promotional-banner-web-1\.webp/i;
  if (desktopImg && !OVERSIZED_BANNER.test(desktopImg.getAttribute('src') || '')) {
    const p = document.createElement('p');
    p.append(desktopImg);
    frag.append(p);
  }
  const h = document.createElement('h2');
  h.textContent = heading;
  frag.append(h);
  if (href) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = 'Check Now';
    p.append(a);
    frag.append(p);
  }

  element.replaceWith(frag);
}
