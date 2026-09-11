import { moveInstrumentation } from '../../scripts/scripts.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-review');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-review-slide');
  slides.forEach((aSlide, idx) => {
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) link.setAttribute('tabindex', '-1');
      else link.removeAttribute('tabindex');
    });
  });

  const indicators = block.querySelectorAll('.carousel-review-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) indicator.querySelector('button').removeAttribute('disabled');
    else indicator.querySelector('button').setAttribute('disabled', 'true');
  });
}

function showSlide(block, slideIndex = 0, behavior = 'smooth') {
  const slides = block.querySelectorAll('.carousel-review-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];
  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-review-slides').scrollTo({ top: 0, left: activeSlide.offsetLeft, behavior });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-review-slide-indicators');
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
  }, { threshold: 0.5, root: block.querySelector('.carousel-review-slides') });
  block.querySelectorAll('.carousel-review-slide').forEach((slide) => slideObserver.observe(slide));
}

function buildStars(count = 5) {
  const stars = document.createElement('div');
  stars.classList.add('carousel-review-stars');
  stars.setAttribute('aria-label', `${count} out of 5 stars`);
  stars.setAttribute('role', 'img');
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement('span');
    star.classList.add('carousel-review-star');
    star.setAttribute('aria-hidden', 'true');
    star.textContent = '★';
    stars.append(star);
  }
  return stars;
}

function createSlide(row, slideIndex, id) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-review-${id}-slide-${slideIndex}`);
  slide.classList.add('carousel-review-slide');

  const cells = [...row.querySelectorAll(':scope > div')];
  const imageCell = cells[0];
  const contentCell = cells[1] || cells[0];

  // --- white body: title (+ quote glyph) and review text ---
  const body = document.createElement('div');
  body.classList.add('carousel-review-card-body');

  const heading = contentCell.querySelector('h1, h2, h3, h4, h5, h6');
  const head = document.createElement('div');
  head.classList.add('carousel-review-card-head');
  if (heading) head.append(heading);
  const quote = document.createElement('span');
  quote.classList.add('carousel-review-quote');
  quote.setAttribute('aria-hidden', 'true');
  quote.textContent = '”';
  head.append(quote);
  body.append(head);

  // review paragraph = paragraphs that are not the reviewer name (<strong>)
  let nameText = '';
  contentCell.querySelectorAll(':scope > p').forEach((p) => {
    const strong = p.querySelector('strong');
    if (strong && p.textContent.trim() === strong.textContent.trim()) {
      nameText = strong.textContent.trim();
    } else {
      p.classList.add('carousel-review-text');
      body.append(p);
    }
  });
  slide.append(body);

  // --- blue footer: avatar, name, stars ---
  const footer = document.createElement('div');
  footer.classList.add('carousel-review-card-footer');

  const avatar = document.createElement('div');
  avatar.classList.add('carousel-review-avatar');
  const picture = imageCell.querySelector('picture');
  if (picture) avatar.append(picture);
  footer.append(avatar);

  const meta = document.createElement('div');
  meta.classList.add('carousel-review-meta');
  const name = document.createElement('div');
  name.classList.add('carousel-review-name');
  name.textContent = nameText;
  meta.append(name);
  meta.append(buildStars(5));
  footer.append(meta);

  slide.append(footer);

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  return slide;
}

let carouselReviewId = 0;
export default async function decorate(block) {
  carouselReviewId += 1;
  const id = carouselReviewId;
  block.setAttribute('id', `carousel-review-${id}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;
  const placeholders = await fetchPlaceholders();
  const { carousel: roleDesc = 'Carousel' } = placeholders;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', roleDesc);

  const container = document.createElement('div');
  container.classList.add('carousel-review-slides-container');
  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-review-slides');

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, id);
    moveInstrumentation(row, slide);
    slidesWrapper.append(slide);
    row.remove();
  });

  container.append(slidesWrapper);
  block.append(container);

  if (!isSingleSlide) {
    const controls = document.createElement('nav');
    controls.classList.add('carousel-review-controls');
    controls.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.classList.add('slide-prev');
    prev.setAttribute('aria-label', placeholders.previousSlide || 'Previous Slide');
    controls.append(prev);

    const slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-review-slide-indicators');
    rows.forEach((row, idx) => {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-review-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    });
    controls.append(slideIndicators);

    const next = document.createElement('button');
    next.type = 'button';
    next.classList.add('slide-next');
    next.setAttribute('aria-label', placeholders.nextSlide || 'Next Slide');
    controls.append(next);

    block.append(controls);
    bindEvents(block);
  }
}
