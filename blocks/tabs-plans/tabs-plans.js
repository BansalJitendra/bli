// eslint-disable-next-line import/no-unresolved
import { moveInstrumentation } from '../../scripts/scripts.js';

let tabsPlansCnt = 0;

/**
 * Groups the flat richtext sequence inside a tab panel into plan cards.
 * The authored content is a flat run of: [eyebrow p], h3, [desc p], ul, [actions p]
 * repeated per plan. Each new plan starts at an <h3>; the bare <p> that
 * precedes an <h3> is treated as that plan's eyebrow.
 */
function groupCards(panel) {
  const cell = panel.querySelector(':scope > div');
  if (!cell) return;

  const nodes = [...cell.children];
  const cards = [];
  const lead = [];
  let card = null;

  nodes.forEach((node) => {
    if (node.tagName === 'H3') {
      const newCard = document.createElement('div');
      newCard.className = 'tabs-plans-card';
      // A trailing bare <p> on the previous card is really this card's eyebrow.
      if (card) {
        const last = card.lastElementChild;
        if (last && last.tagName === 'P' && !last.querySelector('a')) {
          last.classList.add('tp-eyebrow');
          newCard.appendChild(last);
        }
      }
      newCard.appendChild(node);
      cards.push(newCard);
      card = newCard;
    } else if (card) {
      card.appendChild(node);
    } else {
      lead.push(node);
    }
  });

  // Leading content before the first h3 is the first card's eyebrow.
  if (cards.length) {
    lead.reverse().forEach((n) => {
      if (n.tagName === 'P' && !n.querySelector('a')) n.classList.add('tp-eyebrow');
      cards[0].insertBefore(n, cards[0].firstChild);
    });
  }

  // Classify the elements within each card.
  cards.forEach((c) => {
    const ul = c.querySelector(':scope > ul');
    [...c.children].forEach((el) => {
      if (el.tagName !== 'P') return;
      if (el.querySelector('a')) {
        el.classList.add('tp-actions');
        el.querySelectorAll('a').forEach((a) => {
          a.classList.add(/buy/i.test(a.textContent) ? 'tp-buy' : 'tp-know');
        });
      } else if (!el.classList.contains('tp-eyebrow')) {
        const kids = [...c.children];
        const beforeList = ul && kids.indexOf(el) < kids.indexOf(ul);
        el.classList.add(beforeList ? 'tp-desc' : 'tp-note');
      }
    });
  });

  // Horizontal-scrolling carousel of plan cards (matches the source): a scroll
  // track wrapped in a viewport with prev/next arrow controls.
  const carousel = document.createElement('div');
  carousel.className = 'tabs-plans-carousel';

  const track = document.createElement('div');
  track.className = 'tabs-plans-cards';
  cards.forEach((c) => track.appendChild(c));

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'tabs-plans-arrow tabs-plans-prev';
  prev.setAttribute('aria-label', 'Previous plans');

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'tabs-plans-arrow tabs-plans-next';
  next.setAttribute('aria-label', 'Next plans');

  const scrollByCard = (dir) => {
    const first = track.querySelector('.tabs-plans-card');
    const step = first ? first.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  };
  prev.addEventListener('click', () => scrollByCard(-1));
  next.addEventListener('click', () => scrollByCard(1));

  carousel.append(prev, track, next);
  cell.appendChild(carousel);
}

export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-plans-list';
  tablist.setAttribute('role', 'tablist');
  tabsPlansCnt += 1;
  tablist.id = `tabs-plans-list-${tabsPlansCnt}`;

  const tabHeadings = [...block.children]
    .filter((child) => child.firstElementChild && child.firstElementChild.children.length > 0)
    .map((child) => child.firstElementChild);

  tabHeadings.forEach((tab, i) => {
    const id = `tabs-plans-panel-${tabsPlansCnt}-tab-${i + 1}`;
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-plans-panel';
    tabpanel.id = id;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    const button = document.createElement('button');
    button.className = 'tabs-plans-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => panel.setAttribute('aria-hidden', true));
      tablist.querySelectorAll('button').forEach((btn) => btn.setAttribute('aria-selected', false));
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
    if (button.firstElementChild) moveInstrumentation(button.firstElementChild, null);

    groupCards(tabpanel);
  });

  block.prepend(tablist);
}
