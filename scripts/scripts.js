import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  getMetadata,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

function autolinkModals(doc) {
  doc.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');
    if (origin && origin.href && origin.href.includes('/modals/')) {
      e.preventDefault();
      const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
      openModal(origin.href);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function a11yLinks(main) {
  const links = main.querySelectorAll('a');
  links.forEach((link) => {
    let label = link.textContent;
    if (!label && link.querySelector('span.icon')) {
      const icon = link.querySelector('span.icon');
      label = icon ? icon.classList[1]?.split('-')[1] : label;
    }
    link.setAttribute('aria-label', label);
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
/**
 * Decorate the "claims-bar" section to match the live page: render the claims
 * number as individual digit chips and turn the "I want to" link list into a
 * dropdown selector that navigates on change.
 * @param {Element} main The main element
 */
function decorateClaimsBar(main) {
  main.querySelectorAll('.section.claims-bar').forEach((section) => {
    const wrapper = section.querySelector('.default-content-wrapper');
    if (!wrapper || wrapper.dataset.claimsDecorated) return;
    wrapper.dataset.claimsDecorated = 'true';

    // 1. digit chips for the claims number (e.g. "3,16,171" → chips 3 1 6 1 7 1)
    const numP = [...wrapper.querySelectorAll('p')]
      .find((p) => /Number of Claims Settled/i.test(p.textContent));
    if (numP) {
      const m = numP.innerHTML.match(/([\d,]+)\s*$/);
      if (m) {
        const digits = m[1].replace(/[^\d]/g, '');
        const chips = document.createElement('span');
        chips.className = 'claims-bar-digits';
        [...digits].forEach((d) => {
          const chip = document.createElement('span');
          chip.className = 'claims-bar-digit';
          chip.textContent = d;
          chips.append(chip);
        });
        numP.innerHTML = numP.innerHTML.replace(/([\d,]+)\s*$/, '');
        numP.append(chips);
      }
    }

    // 2. "I want to" dropdown from the link list
    const list = wrapper.querySelector('ul');
    if (list) {
      const links = [...list.querySelectorAll('a')];
      const dd = document.createElement('div');
      dd.className = 'claims-bar-iwantto';
      const label = document.createElement('span');
      label.className = 'claims-bar-iwantto-label';
      label.textContent = 'I want to';
      const select = document.createElement('select');
      select.setAttribute('aria-label', 'I want to');
      const ph = document.createElement('option');
      ph.value = '';
      ph.textContent = 'Select an option';
      ph.selected = true;
      ph.disabled = true;
      select.append(ph);
      links.forEach((a) => {
        const opt = document.createElement('option');
        opt.value = a.getAttribute('href');
        opt.textContent = a.textContent.trim();
        select.append(opt);
      });
      select.addEventListener('change', () => {
        if (select.value) window.location.href = select.value;
      });
      dd.append(label, select);
      list.replaceWith(dd);
    }
  });
}

/**
 * Re-pair the app-promo feature rows. The content conversion splits each
 * "<img> label" feature into two separate paragraphs (label first, then the
 * bullet icon). Merge each feature icon back in front of its label as a single
 * flex row so the icon and text sit on one line (matching the live page).
 * @param {Element} main The main element
 */
function decorateAppPromo(main) {
  main.querySelectorAll('.section.app-promo .default-content-wrapper').forEach((wrapper) => {
    if (wrapper.dataset.appPromoDecorated) return;
    wrapper.dataset.appPromoDecorated = 'true';
    [...wrapper.querySelectorAll('p')].forEach((p) => {
      const img = p.querySelector('img');
      if (!img || !/favorite|star/i.test(img.src)) return;
      const iconOnly = !p.textContent.trim();
      if (iconOnly) {
        // Split case (deployed content): icon is alone in its own <p>, after
        // its label. Move the icon to the front of the preceding label <p>.
        const label = p.previousElementSibling;
        if (label && label.tagName === 'P' && label.textContent.trim() && !label.querySelector('a')) {
          label.classList.add('app-promo-feature');
          label.insertBefore(p.firstElementChild, label.firstChild);
          p.remove();
        }
      } else {
        // Paired case (local preview): icon + label already in one <p>.
        p.classList.add('app-promo-feature');
      }
    });
  });
}

// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateClaimsBar(main);
  decorateAppPromo(main);
  // add aria-label to links
  a11yLinks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    doc.body.dataset.breadcrumbs = true;
  }
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  autolinkModals(doc);

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
