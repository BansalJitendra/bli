/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk container block. Item model (carousel-hero-item):
 *   - media_image  (reference)   -> grouped w/ media_imageAlt (Alt collapses to img attr)
 *   - content_text (richtext)
 * Each slide = one row with 2 cells: [media_image, content_text].
 *
 * The source hero (.newhomebanner) is a ROTATING carousel of banner slides,
 * but it renders them client-side from a data blob — only the ACTIVE banner
 * image (#bannerImage / .home-banner-img img) is in the static DOM at any time.
 * To reproduce the multi-slide carousel we:
 *   1. collect every banner image URL we can find in the DOM/attributes, and
 *   2. merge in the known slide set captured by clicking through the live hero
 *      (the site cycles these three desktop banners).
 * Each unique banner becomes one slide row: [media_image, content_text].
 */
const KNOWN_SLIDES = [
  'https://www.bajajlifeinsurance.com/content/dam/balic-web/images/home-banners/term-plan-etouch.jpg',
  'https://www.bajajlifeinsurance.com/content/dam/balic-web/images/home-banners/momentum-value-index-fund.webp',
  'https://www.bajajlifeinsurance.com/content/dam/balic-web/images/home-page-revamp-images/nri-investment-plans-desktop-banner.webp',
];

export default function parse(element, { document }) {
  // Collect banner image URLs present in the DOM (active slide) + any referenced
  // in element attributes (data-* slide sources), then union with KNOWN_SLIDES.
  const found = [];
  element.querySelectorAll('.home-banner-img img, #bannerImage, img').forEach((im) => {
    const src = im.getAttribute('src') || '';
    // Only real DESKTOP banner rasters: jpg/webp/png in a banner folder. Exclude
    // decorative SVG icons (active/inactive/arrows) and mobile "-m" variants.
    const isBanner = /(home-banners?|home-page-revamp)[^"']*\.(jpe?g|webp|png)(\?|$)/i.test(src);
    const isMobile = /-m\.(jpe?g|webp|png)(\?|$)/i.test(src);
    if (isBanner && !isMobile) found.push(src);
  });
  const order = [...KNOWN_SLIDES];
  found.forEach((s) => {
    const abs = s.startsWith('http') ? s : `https://www.bajajlifeinsurance.com${s}`;
    if (!order.includes(abs)) order.push(abs);
  });

  if (order.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One slide row per banner: [media_image, content_text]. content_text is left
  // empty (the source banners carry their copy baked into the image).
  const cells = order.map((src) => {
    const pic = document.createElement('picture');
    const im = document.createElement('img');
    im.setAttribute('src', src);
    im.setAttribute('alt', '');
    pic.append(im);
    const imageCell = [document.createComment(' field:media_image '), pic];
    const contentCell = [document.createComment(' field:content_text '), document.createElement('p')];
    return [imageCell, contentCell];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
