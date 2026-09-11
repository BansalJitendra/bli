export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cols = [...row.children];
  block.classList.add(`columns-app-${cols.length}-cols`);

  // Identify the image-only column (phone mockup) and the content column.
  const imgCol = cols.find(
    (c) => c.querySelector(':scope > picture') && c.children.length === 1,
  );
  if (imgCol) imgCol.classList.add('columns-app-img-col');

  const content = cols.find((c) => c !== imgCol);
  if (!content) return;
  content.classList.add('columns-app-content');

  const items = [...content.children];
  const roleOf = (p) => {
    if (p.querySelector('a')) return 'badge';
    if (p.querySelector('picture') && !p.textContent.trim()) return 'media';
    return 'text';
  };

  const textItems = items.filter((p) => roleOf(p) === 'text');
  const mediaItems = items.filter((p) => roleOf(p) === 'media');
  const badgeItems = items.filter((p) => roleOf(p) === 'badge');

  // Heading + sub-line (first two text paragraphs).
  const heading = textItems[0];
  const sub = textItems[1];
  if (heading) heading.classList.add('columns-app-heading');
  if (sub) sub.classList.add('columns-app-sub');

  // Feature list: each star icon (all media except the last, which is the QR)
  // paired with the text paragraph that follows it.
  const featureIcons = mediaItems.slice(0, -1);
  const features = document.createElement('ul');
  features.className = 'columns-app-features';
  featureIcons.forEach((iconP) => {
    let textSib = iconP.nextElementSibling;
    while (textSib && roleOf(textSib) !== 'text') {
      textSib = textSib.nextElementSibling;
    }
    const li = document.createElement('li');
    const media = iconP.querySelector('picture') || iconP.querySelector('img');
    if (media) li.append(media);
    if (textSib) {
      const span = document.createElement('span');
      span.textContent = textSib.textContent.trim();
      li.append(span);
      textSib.remove();
    }
    features.append(li);
    iconP.remove();
  });
  if (features.children.length && sub) sub.after(features);

  // Download / QR footer.
  const downloadLabel = textItems[textItems.length - 2];
  const scanLabel = textItems[textItems.length - 1];
  const qrMedia = mediaItems[mediaItems.length - 1];

  const badges = document.createElement('div');
  badges.className = 'columns-app-badges';
  badgeItems.forEach((p) => {
    const a = p.querySelector('a');
    if (a) badges.append(a);
    p.remove();
  });

  const store = document.createElement('div');
  store.className = 'columns-app-store';
  if (downloadLabel) {
    downloadLabel.classList.add('columns-app-download-label');
    store.append(downloadLabel);
  }
  store.append(badges);

  const qr = document.createElement('div');
  qr.className = 'columns-app-qr';
  if (scanLabel) {
    scanLabel.classList.add('columns-app-scan-label');
    qr.append(scanLabel);
  }
  if (qrMedia) {
    const pic = qrMedia.querySelector('picture') || qrMedia.querySelector('img');
    if (pic) qr.append(pic);
    qrMedia.remove();
  }

  const footer = document.createElement('div');
  footer.className = 'columns-app-download';
  footer.append(store, qr);
  content.append(footer);
}
