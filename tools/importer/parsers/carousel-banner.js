/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-banner. Base: carousel.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (carousel-banner-item):
 *   - media_image  (reference) grouped w/ media_imageAlt (collapses to img attr)
 *   - content_text (richtext) -> optional caption / destination link
 * Each banner slide = one row of 2 cells: [media_image, content_text].
 *
 * Source .revampCarousel > .slides-container: each .carouselslide wraps an
 * <a><img></a>. An optional data-videolink on the anchor is the slide's target.
 */
export default function parse(element, { document }) {
  const slideEls = Array.from(element.querySelectorAll('.slides-container .carouselslide, .carouselslide'));

  if (slideEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  slideEls.forEach((slide) => {
    const img = slide.querySelector('img');
    const anchor = slide.querySelector('a[data-videolink], a[href]');
    const target = anchor
      && (anchor.getAttribute('data-videolink')
        || (anchor.getAttribute('href') && !anchor.getAttribute('href').includes('javascript')
          ? anchor.getAttribute('href') : ''));

    const imageCell = [];
    if (img) {
      imageCell.push(document.createComment(' field:media_image '));
      imageCell.push(img);
    }

    const contentCell = [document.createComment(' field:content_text ')];
    if (target) {
      const a = document.createElement('a');
      a.href = target;
      a.textContent = (img && img.getAttribute('alt') && img.getAttribute('alt').trim()) || 'View';
      contentCell.push(a);
    } else if (img && img.getAttribute('alt') && img.getAttribute('alt').trim()) {
      const p = document.createElement('p');
      p.textContent = img.getAttribute('alt').trim();
      contentCell.push(p);
    } else {
      contentCell.push(document.createElement('p'));
    }

    cells.push([
      imageCell.length ? imageCell : '',
      contentCell,
    ]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-banner', cells });
  element.replaceWith(block);
}
