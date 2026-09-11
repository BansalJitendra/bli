/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import accordionDisclaimParser from './parsers/accordion-disclaim.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import cardsBenefitParser from './parsers/cards-benefit.js';
import cardsCategoryParser from './parsers/cards-category.js';
import cardsContactParser from './parsers/cards-contact.js';
import cardsPlanParser from './parsers/cards-plan.js';
import cardsProductParser from './parsers/cards-product.js';
import cardsQuicklinkParser from './parsers/cards-quicklink.js';
import cardsResourceParser from './parsers/cards-resource.js';
import cardsStatParser from './parsers/cards-stat.js';
import carouselBannerParser from './parsers/carousel-banner.js';
import carouselHeroParser from './parsers/carousel-hero.js';
import carouselReviewParser from './parsers/carousel-review.js';
import columnsAppParser from './parsers/columns-app.js';
import columnsClaimbarParser from './parsers/columns-claimbar.js';
import formParser from './parsers/form.js';
import heroPromoParser from './parsers/hero-promo.js';
import tabsGuideParser from './parsers/tabs-guide.js';
import tabsPlansParser from './parsers/tabs-plans.js';
import videoGalleryParser from './parsers/video-gallery.js';

// TRANSFORMER IMPORTS
import bliCleanupTransformer from './transformers/bli-cleanup.js';
import bliSectionsTransformer from './transformers/bli-sections.js';

// PARSER REGISTRY
const parsers = {
  'accordion-disclaim': accordionDisclaimParser,
  'accordion-faq': accordionFaqParser,
  'cards-benefit': cardsBenefitParser,
  'cards-category': cardsCategoryParser,
  'cards-contact': cardsContactParser,
  'cards-plan': cardsPlanParser,
  'cards-product': cardsProductParser,
  'cards-quicklink': cardsQuicklinkParser,
  'cards-resource': cardsResourceParser,
  'cards-stat': cardsStatParser,
  'carousel-banner': carouselBannerParser,
  'carousel-hero': carouselHeroParser,
  'carousel-review': carouselReviewParser,
  'columns-app': columnsAppParser,
  'columns-claimbar': columnsClaimbarParser,
  'form': formParser,
  'hero-promo': heroPromoParser,
  'tabs-guide': tabsGuideParser,
  'tabs-plans': tabsPlansParser,
  'video-gallery': videoGalleryParser,
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  "name": "home",
  "description": "Bajaj Life Insurance homepage",
  "urls": [
    "https://www.bajajlifeinsurance.com/"
  ],
  "blocks": [
    {
      "name": "carousel-hero",
      "instances": [
        ".newhomebanner .newhero-container",
        ".newhomebanner"
      ]
    },
    {
      "name": "form",
      "instances": [
        ".newhomebanner form",
        ".need-assistance form",
        "form"
      ]
    },
    {
      "name": "cards-product",
      "instances": [
        ".newhero-contbottom"
      ]
    },
    {
      "name": "columns-claimbar",
      "instances": [
        ".nhcontb-one",
        ".newhero-contbottom .nhcontb-one"
      ]
    },
    {
      "name": "cards-category",
      "instances": [
        ".cardsproduct"
      ]
    },
    {
      "name": "tabs-plans",
      "instances": [
        ".asyncTabs",
        ".lifeGoal"
      ]
    },
    {
      "name": "cards-plan",
      "instances": [
        ".asyncTabs .life-comp2-card",
        ".lifeGoal .life-comp2-card"
      ]
    },
    {
      "name": "cards-quicklink",
      "instances": [
        ".cardsV4 section.our_offering",
        "section.our_offering"
      ]
    },
    {
      "name": "cards-stat",
      "instances": [
        ".w-li-container"
      ]
    },
    {
      "name": "hero-promo",
      "instances": [
        ".promotionalbanner"
      ]
    },
    {
      "name": "cards-benefit",
      "instances": [
        ".howdoes .cards-row-two",
        ".cards-row-two"
      ]
    },
    {
      "name": "video-gallery",
      "instances": [
        ".fundVideo"
      ]
    },
    {
      "name": "tabs-guide",
      "instances": [
        ".guide"
      ]
    },
    {
      "name": "cards-resource",
      "instances": [
        ".guide .lifeitembox"
      ]
    },
    {
      "name": "carousel-review",
      "instances": [
        ".customerSpeaks"
      ]
    },
    {
      "name": "accordion-faq",
      "instances": [
        ".faq"
      ]
    },
    {
      "name": "cards-contact",
      "instances": [
        ".needHelp"
      ]
    },
    {
      "name": "carousel-banner",
      "instances": [
        ".revampCarousel"
      ]
    },
    {
      "name": "columns-app",
      "instances": [
        ".mobileApp .alip-container",
        ".alip-container"
      ]
    },
    {
      "name": "accordion-disclaim",
      "instances": [
        ".disclaimer"
      ]
    }
  ],
  "sections": [
    {
      "id": "sec-1",
      "name": "Hero banner + lead-capture form",
      "selector": [
        ".newhomebanner"
      ],
      "style": "dark-blue",
      "blocks": [
        "carousel-hero",
        "form"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-2",
      "name": "Product highlight cards + claims-settled counter bar",
      "selector": [
        ".newhero-contbottom"
      ],
      "style": null,
      "blocks": [
        "cards-product",
        "columns-claimbar"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-3",
      "name": "Life Insurance intro + category cards",
      "selector": [
        ".cardsproduct"
      ],
      "style": null,
      "blocks": [
        "cards-category"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-4",
      "name": "Most Preferred Plans (tabbed plan cards)",
      "selector": [
        ".asyncTabs"
      ],
      "style": null,
      "blocks": [
        "tabs-plans",
        "cards-plan"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-5",
      "name": "Quick Links (service shortcuts)",
      "selector": [
        ".cardsV4",
        "section.our_offering"
      ],
      "style": "light-blue",
      "blocks": [
        "cards-quicklink"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-6",
      "name": "Plans For Your Every Life Goal (tabbed plan cards + illustration)",
      "selector": [
        ".lifeGoal"
      ],
      "style": null,
      "blocks": [
        "tabs-plans",
        "cards-plan"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-7",
      "name": "Why Bajaj Life Insurance? (stats + chart)",
      "selector": [
        ".w-li-container"
      ],
      "style": null,
      "blocks": [
        "cards-stat"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-8",
      "name": "Types Of Life Insurance (informational text)",
      "selector": [
        ".howdoes"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "sec-9",
      "name": "Promotional banner 'We Are Now Bajaj Life'",
      "selector": [
        ".promotionalbanner"
      ],
      "style": "blue-image",
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-10",
      "name": "Benefits Of Life Insurance (numbered grid)",
      "selector": [
        ".howdoes .howits-container",
        ".cards-row-two"
      ],
      "style": null,
      "blocks": [
        "cards-benefit"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-11",
      "name": "Need Assistance? (call-back form)",
      "selector": [
        ".need-assistance",
        ".needAssistance"
      ],
      "style": "grey",
      "blocks": [
        "form"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-12",
      "name": "Understanding How Life Insurance Works + Why Should I Buy (informational text)",
      "selector": [
        ".titleText"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "sec-13",
      "name": "Our Customer Stories (video gallery)",
      "selector": [
        ".fundVideo"
      ],
      "style": "grey",
      "blocks": [
        "video-gallery"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-14",
      "name": "Life Insurance Guide (tabbed resource cards)",
      "selector": [
        ".guide"
      ],
      "style": "grey",
      "blocks": [
        "tabs-guide",
        "cards-resource"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-15",
      "name": "Customer Speaks (testimonial carousel)",
      "selector": [
        ".customerSpeaks"
      ],
      "style": null,
      "blocks": [
        "carousel-review"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-16",
      "name": "Frequently Asked Questions (accordion groups)",
      "selector": [
        ".faq"
      ],
      "style": null,
      "blocks": [
        "accordion-faq"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-17",
      "name": "Contact Us (info cards)",
      "selector": [
        ".needHelp"
      ],
      "style": "grey",
      "blocks": [
        "cards-contact"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-18",
      "name": "Claim Settlement Process for Flood-affected (carousel banner)",
      "selector": [
        ".revampCarousel"
      ],
      "style": "dark-blue",
      "blocks": [
        "carousel-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-19",
      "name": "Mobile App promo",
      "selector": [
        ".mobileApp"
      ],
      "style": "blue-gradient",
      "blocks": [
        "columns-app"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-20",
      "name": "Popular Searches (tag link cloud)",
      "selector": [
        ".callToBuy",
        ".popular-searches"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "sec-21",
      "name": "Disclaimers (single accordion)",
      "selector": [
        ".disclaimer"
      ],
      "style": null,
      "blocks": [
        "accordion-disclaim"
      ],
      "defaultContent": []
    }
  ]
};

// TRANSFORMER REGISTRY — cleanup first, section breaks/metadata last
const transformers = [
  bliCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [bliSectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return; // don't double-parse an element matched by multiple selectors
        seen.add(element);
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. beforeTransform (initial cleanup + section break markers)
    executeTransformers('beforeTransform', main, payload);

    // 2. discover blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. parse each block (skip elements already replaced/detached)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. sanitized path — map homepage root to /index (empty path crashes bundled importer)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
