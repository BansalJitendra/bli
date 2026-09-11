/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-review. Base: carousel.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (carousel-review-item):
 *   - media_image  (reference) grouped w/ media_imageAlt (collapses to img attr)
 *   - content_text (richtext) -> testimonial heading, quote, customer name/role
 * Each review slide = one row of 2 cells: [media_image, content_text].
 *
 * Source .customerSpeaks: each .testimonials-list is a review. The customer photo
 * is .cust-image img; the copy is in .text-testimonials (heading + quote) and
 * .customer-information-testimonials (name, role, rating).
 */
export default function parse(element, { document }) {
  const reviewEls = Array.from(element.querySelectorAll('.testimonials-list'));

  if (reviewEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  reviewEls.forEach((review) => {
    const img = review.querySelector('.cust-image img, img');
    const heading = review.querySelector('.text-test-card-head');
    const quote = review.querySelector('.text-test-card-content');
    const name = review.querySelector('.bottom-cust-name');
    const role = review.querySelector('.bottom-cust-job');

    const imageCell = [];
    if (img) {
      imageCell.push(document.createComment(' field:media_image '));
      imageCell.push(img);
    }

    const contentCell = [document.createComment(' field:content_text ')];
    if (heading && heading.textContent.trim()) {
      const h = document.createElement('h3');
      h.textContent = heading.textContent.trim();
      contentCell.push(h);
    }
    if (quote && quote.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = quote.textContent.trim();
      contentCell.push(p);
    }
    if (name && name.textContent.trim()) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = name.textContent.trim();
      p.append(strong);
      if (role && role.textContent.trim()) {
        p.append(document.createTextNode(`, ${role.textContent.trim()}`));
      }
      contentCell.push(p);
    }
    if (contentCell.length === 1) contentCell.push(document.createElement('p'));

    cells.push([
      imageCell.length ? imageCell : '',
      contentCell,
    ]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-review', cells });
  element.replaceWith(block);
}
