/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-plans. Base: tabs.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (tabs-plans-item):
 *   - title            (text)     -> tab label
 *   - content_richtext (richtext) -> tab panel content
 * Each tab = one row of 2 cells: [title, content_richtext].
 *
 * Source .asyncTabs renders its tabs client-side: .goal_li items are the tab
 * labels and only the active tab's plan cards (.life-comp2-card) are present in
 * the DOM (under .most-prefered-life-card / .life-comp2). We emit one row per
 * label; the active tab carries the rendered plan cards, others carry their
 * label as placeholder content so every row has both required cells.
 */
function buildCardContent(document, card) {
  const frag = document.createElement('div');
  const heading = card.querySelector('.bajaj-smart .h2, .h2');
  const sub = card.querySelector('.subheading-asynctabs');
  const category = card.querySelector('.termplan .h4');
  if (category && category.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = category.textContent.trim();
    frag.append(p);
  }
  if (heading && heading.textContent.trim()) {
    const h = document.createElement('h3');
    h.textContent = heading.textContent.trim();
    frag.append(h);
  }
  if (sub && sub.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = sub.textContent.trim();
    frag.append(p);
  }
  const points = Array.from(card.querySelectorAll('.card2-middle-details .h3'));
  if (points.length) {
    const ul = document.createElement('ul');
    points.forEach((pt) => {
      const li = document.createElement('li');
      li.append(...pt.cloneNode(true).childNodes);
      ul.append(li);
    });
    frag.append(ul);
  }
  card.querySelectorAll('.card2-last a[href]').forEach((a) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    frag.append(link);
  });
  return frag;
}

export default function parse(element, { document }) {
  const labels = Array.from(element.querySelectorAll('.goal_itemlist .goal_li, .goal_li'))
    .filter((li) => li.textContent.trim());
  const activeCards = Array.from(element.querySelectorAll('.life-comp2-card'));

  if (labels.length === 0 && activeCards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  if (labels.length) {
    labels.forEach((li) => {
      const isActive = li.classList.contains('goal_liactive');
      const titleCell = [document.createComment(' field:title ')];
      titleCell.push(document.createTextNode(li.textContent.trim()));

      const contentCell = [document.createComment(' field:content_richtext ')];
      if (isActive && activeCards.length) {
        activeCards.forEach((card) => contentCell.push(buildCardContent(document, card)));
      } else {
        const p = document.createElement('p');
        p.textContent = li.textContent.trim();
        contentCell.push(p);
      }
      cells.push([titleCell, contentCell]);
    });
  } else {
    // No labels rendered — emit a single tab from the visible cards.
    const titleCell = [document.createComment(' field:title '), document.createTextNode('Most Preferred Plans')];
    const contentCell = [document.createComment(' field:content_richtext ')];
    activeCards.forEach((card) => contentCell.push(buildCardContent(document, card)));
    cells.push([titleCell, contentCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-plans', cells });
  element.replaceWith(block);
}
