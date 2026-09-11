import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function loadEmbed(stage, link) {
  const url = new URL(link, window.location.href);
  const isYoutube = /youtube|youtu\.be/.test(link);
  const wrapper = document.createElement('div');
  wrapper.className = 'video-gallery-player';
  if (isYoutube) {
    const usp = new URLSearchParams(url.search);
    let vid = usp.get('v') || '';
    if (url.hostname.includes('youtu.be')) [, vid] = url.pathname.split('/');
    wrapper.innerHTML = `<iframe src="https://www.youtube.com/embed/${vid}?rel=0&autoplay=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video" loading="lazy"></iframe>`;
  } else {
    wrapper.innerHTML = `<video controls autoplay src="${link}"></video>`;
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
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'video-gallery-thumb';
      else if (div.querySelector('a')) div.className = 'video-gallery-link';
      else div.className = 'video-gallery-caption';
    });
    return li;
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });

  const stage = document.createElement('div');
  stage.className = 'video-gallery-stage';
  const playlist = document.createElement('ul');
  playlist.className = 'video-gallery-playlist';
  items.forEach((li, idx) => {
    if (idx === 0) li.classList.add('video-gallery-active');
    const link = li.querySelector('a')?.href;
    li.addEventListener('click', () => {
      playlist.querySelectorAll('li').forEach((x) => x.classList.remove('video-gallery-active'));
      li.classList.add('video-gallery-active');
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
    poster.className = 'video-gallery-poster';
    if (first) poster.append(first);
    poster.insertAdjacentHTML('beforeend', '<div class="video-gallery-play"><button type="button" title="Play"></button></div>');
    poster.addEventListener('click', () => loadEmbed(stage, firstLink));
    stage.append(poster);
  }
}
