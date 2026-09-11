import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // Full-width promo banner: a background image cell + a content cell (headline, sub-line, CTA).
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic && col.children.length === 1 && col.querySelector('p, h1, h2, h3, h4, h5, h6, a') === null) {
        col.classList.add('hero-promo-bg');
      } else {
        col.classList.add('hero-promo-content');
      }
    });
  });
  block.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '1600' }]);
    img.closest('picture').replaceWith(optimized);
  });
}
