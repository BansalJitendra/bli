/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-app. Base: columns.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * Columns block: the second table row holds one cell per column. Per the
 * field-hinting rules, Columns blocks do NOT use field:* comments — only default
 * content in the cells.
 *
 * Source .alip-container is a two-column "Life Insurance App" promo:
 *   - .alip-left  -> app hero image (column 1)
 *   - .alip-right -> heading, feature list, download CTAs, QR code (column 2)
 */
export default function parse(element, { document }) {
  const left = element.querySelector(':scope > .alip-left');
  const right = element.querySelector(':scope > .alip-right');

  if (!left && !right) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // The `columns` component does not round-trip through md2jcr when a cell holds
  // rich content with images (the block is dropped and its raw grid-table markdown
  // leaks into a text node with embedded newlines, which breaks Universal Editor).
  // Emit the promo as DEFAULT CONTENT — image, then the right-column content —
  // which converts cleanly. Block CSS still applies via the section wrapper.
  const frag = document.createElement('div');
  if (left) Array.from(left.childNodes).forEach((n) => frag.append(n.cloneNode(true)));
  if (right) Array.from(right.childNodes).forEach((n) => frag.append(n.cloneNode(true)));

  // The left phone-mockup (mobile-app-1.svg, ~745 KB) is a default-content image,
  // so md2jcr stores it as a core <image> reference node — which AEM replication
  // tries to ingest and rejects (>40 KB), blocking publish. It's decorative; drop
  // it. The promo's heading, features, store badges and QR (all small) remain.
  frag.querySelectorAll('img').forEach((img) => {
    if (/mobile-app-1\.svg/i.test(img.getAttribute('src') || '')) {
      (img.closest('p') || img.closest('picture') || img).remove();
    }
  });

  element.replaceWith(frag);
}
