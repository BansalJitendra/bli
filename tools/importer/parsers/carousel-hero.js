/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (carousel-hero-item):
 *   - media_image  (reference)   -> grouped w/ media_imageAlt (Alt collapses to img attr)
 *   - content_text (richtext)
 * Each slide = one row with 2 cells: [media_image, content_text].
 *
 * The source hero (.newhero-container) renders its slides client-side from a
 * data-tabsdata JSON blob; only the active banner image (#bannerImage) plus the
 * plan navigation labels (.newhnavlist li) are present in the DOM. We build a
 * single slide from what is actually rendered.
 */
export default function parse(element, { document }) {
  const img = element.querySelector('#bannerImage, .home-banner-img img, img');
  // Plan navigation labels shown alongside the banner.
  const navLabels = Array.from(element.querySelectorAll('.newhnavlist li'))
    .map((li) => li.textContent.trim())
    .filter(Boolean);
  const heading = element.querySelector('.planFormHeading1-class, .planFormHeading2-class');

  if (!img && navLabels.length === 0 && !heading) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // media_image cell (media_imageAlt collapses into the img alt attribute)
  const imageCell = [];
  if (img) {
    imageCell.push(document.createComment(' field:media_image '));
    imageCell.push(img);
  }

  // content_text cell — heading + rendered plan labels
  const contentCell = [document.createComment(' field:content_text ')];
  if (heading && heading.textContent.trim()) {
    const h = document.createElement('h2');
    h.textContent = heading.textContent.trim();
    contentCell.push(h);
  }
  navLabels.forEach((label) => {
    const p = document.createElement('p');
    p.textContent = label;
    contentCell.push(p);
  });
  // Guard: if no textual content collected, keep the hint with an empty paragraph
  if (contentCell.length === 1) contentCell.push(document.createElement('p'));

  cells.push([
    imageCell.length ? imageCell : '',
    contentCell,
  ]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
