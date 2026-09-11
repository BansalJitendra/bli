/*
 * columns-claimbar
 * Full-width blue band, mirrors the source .newhero-contbottom bar:
 *   - Left group  (.nhcontb-one): "Number of Claims Settled*" label + individual digit tiles
 *   - Right group (.nhcontb-two): "How can we help you today?" label + white pill
 *                                  containing an "I want to" text and a Select dropdown
 *
 * Authored as a columns block: one row, two cells.
 *   Cell 1: label text + a numeric token (e.g. "316171" or "3 1 6 1 7 1")
 *   Cell 2: label text + (optional) a list of options for the dropdown
 */
export default function decorate(block) {
  const rows = [...block.children];
  const firstRow = rows[0];
  if (!firstRow) return;

  const cells = [...firstRow.children];
  const claimsCell = cells[0];
  const helpCell = cells[1];

  // --- Left group: claims counter with digit tiles ---
  if (claimsCell) {
    claimsCell.classList.add('columns-claimbar-one');

    // Promote the first block of text to a label
    const label = claimsCell.querySelector('p, h1, h2, h3, h4, h5, h6, span');
    if (label) label.classList.add('columns-claimbar-label');

    // Find a numeric token anywhere in the cell and turn it into digit tiles
    const walker = document.createTreeWalker(claimsCell, NodeFilter.SHOW_TEXT);
    let numberNode = null;
    while (walker.nextNode()) {
      const t = walker.currentNode.textContent.replace(/[\s,]/g, '');
      if (/^\d{2,}$/.test(t)) { numberNode = walker.currentNode; break; }
    }
    if (numberNode) {
      const digits = numberNode.textContent.replace(/[\s,]/g, '').split('');
      const box = document.createElement('div');
      box.className = 'columns-claimbar-tiles';
      digits.forEach((d) => {
        const tile = document.createElement('div');
        tile.className = 'columns-claimbar-tile';
        tile.textContent = d;
        box.append(tile);
      });
      const host = numberNode.parentElement;
      host.replaceWith(box);
    }
  }

  // --- Right group: help selector ---
  if (helpCell) {
    helpCell.classList.add('columns-claimbar-two');

    const label = helpCell.querySelector('p, h1, h2, h3, h4, h5, h6, span');
    if (label) label.classList.add('columns-claimbar-label');

    // Build the white pill: "I want to" + <select>
    const pill = document.createElement('div');
    pill.className = 'columns-claimbar-inputbox';

    const iwant = document.createElement('span');
    iwant.className = 'columns-claimbar-iwant';
    iwant.textContent = 'I want to';

    const select = document.createElement('select');
    select.className = 'columns-claimbar-select';
    select.setAttribute('aria-label', 'How can we help you today?');
    const placeholder = document.createElement('option');
    placeholder.textContent = 'Select an option';
    placeholder.value = '';
    placeholder.selected = true;
    select.append(placeholder);

    // Any authored list becomes dropdown options
    const list = helpCell.querySelector('ul, ol');
    if (list) {
      [...list.querySelectorAll('li')].forEach((li) => {
        const opt = document.createElement('option');
        opt.textContent = li.textContent.trim();
        select.append(opt);
      });
      list.remove();
    }

    pill.append(iwant, select);
    helpCell.append(pill);
  }
}
