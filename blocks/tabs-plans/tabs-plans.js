// eslint-disable-next-line import/no-unresolved
import { moveInstrumentation } from '../../scripts/scripts.js';

let tabsPlansCnt = 0;

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
  });

  block.prepend(tablist);
}
