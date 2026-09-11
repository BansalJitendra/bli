/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-claimbar. Base: columns.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * Columns block: content laid out side by side; the second table row holds one
 * cell per column. Per the field-hinting rules, Columns blocks do NOT use
 * field:* comments — only default content in the cells.
 *
 * Source .nhcontb-one is the "Number of Claims Settled" claim bar: a label plus
 * a row of individual digit boxes. We present the label in one column and the
 * assembled number in a second column.
 */
export default function parse(element, { document }) {
  const label = element.querySelector(':scope > span, :scope > .nhcbo-label');
  const digitEls = Array.from(element.querySelectorAll('.nhcbb-num'));

  if (!label && digitEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // The `columns` component does not round-trip through md2jcr (block is dropped
  // and raw grid markdown leaks into a text node, breaking Universal Editor).
  // Emit as DEFAULT CONTENT — label + assembled claims number — which converts
  // cleanly. Block CSS still applies via the section wrapper.
  const frag = document.createElement('div');
  if (label) {
    const p = document.createElement('p');
    p.append(...label.cloneNode(true).childNodes);
    frag.append(p);
  }
  const digits = digitEls.map((d) => d.textContent.trim()).join('');
  if (digits) {
    const h = document.createElement('h3');
    h.textContent = digits;
    frag.append(h);
  }
  element.replaceWith(frag);
}
