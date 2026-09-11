/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base: cards.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (cards-product-item):
 *   - image (reference) grouped w/ imageAlt (collapses to img attr)
 *   - text  (richtext)
 * Each card = one row of 2 cells: [image, text]. image cell may be empty but
 * must still be present (per block description).
 *
 * Source is .newhero-contbottom containing two informational panels
 * (.nhcontb-one = claims counter, .nhcontb-two = "how can we help" links).
 * No card imagery in the source, so the image cell is emitted empty.
 */
export default function parse(element, { document }) {
  // Each direct panel becomes a card row.
  let panels = Array.from(element.querySelectorAll(':scope > .nhcontb-one, :scope > .nhcontb-two'));
  if (panels.length === 0) {
    panels = Array.from(element.querySelectorAll(':scope > div'));
  }

  const cells = [];
  panels.forEach((panel) => {
    const img = panel.querySelector('img');

    const imageCell = [];
    if (img) {
      imageCell.push(document.createComment(' field:image '));
      imageCell.push(img);
    }

    const textCell = [document.createComment(' field:text ')];
    // Preserve the panel's inner content (headings, options, links) as richtext.
    Array.from(panel.childNodes).forEach((node) => {
      if (node.nodeType === 1 && node.tagName === 'IMG') return; // image handled above
      textCell.push(node.cloneNode(true));
    });

    cells.push([
      imageCell.length ? imageCell : '',
      textCell,
    ]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
