import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Build the inline YouTube/video embed that replaces a card's poster on play.
 */
function embedFor(link) {
  const url = new URL(link, window.location.href);
  const isYoutube = /youtube|youtu\.be/.test(link);
  const wrapper = document.createElement('div');
  wrapper.className = 'video-gallery-player';
  if (isYoutube) {
    const usp = new URLSearchParams(url.search);
    let vid = usp.get('v') || '';
    if (url.hostname.includes('youtu.be')) [, vid] = url.pathname.split('/');
    if (!vid) [, vid] = url.pathname.split('/embed/');
    wrapper.innerHTML = `<iframe src="https://www.youtube.com/embed/${vid}?rel=0&autoplay=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video" loading="lazy"></iframe>`;
  } else {
    wrapper.innerHTML = `<video controls autoplay src="${link}"></video>`;
  }
  return wrapper;
}

export default function decorate(block) {
  // Each authored row: image + text(name, date/duration) + link. Render as a
  // portrait video card (poster + play button, caption below) in a horizontal
  // carousel — matching the live "Videos" section.
  const cards = [...block.children].map((row) => {
    const cells = [...row.children];
    const pic = row.querySelector('picture');
    const link = row.querySelector('a')?.getAttribute('href');
    // caption text = the text cell's paragraphs (name + date/duration)
    let textCell = null;
    cells.forEach((div) => {
      if (div.querySelector('picture')) return;
      if (div.querySelector('a')) return;
      textCell = div;
    });

    const card = document.createElement('div');
    card.className = 'video-gallery-card';
    moveInstrumentation(row, card);

    const stage = document.createElement('div');
    stage.className = 'video-gallery-stage';
    const poster = document.createElement('div');
    poster.className = 'video-gallery-poster';
    if (pic) poster.append(pic);
    poster.insertAdjacentHTML('beforeend', '<div class="video-gallery-play"><button type="button" title="Play"></button></div>');
    if (link) {
      poster.addEventListener('click', () => {
        stage.textContent = '';
        stage.append(embedFor(link));
      });
    }
    stage.append(poster);
    card.append(stage);

    if (textCell) {
      const caption = document.createElement('div');
      caption.className = 'video-gallery-caption';
      while (textCell.firstElementChild) caption.append(textCell.firstElementChild);
      card.append(caption);
    }
    return card;
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });

  // carousel: horizontal track + bottom controls (prev · dots · next)
  const carousel = document.createElement('div');
  carousel.className = 'video-gallery-carousel';
  const track = document.createElement('div');
  track.className = 'video-gallery-track';
  cards.forEach((c) => track.append(c));
  carousel.append(track);

  const controls = document.createElement('div');
  controls.className = 'video-gallery-controls';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'video-gallery-arrow video-gallery-prev';
  prev.setAttribute('aria-label', 'Previous videos');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'video-gallery-arrow video-gallery-next';
  next.setAttribute('aria-label', 'Next videos');
  const dots = document.createElement('div');
  dots.className = 'video-gallery-dots';

  const scrollByCard = (dir) => {
    const first = track.querySelector('.video-gallery-card');
    const step = first ? first.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  };
  prev.addEventListener('click', () => scrollByCard(-1));
  next.addEventListener('click', () => scrollByCard(1));

  cards.forEach((c, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'video-gallery-dot';
    dot.setAttribute('aria-label', `Go to video ${i + 1}`);
    dot.addEventListener('click', () => {
      track.scrollTo({ left: c.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    });
    dots.append(dot);
  });
  const dotEls = [...dots.children];
  const syncDots = () => {
    let active = 0;
    let min = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - track.offsetLeft - track.scrollLeft);
      if (d < min) { min = d; active = i; }
    });
    dotEls.forEach((d, i) => d.setAttribute('aria-current', i === active ? 'true' : 'false'));
  };
  track.addEventListener('scroll', () => window.requestAnimationFrame(syncDots), { passive: true });
  syncDots();

  controls.append(prev, dots, next);

  block.textContent = '';
  block.append(carousel, controls);
}
