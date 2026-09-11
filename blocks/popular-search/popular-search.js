export default function decorate(block) {
  // The block holds one cell: a heading ("Popular Searches") followed by a
  // paragraph of inline links. Render the links as a wrapping cloud of chips.
  const cell = block.querySelector(':scope > div > div') || block.querySelector(':scope > div');
  if (!cell) return;

  const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('popular-search-title');

  // Collect every link and drop them into a flex-wrap chip container.
  const links = [...cell.querySelectorAll('a')];
  if (links.length) {
    const cloud = document.createElement('div');
    cloud.className = 'popular-search-links';
    links.forEach((a) => {
      a.classList.add('popular-search-chip');
      cloud.append(a);
    });
    // Remove now-empty paragraphs left behind by the links.
    [...cell.querySelectorAll('p')].forEach((p) => {
      if (!p.textContent.trim() && !p.querySelector('a, picture, img')) p.remove();
    });
    cell.append(cloud);
  }
}
