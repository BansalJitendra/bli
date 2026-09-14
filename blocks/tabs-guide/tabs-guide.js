// eslint-disable-next-line import/no-unresolved
import { moveInstrumentation } from '../../scripts/scripts.js';

let tabsGuideCnt = 0;

/**
 * Group a panel's flat richtext (picture, heading, paragraphs, optional link)
 * into individual resource cards. Each card starts at a picture/image.
 */
function buildCards(panel) {
  const nodes = [...panel.children];
  const cards = [];
  let current = null;

  const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
  const hasImage = (el) => el.querySelector && el.querySelector('picture, img');

  // A new resource card begins at a card image, or at a heading only when the
  // card wasn't already started by its leading image. This keeps an
  // image + heading pair together in one card (when images are present) while
  // still splitting on headings alone (when thumbnails were dropped on import).
  let startedByImage = false;
  nodes.forEach((node) => {
    const img = hasImage(node);
    if (img || (isHeading(node) && !startedByImage)) {
      current = document.createElement('div');
      current.className = 'tabs-guide-card';
      cards.push(current);
      startedByImage = !!img;
    } else if (!isHeading(node)) {
      startedByImage = false;
    }
    if (!current) {
      current = document.createElement('div');
      current.className = 'tabs-guide-card';
      cards.push(current);
    }
    current.append(node);
  });

  if (!cards.length) return;

  // Restructure each card: head (image + title), body (description), footer (button)
  cards.forEach((card) => {
    const pic = card.querySelector('picture, img');
    const heading = card.querySelector('h1, h2, h3, h4, h5, h6');
    const link = card.querySelector('a');

    const head = document.createElement('div');
    head.className = 'tabs-guide-card-head';
    if (pic) {
      const picHost = pic.closest('p') || pic;
      head.append(pic);
      if (picHost !== pic && picHost.parentElement) picHost.remove();
    }
    if (heading) {
      heading.classList.add('tabs-guide-card-title');
      head.append(heading);
    }

    const body = document.createElement('div');
    body.className = 'tabs-guide-card-body';
    // remaining paragraphs that are not the link container become description
    [...card.children].forEach((child) => {
      if (child === head) return;
      if (child.querySelector && child.querySelector('a')) return;
      body.append(child);
    });

    card.textContent = '';
    card.append(head);
    if (body.children.length) card.append(body);

    if (link) {
      const footer = document.createElement('div');
      footer.className = 'tabs-guide-card-footer';
      link.classList.add('tabs-guide-card-btn');
      footer.append(link);
      card.append(footer);
    }
  });

  const grid = document.createElement('div');
  grid.className = 'tabs-guide-cards';
  cards.forEach((c) => grid.append(c));
  panel.textContent = '';
  panel.append(grid);
}

export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-guide-list';
  tablist.setAttribute('role', 'tablist');
  tabsGuideCnt += 1;
  tablist.id = `tabs-guide-list-${tabsGuideCnt}`;

  const tabHeadings = [...block.children]
    .filter((child) => child.firstElementChild && child.firstElementChild.children.length > 0)
    .map((child) => child.firstElementChild);

  tabHeadings.forEach((tab, i) => {
    const id = `tabs-guide-panel-${tabsGuideCnt}-tab-${i + 1}`;
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-guide-panel';
    tabpanel.id = id;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // the remaining cell (after title) holds the content richtext
    const contentCell = tabpanel.lastElementChild;
    if (contentCell && contentCell !== tab) buildCards(contentCell);

    const button = document.createElement('button');
    button.className = 'tabs-guide-tab';
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
  });

  block.prepend(tablist);
}
