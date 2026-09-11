/* Build block + section mappings for the "home" template. */
import fs from 'node:fs';

const PT = 'tools/importer/page-templates.json';
const pt = JSON.parse(fs.readFileSync(PT, 'utf8'));
const t = pt.templates.find((x) => x.name === 'home');

// Block variant -> DOM instance selectors (distinguishing, class-based).
const blocks = [
  { name: 'carousel-hero', instances: ['.newhomebanner .newhero-container', '.newhomebanner'] },
  { name: 'form', instances: ['.newhomebanner form', '.need-assistance form', 'form'] },
  { name: 'cards-product', instances: ['.newhero-contbottom'] },
  { name: 'columns-claimbar', instances: ['.newhero-contbottom + div', '.claims-settled'] },
  { name: 'cards-category', instances: ['.cardsproduct'] },
  { name: 'tabs-plans', instances: ['.asyncTabs', '.lifeGoal'] },
  { name: 'cards-plan', instances: ['.asyncTabs .tab-content', '.lifeGoal .tab-content'] },
  { name: 'cards-quicklink', instances: ['.cardsV4 section.our_offering', 'section.our_offering'] },
  { name: 'cards-stat', instances: ['.w-li-container'] },
  { name: 'hero-promo', instances: ['.promotionalbanner'] },
  { name: 'cards-benefit', instances: ['.howdoes .cards-row-two', '.cards-row-two'] },
  { name: 'video-gallery', instances: ['.fundVideo'] },
  { name: 'tabs-guide', instances: ['.guide'] },
  { name: 'cards-resource', instances: ['.guide .tab-content', '.guide .card-carousel'] },
  { name: 'carousel-review', instances: ['.customerSpeaks'] },
  { name: 'accordion-faq', instances: ['.faq'] },
  { name: 'cards-contact', instances: ['.needHelp'] },
  { name: 'carousel-banner', instances: ['.revampCarousel'] },
  { name: 'columns-app', instances: ['.mobileApp .alip-container', '.alip-container'] },
  { name: 'accordion-disclaim', instances: ['.disclaimer'] },
];

// Section entries — one per page-structure section (21). style from visualStyle.
const styleOf = {
  1: 'dark-blue', 2: null, 3: null, 4: null, 5: 'light-blue', 6: null, 7: null,
  8: null, 9: 'blue-image', 10: null, 11: 'grey', 12: null, 13: 'grey', 14: 'grey',
  15: null, 16: null, 17: 'grey', 18: 'dark-blue', 19: 'blue-gradient', 20: null, 21: null,
};

const secBlocks = {
  1: ['carousel-hero', 'form'],
  2: ['cards-product', 'columns-claimbar'],
  3: ['cards-category'],
  4: ['tabs-plans', 'cards-plan'],
  5: ['cards-quicklink'],
  6: ['tabs-plans', 'cards-plan'],
  7: ['cards-stat'],
  8: [],
  9: ['hero-promo'],
  10: ['cards-benefit'],
  11: ['form'],
  12: [],
  13: ['video-gallery'],
  14: ['tabs-guide', 'cards-resource'],
  15: ['carousel-review'],
  16: ['accordion-faq'],
  17: ['cards-contact'],
  18: ['carousel-banner'],
  19: ['columns-app'],
  20: [],
  21: ['accordion-disclaim'],
};

// class-based section selectors keyed by section number
const secSelector = {
  1: ['.newhomebanner'],
  2: ['.newhero-contbottom'],
  3: ['.cardsproduct'],
  4: ['.asyncTabs'],
  5: ['.cardsV4', 'section.our_offering'],
  6: ['.lifeGoal'],
  7: ['.w-li-container'],
  8: ['.howdoes'],
  9: ['.promotionalbanner'],
  10: ['.howdoes .howits-container', '.cards-row-two'],
  11: ['.need-assistance', '.needAssistance'],
  12: ['.titleText'],
  13: ['.fundVideo'],
  14: ['.guide'],
  15: ['.customerSpeaks'],
  16: ['.faq'],
  17: ['.needHelp'],
  18: ['.revampCarousel'],
  19: ['.mobileApp'],
  20: ['.callToBuy', '.popular-searches'],
  21: ['.disclaimer'],
};

const structure = JSON.parse(fs.readFileSync('migration-work/page-structure.json', 'utf8'));
const sections = structure.sections.map((s) => ({
  id: `sec-${s.number}`,
  name: s.name,
  selector: secSelector[s.number],
  style: styleOf[s.number],
  blocks: secBlocks[s.number],
  defaultContent: [],
}));

t.blocks = blocks;
t.sections = sections;
pt.metadata = { projectType: 'xwalk' };

fs.writeFileSync(PT, `${JSON.stringify(pt, null, 2)}\n`);
console.log(JSON.stringify({ blocks: blocks.length, sections: sections.length }));
