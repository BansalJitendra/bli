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

    li.append(icon, body);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '100' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
