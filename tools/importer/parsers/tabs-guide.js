/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-guide. Base: tabs.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (tabs-guide-item):
 *   - title            (text)     -> tab label
 *   - content_richtext (richtext) -> tab panel content
 * Each tab = one row of 2 cells: [title, content_richtext].
 *
 * Source .guide renders tabs client-side: .guide_li items (each with an <h3>
 * label) are the tabs; the active tab's resource cards (.life-box-item / within
 * .lifeitembox) are present in the DOM. We emit one row per label; the active
 * tab carries the rendered resource cards, others carry their label placeholder.
 */
function buildResourceContent(document, item) {
  const frag = document.createElement('div');
  const img = item.querySelector('.box-img img, img');
  const title = item.querySelector('.box-img .h5, .h5');
  const desc = item.querySelector('.box-details p, .box-details');
  const link = item.querySelector('a[href]');
  if (img) frag.append(img.cloneNode(true));
  if (title && title.textContent.trim()) {
    const h = document.createElement('h4');
    h.textContent = title.textContent.trim();
    frag.append(h);
  }
  if (desc && desc.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = desc.textContent.trim();
    frag.append(p);
  }
  if (link && link.getAttribute('href')) {
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    a.textContent = (title && title.textContent.trim()) || link.textContent.trim() || link.getAttribute('href');
    frag.append(a);
  }
  return frag;
}

export default function parse(element, { document }) {
  const labelEls = Array.from(element.querySelectorAll('.guide_itemlist .guide_li'))
    .filter((li) => li.textContent.trim());
  const resourceItems = Array.from(element.querySelectorAll('.life-box-item'));

  if (labelEls.length === 0 && resourceItems.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  if (labelEls.length) {
    labelEls.forEach((li) => {
      const isActive = li.classList.contains('guide_liactive');
      const labelText = li.textContent.trim();

      const titleCell = [document.createComment(' field:title '), document.createTextNode(labelText)];

      const contentCell = [document.createComment(' field:content_richtext ')];
      if (isActive && resourceItems.length) {
        resourceItems.forEach((item) => contentCell.push(buildResourceContent(document, item)));
      } else {
        // Placeholder for tabs whose resource cards aren't in the initial DOM.
        // Must not be a lone token equal to the tab title — md2jcr misreads a
        // bare single-word cell as a component header.
        const p = document.createElement('p');
        p.textContent = `${labelText} content coming soon.`;
        contentCell.push(p);
      }
      cells.push([titleCell, contentCell]);
    });
  } else {
    const titleCell = [document.createComment(' field:title '), document.createTextNode('Guide')];
    const contentCell = [document.createComment(' field:content_richtext ')];
    resourceItems.forEach((item) => contentCell.push(buildResourceContent(document, item)));
    cells.push([titleCell, contentCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-guide', cells });
  element.replaceWith(block);
}
