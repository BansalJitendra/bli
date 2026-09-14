import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    // Each row is a single cell holding: <p><picture></picture></p>, <h3>, <p>...
    const cell = row.querySelector(':scope > div') || row;

    // Pull the icon (picture) into its own leading element.
    const icon = document.createElement('div');
    icon.className = 'cards-benefit-card-icon';
    const picture = cell.querySelector('picture');
    if (picture) icon.append(picture);

    // Everything else (title + paragraphs) becomes the text body.
    const body = document.createElement('div');
    body.className = 'cards-benefit-card-body';
    [...cell.children].forEach((child) => {
      // Skip the now-empty paragraph that used to wrap the picture.
      if (child.tagName === 'P' && !child.textContent.trim() && !child.querySelector('img, picture, a')) return;
      body.append(child);
    });

    // "numbered" variant: a short numeric leading paragraph (e.g. "01") is the
    // card's step number rather than an icon. Tag it so it can be styled as
    // the leading number and skip the empty icon slot.
    const firstP = body.querySelector(':scope > p');
    if (!picture && firstP && /^\d{1,2}$/.test(firstP.textContent.trim())) {
      firstP.classList.add('cards-benefit-card-num');
      // The paragraph right after the number is the benefit title.
      const titleP = firstP.nextElementSibling;
      if (titleP && titleP.tagName === 'P') titleP.classList.add('cards-benefit-card-title');
      li.append(body);
    } else {
      li.append(icon, body);
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '100' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  // If the cards are numbered (step numbers, no icons), ensure the "numbered"
  // variant styling applies even when that variant class was stripped during
  // the content round-trip (the JCR conversion drops block modifiers).
  if (ul.querySelector('.cards-benefit-card-num')) {
    block.classList.add('numbered');
  }

  block.textContent = '';
  block.append(ul);
}
