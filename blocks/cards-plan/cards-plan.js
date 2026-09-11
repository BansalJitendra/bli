import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/** True when `el` appears before `other` in document order among siblings. */
function isBefore(el, other) {
  const siblings = [...el.parentElement.children];
  return siblings.indexOf(el) < siblings.indexOf(other);
}

/**
 * Classify the richtext body of a single plan card so the CSS can style each
 * part: eyebrow banner, plan name, plan-type sub-line, benefit checklist and
 * the Buy Now / Know More actions. Mirrors the source .life-comp2-card layout.
 */
function decorateCardBody(body) {
  const ul = body.querySelector(':scope > ul');
  const h3 = body.querySelector(':scope > h3');
  [...body.children].forEach((el) => {
    if (el.tagName === 'P') {
      if (el.querySelector('a')) {
        el.classList.add('cards-plan-actions');
        el.querySelectorAll('a').forEach((a) => {
          a.classList.add(/buy/i.test(a.textContent) ? 'cards-plan-buy' : 'cards-plan-know');
        });
      } else if (h3 && isBefore(el, h3)) {
        // bare <p> before the plan name is the eyebrow banner
        el.classList.add('cards-plan-eyebrow');
      } else if (ul && isBefore(el, ul)) {
        // bare <p> after the name but before the checklist is the sub-line
        el.classList.add('cards-plan-sub');
      } else {
        el.classList.add('cards-plan-note');
      }
    }
  });
  if (ul) ul.classList.add('cards-plan-checklist');
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-plan-card-image';
      } else {
        div.className = 'cards-plan-card-body';
        decorateCardBody(div);
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
