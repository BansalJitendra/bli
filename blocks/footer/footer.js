import { loadFragment } from '../fragment/fragment.js';

/**
 * Group a flat "H3 then its following content" sequence into column blocks.
 * EDS flattens the authored nested divs into a single default-content-wrapper
 * holding H3/UL/P siblings; this rebuilds one column div per heading so the
 * section can lay them out as a multi-column grid (sitemap + contact bar).
 * @param {Element} wrapper the .default-content-wrapper holding the flat nodes
 */
function groupColumns(wrapper) {
  const nodes = [...wrapper.children];
  if (!nodes.some((n) => /^H[1-6]$/.test(n.tagName))) return;
  const columns = [];
  let current = null;
  nodes.forEach((node) => {
    if (/^H[1-6]$/.test(node.tagName)) {
      current = document.createElement('div');
      current.className = 'footer-col';
      columns.push(current);
    }
    if (!current) {
      current = document.createElement('div');
      current.className = 'footer-col';
      columns.push(current);
    }
    current.append(node);
  });
  wrapper.textContent = '';
  columns.forEach((c) => wrapper.append(c));
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment — metadata-independent dual path: /content/footer
  // (local preview / aem up serves the project file) then /footer (DA/EDS root).
  let fragment = await loadFragment('/content/footer');
  if (!fragment || !fragment.firstElementChild) {
    fragment = await loadFragment('/footer');
  }

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // build multi-column grids for the sitemap + contact/social sections
  // (each starts with an H3 per column).
  footer.querySelectorAll('.section > .default-content-wrapper').forEach((wrapper) => {
    const headings = wrapper.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length > 1) groupColumns(wrapper);
  });

  block.append(footer);
}
