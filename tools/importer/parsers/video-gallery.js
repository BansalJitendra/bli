/* eslint-disable */
/* global WebImporter */
/**
 * Parser for video-gallery. Base: video.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (video-gallery-item):
 *   - image (reference) grouped w/ imageAlt (collapses to img attr) -> poster thumb
 *   - text  (richtext) -> video title / caption
 *   - link  (aem-content) -> the video URL (from data-src)
 * Each video = one row of 3 cells: [image, text, link].
 *
 * Source .fundVideo: each playlist entry is a .fv-list__item carrying the video
 * URL in data-src, a poster thumb (.fv-list__thumb), duration (.fv-list__duration)
 * and title (.fv-list__title).
 */
export default function parse(element, { document }) {
  const itemEls = Array.from(element.querySelectorAll('.fv-list__item'));

  if (itemEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  itemEls.forEach((item) => {
    const thumb = item.querySelector('.fv-list__thumb, img');
    const title = item.querySelector('.fv-list__title');
    const duration = item.querySelector('.fv-list__duration');
    const src = item.getAttribute('data-src') || (item.querySelector('a') && item.querySelector('a').getAttribute('href'));

    // image cell (poster)
    const imageCell = [];
    if (thumb) {
      imageCell.push(document.createComment(' field:image '));
      imageCell.push(thumb);
    }

    // text cell (title + duration)
    const textCell = [document.createComment(' field:text ')];
    if (title && title.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = title.textContent.trim();
      textCell.push(p);
    }
    if (duration && duration.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = duration.textContent.trim();
      textCell.push(p);
    }
    if (textCell.length === 1) textCell.push(document.createElement('p'));

    // link cell (video URL)
    const linkCell = [];
    if (src) {
      linkCell.push(document.createComment(' field:link '));
      const a = document.createElement('a');
      a.href = src;
      a.textContent = (title && title.textContent.trim()) || src;
      linkCell.push(a);
    }

    cells.push([
      imageCell.length ? imageCell : '',
      textCell,
      linkCell.length ? linkCell : '',
    ]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'video-gallery', cells });
  element.replaceWith(block);
}
