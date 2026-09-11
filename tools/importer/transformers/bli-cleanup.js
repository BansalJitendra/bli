/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Bajaj Life Insurance (bli) site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content. Header and footer are auto-populated experience
 * fragments in EDS and must be excluded from page content.
 *
 * Every selector below was verified by reading migration-work/cleaned.html.
 * NOTE: `.experiencefragment` is intentionally NOT removed — on this site it
 * wraps real authorable content sections (e.g. cmp-experiencefragment--whyBajaj,
 * cmp-experiencefragment--need-assistance), so removing it would drop content.
 * Header/footer are targeted by their own stable wrappers / semantic tags.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Non-authorable overlays / widgets / popups (verified in cleaned.html).
    WebImporter.DOMUtils.remove(element, [
      '.tncpopup',                        // T&C / NRI helpline popups (multiple)
      '.feedback',                        // floating feedback widget (#main-container)
      '.floating-feedback-main-container',
      '#videoModal',                      // video modal overlay container
      '#balic-gps-card',                  // Google Preferred Sources promo card
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // --- Header experience fragment (nav/menu) ---
      'header',
      '.headerLib',

      // --- Footer experience fragment ---
      'footer',
      '.footerLinks',
      '.footerNotice',
      '.footerAddress',
      '.footerSocials',
      '.footerlinksList',
      '.footerText',

      // --- Tracking / analytics beacons & sync iframes ---
      '[id^="batBeacon"]',                                 // Bing UET beacons
      '#destination_publishing_iframe_bajajallianzlife_0', // Adobe demdex ID sync
      'iframe[src*="demdex.net"]',
      'iframe[src*="news.google.com"]',                    // Subscribe with Google service iframe

      // --- Scripts / stylesheet links / noscript ---
      'script',
      'link',
      'noscript',
    ]);
  }
}
