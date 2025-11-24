/**
 * Knowledge Layer
 *
 * Professional knowledge management system for VC-Shell framework.
 * All framework knowledge is loaded from structured data files.
 *
 * @example
 * ```ts
 * import { KnowledgeBase } from './knowledge';
 *
 * const kb = new KnowledgeBase();
 * await kb.loadAll();
 *
 * // Search components
 * const results = kb.components.search({ query: 'table' });
 *
 * // Get framework APIs
 * const api = kb.frameworkAPIs.findByName('useBladeNavigation');
 *
 * // Find patterns
 * const patterns = kb.patterns.getForBladeType('list');
 *
 * // Find templates
 * const template = kb.templates.findBestMatch('list', ['filters', 'multiselect']);
 *
 * // Validate features
 * const { valid, invalid } = kb.features.validateFeatures(['filters', 'invalid-feature']);
 * ```
 */

export * from "./types";
export * from "./knowledge-base";
export * from "./registries/base";
export * from "./registries/components";
export * from "./registries/framework";
export * from "./registries/patterns";
export * from "./registries/templates";
export * from "./registries/features";
