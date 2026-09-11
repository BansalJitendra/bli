import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-disclaim-item-label';
    summary.append(...label.childNodes);
    const body = row.children[1];
    body.className = 'accordion-disclaim-item-body';
    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-disclaim-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
