/*
 * One-off block library generator for the Bajaj Life Insurance homepage migration.
 * Produces 18 forked variant blocks across 7 base blocks (cards, carousel, tabs,
 * accordion, columns, hero, video). Each variant is fully namespaced to its own
 * class so it never restyles/redecorates its base block, and each gets a UE model
 * with variant-scoped component IDs so the merged component-*.json has no collisions.
 *
 * Structural CSS only — no brand colors/typography/spacing tokens (design pass owns those).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const BLOCKS = path.join(ROOT, 'blocks');

function write(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

function camelId(variant) {
  return variant.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function titleCase(s) {
  return s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ---------------------------------------------------------------------------
// Model builders (explicit, fully namespaced — no reliance on renameId)
// ---------------------------------------------------------------------------

// Collection-style model (container block + repeating item), used by cards & carousel forks.
function collectionModel(variant, itemFields, itemDefaultTemplate = {}) {
  const itemId = `${variant}-item`;
  return {
    definitions: [
      {
        title: titleCase(variant),
        id: variant,
        plugins: {
          xwalk: {
            page: {
              resourceType: 'core/franklin/components/block/v1/block',
              template: { name: titleCase(variant), filter: variant },
            },
          },
        },
      },
      {
        title: `${titleCase(variant)} Item`,
        id: itemId,
        plugins: {
          xwalk: {
            page: {
              resourceType: 'core/franklin/components/block/v1/block/item',
              template: { name: `${titleCase(variant)} Item`, model: itemId, ...itemDefaultTemplate },
            },
          },
        },
      },
    ],
    models: [{ id: itemId, fields: itemFields }],
    filters: [{ id: variant, components: [itemId] }],
  };
}

// tabs fork model
function tabsModel(variant) {
  const itemId = `${variant}-item`;
  return {
    definitions: [
      {
        title: titleCase(variant),
        id: variant,
        plugins: {
          xwalk: {
            page: {
              resourceType: 'core/franklin/components/block/v1/block',
              template: { name: titleCase(variant), filter: variant },
            },
          },
        },
      },
      {
        title: `${titleCase(variant)} Item`,
        id: itemId,
        plugins: {
          xwalk: {
            page: {
              resourceType: 'core/franklin/components/block/v1/block/item',
              template: {
                name: 'Tab', model: itemId, title: 'Tab Name', content_headingType: 'h3',
              },
            },
          },
        },
      },
    ],
    models: [{
      id: itemId,
      fields: [
        { component: 'text', valueType: 'string', name: 'title', value: '', label: 'Tab Title' },
        { component: 'richtext', name: 'content_richtext', value: '', label: 'Content', valueType: 'string' },
      ],
    }],
    filters: [{ id: variant, components: [itemId] }],
  };
}

// accordion fork model
function accordionModel(variant) {
  const itemId = `${variant}-item`;
  return {
    definitions: [
      {
        title: titleCase(variant),
        id: variant,
        plugins: {
          xwalk: {
            page: {
              resourceType: 'core/franklin/components/block/v1/block',
              template: { name: titleCase(variant), filter: variant },
            },
          },
        },
      },
      {
        title: `${titleCase(variant)} Item`,
        id: itemId,
        plugins: {
          xwalk: {
            page: {
              resourceType: 'core/franklin/components/block/v1/block/item',
              template: { name: `${titleCase(variant)} Item`, model: itemId, summary: 'Question' },
            },
          },
        },
      },
    ],
    models: [{
      id: itemId,
      fields: [
        { component: 'text', valueType: 'string', name: 'summary', value: '', label: 'Summary' },
        { component: 'richtext', name: 'text', value: '', label: 'Text', valueType: 'string' },
      ],
    }],
    filters: [{ id: variant, components: [itemId] }],
  };
}

// columns fork model (uses core columns component, standalone-ish)
function columnsModel(variant) {
  return {
    definitions: [
      {
        title: titleCase(variant),
        id: variant,
        plugins: {
          xwalk: {
            page: {
              resourceType: 'core/franklin/components/block/v1/block',
              template: { name: titleCase(variant), filter: variant },
            },
          },
        },
      },
      {
        title: `${titleCase(variant)} Item`,
        id: `${variant}-item`,
        plugins: {
          xwalk: {
            page: {
              resourceType: 'core/franklin/components/block/v1/block/item',
              template: { name: `${titleCase(variant)} Column`, model: `${variant}-item` },
            },
          },
        },
      },
    ],
    models: [{
      id: `${variant}-item`,
      fields: [
        { component: 'reference', valueType: 'string', name: 'image', label: 'Image', multi: false },
        { component: 'text', valueType: 'string', name: 'imageAlt', value: '', label: 'Alt' },
        { component: 'richtext', name: 'text', value: '', label: 'Text', valueType: 'string' },
      ],
    }],
    filters: [{ id: variant, components: [`${variant}-item`] }],
  };
}

// hero fork model (standalone)
function heroModel(variant) {
  return {
    definitions: [
      {
        title: titleCase(variant),
        id: variant,
        plugins: {
          xwalk: {
            page: {
              resourceType: 'core/franklin/components/block/v1/block',
              template: { name: titleCase(variant), model: variant },
            },
          },
        },
      },
    ],
    models: [{
      id: variant,
      fields: [
        { component: 'reference', valueType: 'string', name: 'image', label: 'Image', multi: false },
        { component: 'text', valueType: 'string', name: 'imageAlt', label: 'Alt', value: '' },
        { component: 'richtext', name: 'text', value: '', label: 'Text', valueType: 'string' },
      ],
    }],
    filters: [],
  };
}

// video-gallery fork model (collection: featured + playlist items)
function videoGalleryModel(variant) {
  const itemId = `${variant}-item`;
  return {
    definitions: [
      {
        title: titleCase(variant),
        id: variant,
        plugins: {
          xwalk: {
            page: {
              resourceType: 'core/franklin/components/block/v1/block',
              template: { name: titleCase(variant), filter: variant },
            },
          },
        },
      },
      {
        title: `${titleCase(variant)} Item`,
        id: itemId,
        plugins: {
          xwalk: {
            page: {
              resourceType: 'core/franklin/components/block/v1/block/item',
              template: { name: `${titleCase(variant)} Video`, model: itemId },
            },
          },
        },
      },
    ],
    models: [{
      id: itemId,
      fields: [
        { component: 'reference', valueType: 'string', name: 'image', label: 'Thumbnail', multi: false },
        { component: 'text', valueType: 'string', name: 'imageAlt', value: '', label: 'Alt' },
        { component: 'richtext', name: 'text', value: '', label: 'Title / Caption', valueType: 'string' },
        { component: 'aem-content', valueType: 'string', name: 'link', label: 'Video URL' },
      ],
    }],
    filters: [{ id: variant, components: [itemId] }],
  };
}

// ---------------------------------------------------------------------------
// JS builders
// ---------------------------------------------------------------------------

function cardsJs(variant) {
  return `import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = '${variant}-card-image';
      else div.className = '${variant}-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
`;
}

function carouselJs(variant) {
  // Fork of base carousel.js with every '.carousel' selector and 'carousel-*' class token
  // namespaced to the variant so it never touches the base carousel block.
  return `import { moveInstrumentation } from '../../scripts/scripts.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.${variant}');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.${variant}-slide');
  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) link.setAttribute('tabindex', '-1');
      else link.removeAttribute('tabindex');
    });
  });

  const indicators = block.querySelectorAll('.${variant}-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) indicator.querySelector('button').removeAttribute('disabled');
    else indicator.querySelector('button').setAttribute('disabled', 'true');
  });
}

function showSlide(block, slideIndex = 0, behavior = 'smooth') {
  const slides = block.querySelectorAll('.${variant}-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];
  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.${variant}-slides').scrollTo({ top: 0, left: activeSlide.offsetLeft, behavior });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.${variant}-slide-indicators');
  if (!slideIndicators) return;
  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });
  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) updateActiveSlide(entry.target); });
  }, { threshold: 0.5 });
  block.querySelectorAll('.${variant}-slide').forEach((slide) => slideObserver.observe(slide));
}

function createSlide(row, slideIndex, id) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', \`${variant}-\${id}-slide-\${slideIndex}\`);
  slide.classList.add('${variant}-slide');
  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(\`${variant}-slide-\${colIdx === 0 ? 'image' : 'content'}\`);
    slide.append(column);
  });
  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  return slide;
}

let ${camelId(variant)}Id = 0;
export default async function decorate(block) {
  ${camelId(variant)}Id += 1;
  const id = ${camelId(variant)}Id;
  block.setAttribute('id', \`${variant}-\${id}\`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;
  const placeholders = await fetchPlaceholders();
  const { carousel: roleDesc = 'Carousel' } = placeholders;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', roleDesc);

  const container = document.createElement('div');
  container.classList.add('${variant}-slides-container');
  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('${variant}-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('${variant}-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('${variant}-navigation-buttons');
    slideNavButtons.innerHTML = \`
      <button type="button" class="slide-prev" aria-label="\${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="\${placeholders.nextSlide || 'Next Slide'}"></button>
    \`;
    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, id);
    moveInstrumentation(row, slide);
    slidesWrapper.append(slide);
    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('${variant}-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = \`<button type="button" aria-label="\${placeholders.showSlide || 'Show Slide'} \${idx + 1} \${placeholders.of || 'of'} \${rows.length}"></button>\`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);
  if (!isSingleSlide) bindEvents(block);
}
`;
}

function tabsJs(variant) {
  const cnt = `${camelId(variant)}Cnt`;
  return `// eslint-disable-next-line import/no-unresolved
import { moveInstrumentation } from '../../scripts/scripts.js';

let ${cnt} = 0;

export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = '${variant}-list';
  tablist.setAttribute('role', 'tablist');
  ${cnt} += 1;
  tablist.id = \`${variant}-list-\${${cnt}}\`;

  const tabHeadings = [...block.children]
    .filter((child) => child.firstElementChild && child.firstElementChild.children.length > 0)
    .map((child) => child.firstElementChild);

  tabHeadings.forEach((tab, i) => {
    const id = \`${variant}-panel-\${${cnt}}-tab-\${i + 1}\`;
    const tabpanel = block.children[i];
    tabpanel.className = '${variant}-panel';
    tabpanel.id = id;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', \`tab-\${id}\`);
    tabpanel.setAttribute('role', 'tabpanel');

    const button = document.createElement('button');
    button.className = '${variant}-tab';
    button.id = \`tab-\${id}\`;
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
`;
}

function accordionJs(variant) {
  return `import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = '${variant}-item-label';
    summary.append(...label.childNodes);
    const body = row.children[1];
    body.className = '${variant}-item-body';
    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = '${variant}-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
`;
}

function columnsJs(variant) {
  return `export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(\`${variant}-\${cols.length}-cols\`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('${variant}-img-col');
        }
      }
    });
  });
}
`;
}

function heroPromoJs(variant) {
  return `import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // Full-width promo banner: a background image cell + a content cell (headline, sub-line, CTA).
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic && col.children.length === 1 && col.querySelector('p, h1, h2, h3, h4, h5, h6, a') === null) {
        col.classList.add('${variant}-bg');
      } else {
        col.classList.add('${variant}-content');
      }
    });
  });
  block.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '1600' }]);
    img.closest('picture').replaceWith(optimized);
  });
}
`;
}

function videoGalleryJs(variant) {
  return `import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function loadEmbed(stage, link) {
  const url = new URL(link, window.location.href);
  const isYoutube = /youtube|youtu\\.be/.test(link);
  const wrapper = document.createElement('div');
  wrapper.className = '${variant}-player';
  if (isYoutube) {
    const usp = new URLSearchParams(url.search);
    let vid = usp.get('v') || '';
    if (url.hostname.includes('youtu.be')) [, vid] = url.pathname.split('/');
    wrapper.innerHTML = \`<iframe src="https://www.youtube.com/embed/\${vid}?rel=0&autoplay=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video" loading="lazy"></iframe>\`;
  } else {
    wrapper.innerHTML = \`<video controls autoplay src="\${link}"></video>\`;
  }
  stage.textContent = '';
  stage.append(wrapper);
}

export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = '${variant}-thumb';
      else if (div.querySelector('a')) div.className = '${variant}-link';
      else div.className = '${variant}-caption';
    });
    return li;
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });

  const stage = document.createElement('div');
  stage.className = '${variant}-stage';
  const playlist = document.createElement('ul');
  playlist.className = '${variant}-playlist';
  items.forEach((li, idx) => {
    if (idx === 0) li.classList.add('${variant}-active');
    const link = li.querySelector('a')?.href;
    li.addEventListener('click', () => {
      playlist.querySelectorAll('li').forEach((x) => x.classList.remove('${variant}-active'));
      li.classList.add('${variant}-active');
      if (link) loadEmbed(stage, link);
    });
    playlist.append(li);
  });

  block.textContent = '';
  block.append(stage, playlist);
  const firstLink = items[0]?.querySelector('a')?.href;
  if (firstLink) {
    const first = items[0].querySelector('picture')?.cloneNode(true);
    const poster = document.createElement('div');
    poster.className = '${variant}-poster';
    if (first) poster.append(first);
    poster.insertAdjacentHTML('beforeend', '<div class="${variant}-play"><button type="button" title="Play"></button></div>');
    poster.addEventListener('click', () => loadEmbed(stage, firstLink));
    stage.append(poster);
  }
}
`;
}

// ---------------------------------------------------------------------------
// CSS builders — structural only
// ---------------------------------------------------------------------------

function cardsGridCss(variant, minCol, note) {
  return `/* ${variant} — ${note} (structural layout only) */
.${variant} > ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${minCol}, 1fr));
  gap: 24px;
}

.${variant} > ul > li {
  display: flex;
  flex-direction: column;
  border: 1px solid #dadada;
  background-color: var(--background-color);
}

.${variant} .${variant}-card-body {
  margin: 16px;
}

.${variant} .${variant}-card-image {
  line-height: 0;
}

.${variant} .${variant}-card-image img {
  width: 100%;
  object-fit: cover;
}
`;
}

function cardsScrollerCss(variant, cardWidth, note) {
  return `/* ${variant} — ${note} (horizontally scrolling card set, structural only) */
.${variant} > ul {
  list-style: none;
  margin: 0;
  padding: 0 0 12px;
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.${variant} > ul > li {
  flex: 0 0 ${cardWidth};
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  border: 1px solid #dadada;
  background-color: var(--background-color);
}

.${variant} .${variant}-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px;
}

.${variant} .${variant}-card-image {
  line-height: 0;
}

.${variant} .${variant}-card-image img {
  width: 100%;
  object-fit: cover;
}

.${variant} .${variant}-card-body a {
  align-self: flex-start;
}
`;
}

function carouselCss(variant, opts = {}) {
  const contentBg = opts.overlayContent ? 'rgb(19 19 19 / 55%)' : 'transparent';
  const minHeight = opts.minHeight || 'min(50vw, 520px)';
  return `/* ${variant} — carousel fork (structural layout only) */
.${variant} .${variant}-slides-container {
  position: relative;
}

.${variant} .${variant}-slides,
.${variant} .${variant}-slide-indicators {
  list-style: none;
  margin: 0;
  padding: 0;
}

.${variant} .${variant}-slides {
  display: flex;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  overflow: scroll clip;
}

.${variant} .${variant}-slides::-webkit-scrollbar {
  display: none;
}

.${variant} .${variant}-slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  width: 100%;
  min-height: ${minHeight};
}

.${variant} .${variant}-slide .${variant}-slide-image picture {
  position: absolute;
  inset: 0;
}

.${variant} .${variant}-slide .${variant}-slide-image picture > img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.${variant} .${variant}-slide .${variant}-slide-content {
  z-index: 1;
  margin: 32px;
  padding: 16px;
  position: relative;
  background-color: ${contentBg};
}

.${variant} .${variant}-slide-indicators {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 12px;
  padding: 12px;
  line-height: 0;
}

.${variant} .${variant}-slide-indicator button {
  width: 12px;
  height: 12px;
  margin: 0;
  padding: 0;
  border-radius: 50%;
  background-color: #dadada;
  transition: background-color 0.2s;
}

.${variant} .${variant}-slide-indicator button:disabled,
.${variant} .${variant}-slide-indicator button:hover,
.${variant} .${variant}-slide-indicator button:focus-visible {
  background-color: var(--text-color);
}

.${variant} .${variant}-navigation-buttons {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1;
}

/* stylelint-disable-next-line no-descending-specificity */
.${variant} .${variant}-navigation-buttons button {
  position: relative;
  width: 44px;
  height: 44px;
  margin: 0;
  border-radius: 50%;
  padding: 0;
  background-color: rgb(19 19 19 / 25%);
  transition: background-color 0.2s;
}

.${variant} .${variant}-navigation-buttons button:hover,
.${variant} .${variant}-navigation-buttons button:focus-visible {
  background-color: rgb(19 19 19 / 75%);
}

.${variant} .${variant}-navigation-buttons button::after {
  display: block;
  content: '';
  border: 2px solid;
  border-bottom: 0;
  border-left: 0;
  height: 12px;
  width: 12px;
  position: absolute;
  top: 50%;
  left: calc(50% + 2px);
  transform: translate(-50%, -50%) rotate(-135deg);
}

.${variant} .${variant}-navigation-buttons button.slide-next::after {
  transform: translate(-50%, -50%) rotate(45deg);
  left: calc(50% - 2px);
}

@media (width >= 600px) {
  .${variant} .${variant}-navigation-buttons {
    left: 24px;
    right: 24px;
  }

  .${variant} .${variant}-slide .${variant}-slide-content {
    margin: 48px;
  }
}
`;
}

function tabsCss(variant) {
  return `/* ${variant} — tabs fork (structural layout only) */
.${variant} .${variant}-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5ch;
  max-width: 100%;
  overflow-x: auto;
}

.${variant} .${variant}-list button {
  flex: 0 0 max-content;
  margin: 0;
  border: 1px solid #dadada;
  border-radius: 0;
  padding: 0.5em 1em;
  background-color: var(--light-color);
  color: initial;
  font-weight: bold;
  line-height: unset;
  text-align: initial;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.${variant} .${variant}-list button p {
  margin: 0;
}

.${variant} .${variant}-list button[aria-selected='true'] {
  border-bottom: 1px solid var(--background-color);
  background-color: var(--background-color);
  cursor: initial;
}

.${variant} .${variant}-panel {
  margin-top: -1px;
  padding: 24px;
  border: 1px solid #dadada;
  overflow: auto;
}

.${variant} .${variant}-panel[aria-hidden='true'] {
  display: none;
}
`;
}

function accordionCss(variant) {
  return `/* ${variant} — accordion fork (structural layout only) */
.${variant} .${variant}-item {
  border: 1px solid #dadada;
}

/* stylelint-disable-next-line no-descending-specificity */
.${variant} .${variant}-item + .${variant}-item {
  margin-top: 16px;
}

.${variant} .${variant}-item p {
  margin-bottom: 0.8em;
}

.${variant} .${variant}-item-label {
  position: relative;
  padding: 16px;
  padding-right: 46px;
  cursor: pointer;
  list-style: none;
  font-weight: bold;
  transition: background-color 0.2s;
}

.${variant} .${variant}-item-label:focus,
.${variant} .${variant}-item-label:hover {
  background-color: var(--light-color);
}

.${variant} .${variant}-item[open] .${variant}-item-label {
  background-color: var(--light-color);
}

.${variant} .${variant}-item-label::-webkit-details-marker {
  display: none;
}

.${variant} .${variant}-item-label::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 18px;
  transform: translateY(-50%) rotate(135deg);
  width: 8px;
  height: 8px;
  border: 2px solid;
  border-width: 2px 2px 0 0;
  transition: transform 0.2s;
}

.${variant} .${variant}-item[open] .${variant}-item-label::after {
  transform: translateY(-50%) rotate(-45deg);
}

.${variant} .${variant}-item-body {
  padding: 0 16px 16px;
}

.${variant} .${variant}-item:not([open]) .${variant}-item-body {
  display: none;
}

.${variant} .${variant}-item[open] .${variant}-item-body {
  border-top: 1px solid #dadada;
  background-color: var(--background-color);
}
`;
}

function columnsClaimbarCss(variant) {
  return `/* ${variant} — full-width band, two content groups side by side (structural only) */
.${variant} > div {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.${variant} > div > div {
  flex: 1;
}

.${variant} img {
  width: 100%;
}

@media (width >= 900px) {
  .${variant} > div {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 48px;
  }
}
`;
}

function columnsAppCss(variant) {
  return `/* ${variant} — image left, content right promo band (structural only) */
.${variant} > div {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.${variant} > div > div {
  flex: 1;
  order: 1;
}

.${variant} > div > .${variant}-img-col {
  order: 0;
}

.${variant} img {
  width: 100%;
  display: block;
}

@media (width >= 900px) {
  .${variant} > div {
    flex-direction: row;
  }

  .${variant} > div > div {
    order: unset;
  }
}
`;
}

function heroPromoCss(variant) {
  return `/* ${variant} — full-bleed promo banner with background image (structural only) */
.${variant} {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 280px;
  padding: 40px 24px;
  overflow: hidden;
}

.${variant} .${variant}-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.${variant} .${variant}-bg picture,
.${variant} .${variant}-bg img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.${variant} .${variant}-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.${variant} .${variant}-content a {
  display: inline-block;
}

@media (width >= 900px) {
  .${variant} {
    padding: 56px 32px;
  }
}
`;
}

function videoGalleryCss(variant) {
  return `/* ${variant} — featured player + vertical playlist (structural only) */
.${variant} {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.${variant} .${variant}-stage {
  position: relative;
  aspect-ratio: 16 / 9;
  background-color: #000;
}

.${variant} .${variant}-stage .${variant}-player,
.${variant} .${variant}-stage .${variant}-poster {
  position: absolute;
  inset: 0;
}

.${variant} .${variant}-player iframe,
.${variant} .${variant}-player video {
  width: 100%;
  height: 100%;
  border: 0;
}

/* stylelint-disable-next-line no-descending-specificity */
.${variant} .${variant}-poster {
  cursor: pointer;
}

.${variant} .${variant}-poster picture,
.${variant} .${variant}-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.${variant} .${variant}-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.${variant} .${variant}-play button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
}

.${variant} .${variant}-playlist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 16px;
  overflow-x: auto;
}

.${variant} .${variant}-playlist > li {
  flex: 0 0 220px;
  cursor: pointer;
  border: 1px solid #dadada;
}

.${variant} .${variant}-playlist > li.${variant}-active {
  border-color: var(--text-color);
}

.${variant} .${variant}-thumb img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}

.${variant} .${variant}-caption,
.${variant} .${variant}-link {
  padding: 8px 12px;
}

@media (width >= 900px) {
  .${variant} {
    grid-template-columns: 2fr 1fr;
    align-items: start;
  }

  .${variant} .${variant}-playlist {
    flex-direction: column;
    max-height: 480px;
  }

  .${variant} .${variant}-playlist > li {
    flex: 0 0 auto;
    display: flex;
    gap: 12px;
  }

  .${variant} .${variant}-playlist .${variant}-thumb {
    flex: 0 0 120px;
  }
}
`;
}

// ---------------------------------------------------------------------------
// Variant registry
// ---------------------------------------------------------------------------

const cardImage = () => ([
  { component: 'reference', valueType: 'string', name: 'image', label: 'Image', multi: false },
  { component: 'text', valueType: 'string', name: 'imageAlt', label: 'Alt', value: '' },
  { component: 'richtext', name: 'text', value: '', label: 'Text', valueType: 'string' },
]);

const VARIANTS = [
  // ---- cards forks ----
  {
    variant: 'cards-product',
    baseBlock: 'cards',
    canonicalModel: 'collection',
    purpose: 'Row of promotional product mini-cards (icon, tag pill, title, benefit line).',
    js: cardsJs,
    css: (v) => cardsGridCss(v, '200px', 'promo product mini-cards'),
    model: (v) => collectionModel(v, cardImage()),
    contentPattern: { structure: 'icon, tag pill, title, benefit line per card' },
  },
  {
    variant: 'cards-category',
    baseBlock: 'cards',
    canonicalModel: 'collection',
    purpose: 'Row of life-insurance category cards (icon, title, benefit pill).',
    js: cardsJs,
    css: (v) => cardsGridCss(v, '200px', 'category cards'),
    model: (v) => collectionModel(v, cardImage()),
    contentPattern: { structure: 'icon, title, benefit pill per card' },
  },
  {
    variant: 'cards-plan',
    baseBlock: 'cards',
    canonicalModel: 'collection',
    purpose: 'Scrolling set of plan cards (eyebrow, name, benefits list, Buy Now / Know More).',
    js: cardsJs,
    css: (v) => cardsScrollerCss(v, '300px', 'plan cards'),
    model: (v) => collectionModel(v, cardImage()),
    contentPattern: { structure: 'eyebrow, name, benefits list, two CTA buttons per card' },
  },
  {
    variant: 'cards-quicklink',
    baseBlock: 'cards',
    canonicalModel: 'collection',
    purpose: 'Row of service shortcut cards (icon + label).',
    js: cardsJs,
    css: (v) => cardsGridCss(v, '160px', 'icon+label shortcut cards'),
    model: (v) => collectionModel(v, cardImage()),
    contentPattern: { structure: 'icon and label per shortcut' },
  },
  {
    variant: 'cards-stat',
    baseBlock: 'cards',
    canonicalModel: 'collection',
    purpose: 'Grid of stat tiles (icon, figure, label).',
    js: cardsJs,
    css: (v) => cardsGridCss(v, '180px', 'stat tiles'),
    model: (v) => collectionModel(v, cardImage()),
    contentPattern: { structure: 'icon, figure, label per tile' },
  },
  {
    variant: 'cards-benefit',
    baseBlock: 'cards',
    canonicalModel: 'collection',
    purpose: 'Grid of numbered benefit items (number, title, paragraph — no image).',
    js: cardsJs,
    css: (v) => cardsGridCss(v, '240px', 'numbered benefit items'),
    model: (v) => collectionModel(v, [
      { component: 'richtext', name: 'text', value: '', label: 'Text', valueType: 'string' },
    ]),
    contentPattern: { structure: 'number, title, paragraph per item' },
  },
  {
    variant: 'cards-resource',
    baseBlock: 'cards',
    canonicalModel: 'collection',
    purpose: 'Scrolling set of resource cards (thumbnail, title, description, Watch Now).',
    js: cardsJs,
    css: (v) => cardsScrollerCss(v, '280px', 'resource cards'),
    model: (v) => collectionModel(v, cardImage()),
    contentPattern: { structure: 'thumbnail, title, description, CTA per card' },
  },
  {
    variant: 'cards-contact',
    baseBlock: 'cards',
    canonicalModel: 'collection',
    purpose: 'Row of contact info cards (title tab, phones/timings/emails, optional button).',
    js: cardsJs,
    css: (v) => cardsGridCss(v, '240px', 'contact info cards'),
    model: (v) => collectionModel(v, [
      { component: 'richtext', name: 'text', value: '', label: 'Text', valueType: 'string' },
    ]),
    contentPattern: { structure: 'title tab, contact details, optional button per card' },
  },
  // ---- carousel forks ----
  {
    variant: 'carousel-hero',
    baseBlock: 'carousel',
    canonicalModel: 'collection',
    purpose: 'Rotating hero slides (eyebrow, headline, code, feature bullets, celebrity image + badge).',
    js: carouselJs,
    css: (v) => carouselCss(v, { overlayContent: false, minHeight: 'min(60vw, 560px)' }),
    model: (v) => collectionModel(v, [
      { component: 'reference', valueType: 'string', name: 'media_image', label: 'Image', multi: false },
      { component: 'text', valueType: 'string', name: 'media_imageAlt', value: '', label: 'Image Alt' },
      { component: 'richtext', name: 'content_text', value: '', label: 'Text', valueType: 'string' },
    ]),
    contentPattern: { structure: 'image + rich content (eyebrow, headline, bullets) per slide' },
  },
  {
    variant: 'carousel-review',
    baseBlock: 'carousel',
    canonicalModel: 'collection',
    purpose: 'Rotating testimonial cards (title, quote, review, avatar + name + stars).',
    js: carouselJs,
    css: (v) => carouselCss(v, { overlayContent: false, minHeight: 'auto' }),
    model: (v) => collectionModel(v, [
      { component: 'reference', valueType: 'string', name: 'media_image', label: 'Avatar', multi: false },
      { component: 'text', valueType: 'string', name: 'media_imageAlt', value: '', label: 'Avatar Alt' },
      { component: 'richtext', name: 'content_text', value: '', label: 'Text', valueType: 'string' },
    ]),
    contentPattern: { structure: 'quote, review, avatar, name, star rating per slide' },
  },
  {
    variant: 'carousel-banner',
    baseBlock: 'carousel',
    canonicalModel: 'collection',
    purpose: 'Rotating full-width informational banner (title, paragraph, detail lists, fine print).',
    js: carouselJs,
    css: (v) => carouselCss(v, { overlayContent: true, minHeight: 'min(50vw, 420px)' }),
    model: (v) => collectionModel(v, [
      { component: 'reference', valueType: 'string', name: 'media_image', label: 'Background Image', multi: false },
      { component: 'text', valueType: 'string', name: 'media_imageAlt', value: '', label: 'Background Alt' },
      { component: 'richtext', name: 'content_text', value: '', label: 'Text', valueType: 'string' },
    ]),
    contentPattern: { structure: 'title, paragraph, two detail-list columns, fine print per slide' },
  },
  // ---- tabs forks ----
  {
    variant: 'tabs-plans',
    baseBlock: 'tabs',
    canonicalModel: 'collection',
    purpose: 'Tab switcher across plan sets; each panel holds a plan-cards set.',
    js: tabsJs,
    css: tabsCss,
    model: tabsModel,
    contentPattern: { structure: 'tab title + panel content per tab' },
  },
  {
    variant: 'tabs-guide',
    baseBlock: 'tabs',
    canonicalModel: 'collection',
    purpose: 'Tab switcher across resource categories (Videos, Articles, Calculators).',
    js: tabsJs,
    css: tabsCss,
    model: tabsModel,
    contentPattern: { structure: 'tab title + panel content per tab' },
  },
  // ---- accordion forks ----
  {
    variant: 'accordion-faq',
    baseBlock: 'accordion',
    canonicalModel: 'collection',
    purpose: 'Expandable FAQ Q&A rows.',
    js: accordionJs,
    css: accordionCss,
    model: accordionModel,
    contentPattern: { structure: 'question (summary) + answer (body) per row' },
  },
  {
    variant: 'accordion-disclaim',
    baseBlock: 'accordion',
    canonicalModel: 'collection',
    purpose: 'Single expandable disclosure row revealing long legal fine print.',
    js: accordionJs,
    css: accordionCss,
    model: accordionModel,
    contentPattern: { structure: 'label (summary) + long fine print (body)' },
  },
  // ---- columns forks ----
  {
    variant: 'columns-claimbar',
    baseBlock: 'columns',
    canonicalModel: 'collection',
    purpose: 'Full-width band with a claims-settled counter and an "I want to" help selector, side by side.',
    js: columnsJs,
    css: columnsClaimbarCss,
    model: columnsModel,
    contentPattern: { structure: 'two content groups side by side on a band' },
  },
  {
    variant: 'columns-app',
    baseBlock: 'columns',
    canonicalModel: 'collection',
    purpose: 'Mobile-app promo band: phone mockup image on one side, content + store badges + QR on the other.',
    js: columnsJs,
    css: columnsAppCss,
    model: columnsModel,
    contentPattern: { structure: 'image column + content column' },
  },
  // ---- hero fork ----
  {
    variant: 'hero-promo',
    baseBlock: 'hero',
    canonicalModel: 'standalone',
    purpose: 'Full-width promo banner with background photo, headline, sub-line and CTA.',
    js: heroPromoJs,
    css: heroPromoCss,
    model: heroModel,
    contentPattern: { structure: 'background image + headline, sub-line, CTA' },
  },
  // ---- video fork ----
  {
    variant: 'video-gallery',
    baseBlock: 'video',
    canonicalModel: 'collection',
    purpose: 'Video gallery with a featured player and a playlist of thumbnails.',
    js: videoGalleryJs,
    css: videoGalleryCss,
    model: videoGalleryModel,
    contentPattern: { structure: 'featured video + playlist items (thumbnail, caption, link)' },
  },
];

// ---------------------------------------------------------------------------
// Emit files
// ---------------------------------------------------------------------------

const summary = [];
for (const v of VARIANTS) {
  const dir = path.join(BLOCKS, v.variant);
  write(path.join(dir, `${v.variant}.js`), v.js(v.variant));
  write(path.join(dir, `${v.variant}.css`), v.css(v.variant));
  write(path.join(dir, `_${v.variant}.json`), `${JSON.stringify(v.model(v.variant), null, 2)}\n`);
  const metadata = {
    variantName: v.variant,
    baseBlock: v.baseBlock,
    canonicalModel: v.canonicalModel,
    visualCharacteristics: { purpose: v.purpose },
    contentPattern: v.contentPattern,
    usage: v.purpose,
    options: [],
    memberVariantIds: [v.variant],
  };
  write(path.join(dir, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);
  summary.push({ block: v.variant, baseBlock: v.baseBlock, canonicalModel: v.canonicalModel });
}

fs.writeFileSync(
  path.join(ROOT, 'migration-work', 'block-generation-manifest.json'),
  `${JSON.stringify(summary.map((s) => ({ ...s, status: 'generate' })), null, 2)}\n`,
);

console.log(JSON.stringify({ generated: summary.length, blocks: summary.map((s) => s.block) }, null, 2));
