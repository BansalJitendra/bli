/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/accordion-disclaim.js
  function parse(element, { document: document2 }) {
    const paras = Array.from(element.querySelectorAll(":scope > p, :scope > div"));
    const hasText = element.textContent && element.textContent.trim();
    if (!hasText) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const summaryCell = [document2.createComment(" field:summary "), document2.createTextNode("Disclaimer")];
    const textCell = [document2.createComment(" field:text ")];
    if (paras.length) {
      paras.forEach((p) => textCell.push(p.cloneNode(true)));
    } else {
      const p = document2.createElement("p");
      p.textContent = element.textContent.trim();
      textCell.push(p);
    }
    const cells = [[summaryCell, textCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-disclaim", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function parse2(element, { document: document2 }) {
    const itemEls = Array.from(element.querySelectorAll(".itemFAQ"));
    if (itemEls.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    itemEls.forEach((item) => {
      const question = item.querySelector(".item-head .h2, .item-head p, .item-head");
      const answer = item.querySelector(".hidden-box");
      const summaryCell = [document2.createComment(" field:summary ")];
      summaryCell.push(document2.createTextNode(question ? question.textContent.trim() : ""));
      const textCell = [document2.createComment(" field:text ")];
      if (answer) {
        Array.from(answer.childNodes).forEach((node) => {
          if (node.nodeType === 3 && !node.textContent.trim()) return;
          textCell.push(node.cloneNode(true));
        });
      }
      if (textCell.length === 1) textCell.push(document2.createElement("p"));
      cells.push([summaryCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-benefit.js
  function parse3(element, { document: document2 }) {
    let cardEls;
    if (element.classList && element.classList.contains("card")) {
      cardEls = [element];
    } else {
      cardEls = Array.from(element.querySelectorAll(":scope > .card"));
      if (cardEls.length === 0) cardEls = Array.from(element.querySelectorAll(".card"));
    }
    if (cardEls.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cardEls.forEach((card) => {
      const img = card.querySelector(":scope > img, img");
      const title = card.querySelector(".card-title");
      const body = card.querySelector(".card-text");
      const textCell = [document2.createComment(" field:text ")];
      if (img) textCell.push(img);
      if (title && title.textContent.trim()) {
        const h = document2.createElement("h3");
        h.textContent = title.textContent.trim();
        textCell.push(h);
      }
      if (body) {
        Array.from(body.childNodes).forEach((node) => textCell.push(node.cloneNode(true)));
      }
      cells.push([textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-benefit", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category.js
  function parse4(element, { document: document2 }) {
    const cardEls = Array.from(element.querySelectorAll(".card_box_text"));
    if (cardEls.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cardEls.forEach((card) => {
      const img = card.querySelector("img");
      const link = card.querySelector("a.card_box, a");
      const heading = card.querySelector(".card_box_heading");
      const nudge = card.querySelector(".card_box_nudge");
      const imageCell = [];
      if (img) {
        imageCell.push(document2.createComment(" field:image "));
        imageCell.push(img);
      }
      const textCell = [document2.createComment(" field:text ")];
      if (heading) {
        const h = document2.createElement("h3");
        h.textContent = heading.textContent.trim();
        textCell.push(h);
      }
      if (nudge && nudge.textContent.trim()) {
        const p = document2.createElement("p");
        p.append(...nudge.cloneNode(true).childNodes);
        textCell.push(p);
      }
      if (link && link.getAttribute("href")) {
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = heading && heading.textContent.trim() || link.textContent.trim();
        textCell.push(a);
      }
      cells.push([
        imageCell.length ? imageCell : "",
        textCell
      ]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-category", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-contact.js
  function parse5(element, { document: document2 }) {
    const header = element.querySelector(".prom-p-h");
    const title = element.querySelector(".prom-p-h-h1");
    const sub = element.querySelector(".prom-p-h-h5");
    if ((!title || !title.textContent.trim()) && (!sub || !sub.textContent.trim()) && !header) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textCell = [document2.createComment(" field:text ")];
    if (title && title.textContent.trim()) {
      const h = document2.createElement("h3");
      h.textContent = title.textContent.trim();
      textCell.push(h);
    }
    if (sub && sub.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = sub.textContent.trim();
      textCell.push(p);
    }
    if (textCell.length === 1) textCell.push(document2.createElement("p"));
    const cells = [[textCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-contact", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-plan.js
  function parse6(element, { document: document2 }) {
    let cardEls;
    if (element.classList && element.classList.contains("life-comp2-card")) {
      cardEls = [element];
    } else {
      cardEls = Array.from(element.querySelectorAll(".life-comp2-card"));
    }
    if (cardEls.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cardEls.forEach((card) => {
      const img = card.querySelector(".termplan button img, img");
      const imageCell = [];
      if (img) {
        imageCell.push(document2.createComment(" field:image "));
        imageCell.push(img);
      }
      const textCell = [document2.createComment(" field:text ")];
      const category = card.querySelector(".termplan .h4");
      const badge = card.querySelector(".termplan button");
      const heading = card.querySelector(".bajaj-smart .h2");
      const sub = card.querySelector(".subheading-asynctabs");
      if (category && category.textContent.trim()) {
        const p = document2.createElement("p");
        p.append(...category.cloneNode(true).childNodes);
        textCell.push(p);
      }
      if (badge && badge.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = badge.textContent.trim();
        textCell.push(p);
      }
      if (heading && heading.textContent.trim()) {
        const h = document2.createElement("h3");
        h.textContent = heading.textContent.trim();
        textCell.push(h);
      }
      if (sub && sub.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = sub.textContent.trim();
        textCell.push(p);
      }
      const points = Array.from(card.querySelectorAll(".card2-middle-details .h3"));
      if (points.length) {
        const ul = document2.createElement("ul");
        points.forEach((pt) => {
          const li = document2.createElement("li");
          li.append(...pt.cloneNode(true).childNodes);
          ul.append(li);
        });
        textCell.push(ul);
      }
      card.querySelectorAll(".card2-last a[href]").forEach((a) => {
        const link = document2.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = a.textContent.trim();
        textCell.push(link);
      });
      cells.push([
        imageCell.length ? imageCell : "",
        textCell
      ]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-plan", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse7(element, { document: document2 }) {
    let panels = Array.from(element.querySelectorAll(":scope > .nhcontb-one, :scope > .nhcontb-two"));
    if (panels.length === 0) {
      panels = Array.from(element.querySelectorAll(":scope > div"));
    }
    const cells = [];
    panels.forEach((panel) => {
      const img = panel.querySelector("img");
      const imageCell = [];
      if (img) {
        imageCell.push(document2.createComment(" field:image "));
        imageCell.push(img);
      }
      const textCell = [document2.createComment(" field:text ")];
      Array.from(panel.childNodes).forEach((node) => {
        if (node.nodeType === 1 && node.tagName === "IMG") return;
        textCell.push(node.cloneNode(true));
      });
      cells.push([
        imageCell.length ? imageCell : "",
        textCell
      ]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-quicklink.js
  function parse8(element, { document: document2 }) {
    const cardEls = Array.from(element.querySelectorAll(".services-ibox"));
    if (cardEls.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cardEls.forEach((card) => {
      const img = card.querySelector(".cardhedaimg img, img");
      const link = card.querySelector("a.services_item_bx, a");
      const title = card.querySelector(".h4");
      const imageCell = [];
      if (img) {
        imageCell.push(document2.createComment(" field:image "));
        imageCell.push(img);
      }
      const textCell = [document2.createComment(" field:text ")];
      const label = title && title.textContent.trim() || link && link.textContent.trim() || "";
      if (link && link.getAttribute("href")) {
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = label;
        textCell.push(a);
      } else if (label) {
        const p = document2.createElement("p");
        p.textContent = label;
        textCell.push(p);
      }
      cells.push([
        imageCell.length ? imageCell : "",
        textCell
      ]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-quicklink", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-resource.js
  function parse9(element, { document: document2 }) {
    let itemEls = Array.from(element.querySelectorAll(".life-box-item"));
    if (itemEls.length === 0 && element.classList && element.classList.contains("life-box-item")) {
      itemEls = [element];
    }
    if (itemEls.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    itemEls.forEach((item) => {
      const img = item.querySelector(".box-img img, img");
      const title = item.querySelector(".box-img .h5, .h5");
      const desc = item.querySelector(".box-details p, .box-details");
      const link = item.querySelector("a[href]");
      const imageCell = [];
      if (img) {
        imageCell.push(document2.createComment(" field:image "));
        imageCell.push(img);
      }
      const textCell = [document2.createComment(" field:text ")];
      if (title && title.textContent.trim()) {
        const h = document2.createElement("h4");
        h.textContent = title.textContent.trim();
        textCell.push(h);
      }
      if (desc && desc.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = desc.textContent.trim();
        textCell.push(p);
      }
      if (link && link.getAttribute("href")) {
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = link.textContent.trim() || title && title.textContent.trim() || link.getAttribute("href");
        textCell.push(a);
      }
      if (textCell.length === 1) textCell.push(document2.createElement("p"));
      cells.push([
        imageCell.length ? imageCell : "",
        textCell
      ]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-resource", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-stat.js
  function parse10(element, { document: document2 }) {
    const header = element.querySelector(".w-li-header");
    const para = element.querySelector(".w-li-main-para");
    if ((!header || !header.textContent.trim()) && (!para || !para.textContent.trim())) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textCell = [document2.createComment(" field:text ")];
    if (header && header.textContent.trim()) {
      const h = document2.createElement("h3");
      h.textContent = header.textContent.trim();
      textCell.push(h);
    }
    if (para) {
      Array.from(para.childNodes).forEach((node) => textCell.push(node.cloneNode(true)));
    }
    const cells = [["", textCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-stat", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-banner.js
  function parse11(element, { document: document2 }) {
    const slideEls = Array.from(element.querySelectorAll(".slides-container .carouselslide, .carouselslide"));
    if (slideEls.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    slideEls.forEach((slide) => {
      const img = slide.querySelector("img");
      const anchor = slide.querySelector("a[data-videolink], a[href]");
      const target = anchor && (anchor.getAttribute("data-videolink") || (anchor.getAttribute("href") && !anchor.getAttribute("href").includes("javascript") ? anchor.getAttribute("href") : ""));
      const imageCell = [];
      if (img) {
        imageCell.push(document2.createComment(" field:media_image "));
        imageCell.push(img);
      }
      const contentCell = [document2.createComment(" field:content_text ")];
      if (target) {
        const a = document2.createElement("a");
        a.href = target;
        a.textContent = img && img.getAttribute("alt") && img.getAttribute("alt").trim() || "View";
        contentCell.push(a);
      } else if (img && img.getAttribute("alt") && img.getAttribute("alt").trim()) {
        const p = document2.createElement("p");
        p.textContent = img.getAttribute("alt").trim();
        contentCell.push(p);
      } else {
        contentCell.push(document2.createElement("p"));
      }
      cells.push([
        imageCell.length ? imageCell : "",
        contentCell
      ]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-hero.js
  function parse12(element, { document: document2 }) {
    const img = element.querySelector("#bannerImage, .home-banner-img img, img");
    const navLabels = Array.from(element.querySelectorAll(".newhnavlist li")).map((li) => li.textContent.trim()).filter(Boolean);
    const heading = element.querySelector(".planFormHeading1-class, .planFormHeading2-class");
    if (!img && navLabels.length === 0 && !heading) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const imageCell = [];
    if (img) {
      imageCell.push(document2.createComment(" field:media_image "));
      imageCell.push(img);
    }
    const contentCell = [document2.createComment(" field:content_text ")];
    if (heading && heading.textContent.trim()) {
      const h = document2.createElement("h2");
      h.textContent = heading.textContent.trim();
      contentCell.push(h);
    }
    navLabels.forEach((label) => {
      const p = document2.createElement("p");
      p.textContent = label;
      contentCell.push(p);
    });
    if (contentCell.length === 1) contentCell.push(document2.createElement("p"));
    cells.push([
      imageCell.length ? imageCell : "",
      contentCell
    ]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-review.js
  function parse13(element, { document: document2 }) {
    const reviewEls = Array.from(element.querySelectorAll(".testimonials-list"));
    if (reviewEls.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    reviewEls.forEach((review) => {
      const img = review.querySelector(".cust-image img, img");
      const heading = review.querySelector(".text-test-card-head");
      const quote = review.querySelector(".text-test-card-content");
      const name = review.querySelector(".bottom-cust-name");
      const role = review.querySelector(".bottom-cust-job");
      const imageCell = [];
      if (img) {
        imageCell.push(document2.createComment(" field:media_image "));
        imageCell.push(img);
      }
      const contentCell = [document2.createComment(" field:content_text ")];
      if (heading && heading.textContent.trim()) {
        const h = document2.createElement("h3");
        h.textContent = heading.textContent.trim();
        contentCell.push(h);
      }
      if (quote && quote.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = quote.textContent.trim();
        contentCell.push(p);
      }
      if (name && name.textContent.trim()) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = name.textContent.trim();
        p.append(strong);
        if (role && role.textContent.trim()) {
          p.append(document2.createTextNode(`, ${role.textContent.trim()}`));
        }
        contentCell.push(p);
      }
      if (contentCell.length === 1) contentCell.push(document2.createElement("p"));
      cells.push([
        imageCell.length ? imageCell : "",
        contentCell
      ]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-review", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-app.js
  function parse14(element, { document: document2 }) {
    const left = element.querySelector(":scope > .alip-left");
    const right = element.querySelector(":scope > .alip-right");
    if (!left && !right) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const leftCell = document2.createElement("div");
    if (left) {
      Array.from(left.childNodes).forEach((node) => leftCell.append(node.cloneNode(true)));
    }
    const rightCell = document2.createElement("div");
    if (right) {
      Array.from(right.childNodes).forEach((node) => rightCell.append(node.cloneNode(true)));
    }
    const cells = [[leftCell, rightCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-app", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-claimbar.js
  function parse15(element, { document: document2 }) {
    const label = element.querySelector(":scope > span, :scope > .nhcbo-label");
    const digitEls = Array.from(element.querySelectorAll(".nhcbb-num"));
    if (!label && digitEls.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const labelCell = document2.createElement("div");
    if (label) labelCell.append(label.cloneNode(true));
    const numberCell = document2.createElement("div");
    const digits = digitEls.map((d) => d.textContent.trim()).join("");
    if (digits) {
      const p = document2.createElement("p");
      p.textContent = digits;
      numberCell.append(p);
    }
    const cells = [[labelCell, numberCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-claimbar", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form.js
  function parse16(element, { document: document2 }) {
    const form = element.matches && element.matches("form") ? element : element.querySelector("form");
    const action = form && (form.getAttribute("action") || form.dataset.action) || "";
    const cells = [];
    const refCell = [document2.createComment(" field:reference ")];
    refCell.push(document2.createTextNode("/forms/need-assistance"));
    cells.push([refCell]);
    const actionCell = [document2.createComment(" field:action ")];
    actionCell.push(document2.createTextNode(action));
    cells.push([actionCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "form", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-promo.js
  function parse17(element, { document: document2 }) {
    const desktopImg = element.querySelector(".fordesktop img, img");
    const link = element.querySelector(".fordesktop a[href], a[href]");
    if (!desktopImg && !link) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([desktopImg || ""]);
    const alt = (desktopImg && desktopImg.getAttribute("alt") || "").trim();
    const p = document2.createElement("p");
    if (link && link.getAttribute("href")) {
      const lead = alt && alt.toLowerCase() !== "promotional desktop" ? alt : "Explore this offer";
      p.append(document2.createTextNode(`${lead}. `));
      const a = document2.createElement("a");
      a.href = link.getAttribute("href");
      const linkText = (link.textContent || "").trim();
      a.textContent = linkText && linkText !== alt ? linkText : "Check Now";
      p.append(a);
    } else {
      p.textContent = alt || "Promotional banner";
    }
    cells.push([[p]]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-guide.js
  function buildResourceContent(document2, item) {
    const frag = document2.createElement("div");
    const img = item.querySelector(".box-img img, img");
    const title = item.querySelector(".box-img .h5, .h5");
    const desc = item.querySelector(".box-details p, .box-details");
    const link = item.querySelector("a[href]");
    if (img) frag.append(img.cloneNode(true));
    if (title && title.textContent.trim()) {
      const h = document2.createElement("h4");
      h.textContent = title.textContent.trim();
      frag.append(h);
    }
    if (desc && desc.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = desc.textContent.trim();
      frag.append(p);
    }
    if (link && link.getAttribute("href")) {
      const a = document2.createElement("a");
      a.href = link.getAttribute("href");
      a.textContent = title && title.textContent.trim() || link.textContent.trim() || link.getAttribute("href");
      frag.append(a);
    }
    return frag;
  }
  function parse18(element, { document: document2 }) {
    const labelEls = Array.from(element.querySelectorAll(".guide_itemlist .guide_li")).filter((li) => li.textContent.trim());
    const resourceItems = Array.from(element.querySelectorAll(".life-box-item"));
    if (labelEls.length === 0 && resourceItems.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (labelEls.length) {
      labelEls.forEach((li) => {
        const isActive = li.classList.contains("guide_liactive");
        const labelText = li.textContent.trim();
        const titleCell = [document2.createComment(" field:title "), document2.createTextNode(labelText)];
        const contentCell = [document2.createComment(" field:content_richtext ")];
        if (isActive && resourceItems.length) {
          resourceItems.forEach((item) => contentCell.push(buildResourceContent(document2, item)));
        } else {
          const p = document2.createElement("p");
          p.textContent = `${labelText} content coming soon.`;
          contentCell.push(p);
        }
        cells.push([titleCell, contentCell]);
      });
    } else {
      const titleCell = [document2.createComment(" field:title "), document2.createTextNode("Guide")];
      const contentCell = [document2.createComment(" field:content_richtext ")];
      resourceItems.forEach((item) => contentCell.push(buildResourceContent(document2, item)));
      cells.push([titleCell, contentCell]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-guide", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-plans.js
  function buildCardContent(document2, card) {
    const frag = document2.createElement("div");
    const heading = card.querySelector(".bajaj-smart .h2, .h2");
    const sub = card.querySelector(".subheading-asynctabs");
    const category = card.querySelector(".termplan .h4");
    if (category && category.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = category.textContent.trim();
      frag.append(p);
    }
    if (heading && heading.textContent.trim()) {
      const h = document2.createElement("h3");
      h.textContent = heading.textContent.trim();
      frag.append(h);
    }
    if (sub && sub.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = sub.textContent.trim();
      frag.append(p);
    }
    const points = Array.from(card.querySelectorAll(".card2-middle-details .h3"));
    if (points.length) {
      const ul = document2.createElement("ul");
      points.forEach((pt) => {
        const li = document2.createElement("li");
        li.append(...pt.cloneNode(true).childNodes);
        ul.append(li);
      });
      frag.append(ul);
    }
    card.querySelectorAll(".card2-last a[href]").forEach((a) => {
      const link = document2.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = a.textContent.trim();
      frag.append(link);
    });
    return frag;
  }
  function parse19(element, { document: document2 }) {
    const labels = Array.from(element.querySelectorAll(".goal_itemlist .goal_li, .goal_li")).filter((li) => li.textContent.trim());
    const activeCards = Array.from(element.querySelectorAll(".life-comp2-card"));
    if (labels.length === 0 && activeCards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (labels.length) {
      labels.forEach((li) => {
        const isActive = li.classList.contains("goal_liactive");
        const titleCell = [document2.createComment(" field:title ")];
        titleCell.push(document2.createTextNode(li.textContent.trim()));
        const contentCell = [document2.createComment(" field:content_richtext ")];
        if (isActive && activeCards.length) {
          activeCards.forEach((card) => contentCell.push(buildCardContent(document2, card)));
        } else {
          const p = document2.createElement("p");
          p.textContent = li.textContent.trim();
          contentCell.push(p);
        }
        cells.push([titleCell, contentCell]);
      });
    } else {
      const titleCell = [document2.createComment(" field:title "), document2.createTextNode("Most Preferred Plans")];
      const contentCell = [document2.createComment(" field:content_richtext ")];
      activeCards.forEach((card) => contentCell.push(buildCardContent(document2, card)));
      cells.push([titleCell, contentCell]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-plans", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video-gallery.js
  function parse20(element, { document: document2 }) {
    const itemEls = Array.from(element.querySelectorAll(".fv-list__item"));
    if (itemEls.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    itemEls.forEach((item) => {
      const thumb = item.querySelector(".fv-list__thumb, img");
      const title = item.querySelector(".fv-list__title");
      const duration = item.querySelector(".fv-list__duration");
      const src = item.getAttribute("data-src") || item.querySelector("a") && item.querySelector("a").getAttribute("href");
      const imageCell = [];
      if (thumb) {
        imageCell.push(document2.createComment(" field:image "));
        imageCell.push(thumb);
      }
      const textCell = [document2.createComment(" field:text ")];
      if (title && title.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = title.textContent.trim();
        textCell.push(p);
      }
      if (duration && duration.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = duration.textContent.trim();
        textCell.push(p);
      }
      if (textCell.length === 1) textCell.push(document2.createElement("p"));
      const linkCell = [];
      if (src) {
        linkCell.push(document2.createComment(" field:link "));
        const a = document2.createElement("a");
        a.href = src;
        a.textContent = title && title.textContent.trim() || src;
        linkCell.push(a);
      }
      cells.push([
        imageCell.length ? imageCell : "",
        textCell,
        linkCell.length ? linkCell : ""
      ]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "video-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/bli-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".tncpopup",
        // T&C / NRI helpline popups (multiple)
        ".feedback",
        // floating feedback widget (#main-container)
        ".floating-feedback-main-container",
        "#videoModal",
        // video modal overlay container
        "#balic-gps-card"
        // Google Preferred Sources promo card
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // --- Header experience fragment (nav/menu) ---
        "header",
        ".headerLib",
        // --- Footer experience fragment ---
        "footer",
        ".footerLinks",
        ".footerNotice",
        ".footerAddress",
        ".footerSocials",
        ".footerlinksList",
        ".footerText",
        // --- Tracking / analytics beacons & sync iframes ---
        '[id^="batBeacon"]',
        // Bing UET beacons
        "#destination_publishing_iframe_bajajallianzlife_0",
        // Adobe demdex ID sync
        'iframe[src*="demdex.net"]',
        'iframe[src*="news.google.com"]',
        // Subscribe with Google service iframe
        // --- Scripts / stylesheet links / noscript ---
        "script",
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/bli-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "accordion-disclaim": parse,
    "accordion-faq": parse2,
    "cards-benefit": parse3,
    "cards-category": parse4,
    "cards-contact": parse5,
    "cards-plan": parse6,
    "cards-product": parse7,
    "cards-quicklink": parse8,
    "cards-resource": parse9,
    "cards-stat": parse10,
    "carousel-banner": parse11,
    "carousel-hero": parse12,
    "carousel-review": parse13,
    "columns-app": parse14,
    "columns-claimbar": parse15,
    "form": parse16,
    "hero-promo": parse17,
    "tabs-guide": parse18,
    "tabs-plans": parse19,
    "video-gallery": parse20
  };
  var PAGE_TEMPLATE = {
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
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
