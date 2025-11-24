/**
 * Intelligence Layer
 *
 * Smart matching, resolution, and validation layer.
 * Uses Knowledge Layer data for intelligent decisions.
 *
 * @example
 * ```ts
 * import { KnowledgeBase } from '../knowledge';
 * import { ComponentResolver, FeatureResolver } from './intelligence';
 *
 * const kb = new KnowledgeBase();
 * await kb.loadAll();
 *
 * // Resolve components by intent
 * const componentResolver = new ComponentResolver(kb.components);
 * const match = await componentResolver.resolve({
 *   intent: 'data table with sorting',
 *   context: 'list',
 *   features: ['filters', 'multiselect']
 * });
 *
 * // Resolve features
 * const featureResolver = new FeatureResolver(kb.features);
 * const features = await featureResolver.resolve('filterable searchable', 'list');
 *
 * // Validate features
 * const validation = await featureResolver.validate(['filters', 'invalid-feature']);
 * ```
 */

export * from "./types";

// Matchers
export * from "./matchers/fuzzy";
export * from "./matchers/semantic";
export * from "./matchers/hybrid";

// Resolvers
export * from "./resolvers/component-resolver";
export * from "./resolvers/feature-resolver";
export * from "./resolvers/capability-resolver";
export * from "./resolvers/template-resolver";

// Validators
export * from "./validators/schema";
export * from "./validators/ui-plan";
export * from "./validators/code";
export * from "./validators/ast-validator";
