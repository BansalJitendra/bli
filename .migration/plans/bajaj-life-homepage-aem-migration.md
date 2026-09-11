# Bajaj Life Insurance — Homepage Migration Plan (Crosswalk / Universal Editor)

## Objective
Perform a **full migration** of the homepage at `https://www.bajajlifeinsurance.com/` into this AEM Edge Delivery Services **crosswalk (x-walk / Universal Editor)** project — content import, block styling/design, and navigation & footer — with visual verification against the original.

## Status
⚠️ **Execution is blocked: Plan mode is still active.** File writes and commands are disabled while the plan toggle is on, so the migration cannot run yet. I've already confirmed the project details and staged the 8-task tracking list; the moment Plan mode is switched **off** (via the plan toggle in the UI), I'll begin executing immediately — no further confirmation needed. **Executing this plan requires Execute mode.**

## Context (confirmed from the workspace)
- **Project type:** Crosswalk (x-walk) — `component-definition.json`, `component-models.json`, `component-filters.json`, `models/*` present; `fstab.yaml` mounts an AEM author (`type: markup`).
- **AEM target:** site path `/content/bajaj-life-insurance`, assets `/content/dam/bajaj-life-insurance`, author host `author-p121857-e1377564.adobeaemcloud.com`.
- **Preview org/site:** `bansaljitendra` / `bli`.
- **Existing blocks:** accordion, cards, carousel, columns, embed, footer, form, fragment, header, hero, modal, quote, search, table, tabs, video.
- **No `catalog/block-catalog.json`** → per-page block generation path (blocks generated after page analysis).
- **No `tools/importer/` yet** → import infrastructure will be created fresh.
- **Nav partially started** (`content/nav.plain.html`, `migration-work/jcr-content/nav.{md,xml}`); homepage body not yet migrated.
- **Mode:** Single Page.

## Checklist

### Phase 0 — Initialize (done during this session)
- [x] Detect mode (Single Page) and confirm target URL + scope (Full migration)
- [x] Create the 8-task migration tracking list
- [ ] Write `migration-work/migration-plan.md` *(blocked by Plan mode)*

### Phase 1 — Project setup
- [ ] Run project-expert to (re)confirm project type and block-library endpoint; validate `.migration/project.json`

### Phase 2 — Identify page templates
- [ ] Run classify pipeline on the homepage URL → `tools/importer/page-templates.json` + `migration-work/visual-trees.json`
- [ ] Derive template names; single template → proceed automatically

### Phase 3 — Page analysis
- [ ] Analyze homepage structure → `migration-work/authoring-analysis.json` (sections, content sequences, named block variants, screenshots, cleaned HTML)

### Phase 3.5 — Block library generation (per-page, sequential)
- [ ] Generate code one-at-a-time for each new variant needing it (`.js`, `.css`, `metadata.json`, `README.md`, `_<variant>.json`); reuse existing blocks; surface any skipped unknown-base variants

### Phase 4 — Block mapping
- [ ] Populate DOM-selector → block-variant mappings in `page-templates.json`

### Phase 5 — Import infrastructure
- [ ] Generate parsers + transformers; if DM/Scene7 imagery detected, apply auto-block (5a), aem.js dispatcher (5b), and xwalk model override (5c)

### Phase 6 — Content import
- [ ] Create URL list; generate import script; run bundled import → `content/*.plain.html` + report
- [ ] Convert to JCR XML aligned to component models; validate UE block models & field hinting

### Phase 7 — Navigation & footer
- [ ] Complete header/nav instrumentation (desktop, mobile, mega-menu); reconcile existing partial nav
- [ ] Migrate + validate footer (desktop + mobile)

### Phase 8 — Design & visual verification
- [ ] Extract design tokens; apply site + per-block styling
- [ ] Preview locally; fix 404s/broken refs; run visual critique against original and iterate

### Phase 9 — Finalize
- [ ] Summarize migrated content, unmapped items, follow-ups; push/preview on request

## Open items
- Interactive homepage widgets (premium calculators, lead forms, login) may need the **Forms** migration plugin (`forms-excat`, not yet enabled) or fragments — will surface in Phase 3/4. I can enable that plugin if you confirm.

---
**To proceed:** turn off the Plan-mode toggle in the UI. Once Execute mode is active, I'll start at Phase 1 automatically.
