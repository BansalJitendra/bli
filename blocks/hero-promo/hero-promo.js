export default function decorate(block) {
  // Source promo banner is a single full-width clickable artwork (photo + headline +
  // baked-in CTA). Content is authored as two rows: the banner image and a CTA link.
  // Collapse them into one clickable image so the whole banner navigates like the source.
  const picture = block.querySelector('picture');
  const link = block.querySelector('a[href]');
  const href = link ? link.getAttribute('href') : null;
  const label = link ? link.textContent.trim() : '';
  const img = picture && picture.querySelector('img');
  if (img) img.setAttribute('loading', 'eager');

  block.textContent = '';

  if (href) {
    const a = document.createElement('a');
    a.className = 'hero-promo-link';
    a.href = href;
    if (label) a.setAttribute('aria-label', label);
    if (picture) a.append(picture);
    block.append(a);
  } else if (picture) {
    block.append(picture);
  }
}
