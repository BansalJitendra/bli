/* eslint-disable */
/* global WebImporter */
/**
 * Parser for form. Base: form.
 * Source: https://www.bajajlifeinsurance.com/ (template: home)
 * Generated: 2026-09-11
 *
 * xwalk simple block. Model (form):
 *   - reference (aem-content) -> path to the form definition (spreadsheet/JSON)
 *   - action    (text)        -> submit action URL
 * Simple block: one column, one row per field. The source is a live <form>; EDS
 * forms are driven by a form-definition resource, so we emit a reference cell
 * (placeholder path to be wired by the author) and the action cell derived from
 * the form's own action/id.
 */
export default function parse(element, { document }) {
  // The source <form> may be the element itself or a descendant.
  const form = element.matches && element.matches('form') ? element : element.querySelector('form');

  const action = (form && (form.getAttribute('action') || form.dataset.action)) || '';

  const cells = [];

  // Row 1: reference (path to the form model). aem-content expects a plain path
  // string, NOT a link — a lone link here is misread by md2jcr as a component
  // header, so emit the path as text.
  const refCell = [document.createComment(' field:reference ')];
  refCell.push(document.createTextNode('/forms/need-assistance'));
  cells.push([refCell]);

  // Row 2: action URL
  const actionCell = [document.createComment(' field:action ')];
  actionCell.push(document.createTextNode(action));
  cells.push([actionCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
  element.replaceWith(block);
}
