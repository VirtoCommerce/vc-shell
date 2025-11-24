/**
 * Knowledge Layer Types
 *
 * Type definitions for the knowledge-driven architecture.
 * All types are derived from structured data files, not hardcoded.
 */

/**
 * Component metadata from component-registry.json
 */
export interface ComponentMetadata {
  import: string;
  component: string;
  description: string;
  category: string;
  demos: string[];
  keywords: string[];
  dependencies: string[];
  capabilities?: ComponentCapability[];
  props?: ComponentProp[];
  slots?: ComponentSlot[];
  events?: ComponentEvent[];
  templates?: ComponentTemplate[];
  compositions?: ComponentComposition[];
}

export interface ComponentCapability {
  id: string;
  name: string;
  description: string;
  complexity: "simple" | "moderate" | "complex";
  useCases: string[];
  examples: string[];
  methods?: string[];
  requiredProps?: string[];
  relatedSlots?: string[];
  relatedEvents?: string[];
}

export interface ComponentProp {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  default?: any;
  examples?: string[];
}

export interface ComponentSlot {
  name: string;
  description: string;
  props?: Record<string, string>;
  examples?: string[];
}

export interface ComponentEvent {
  name: string;
  description: string;
  payload?: string;
  examples?: string[];
}

export interface ComponentTemplate {
  id: string;
  file: string;
  complexity: string;
  lines: number;
  features: string[];
  description: string;
  requiredComponents?: string[];
}

export interface ComponentComposition {
  id: string;
  file: string;
  structure: string;
  description: string;
}

/**
 * Framework API metadata from framework-api-registry.json
 */
export interface FrameworkAPIMetadata {
  name: string;
  import: string;
  type: "composable" | "plugin" | "utility" | "service";
  description: string;
  category: string;
  keywords: string[];
  methods?: APIMethod[];
  state?: APIState[];
  capabilities?: APICapability[];
  examples?: string[];
}

export interface APIMethod {
  name: string;
  description: string;
  signature: string;
  params: APIParam[];
  returns: string;
  useCases: string[];
  examples?: string[];
}

export interface APIParam {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
}

export interface APIState {
  name: string;
  type: string;
  description: string;
  reactive: boolean;
}

export interface APICapability {
  id: string;
  name: string;
  description: string;
  methods: string[];
  complexity: "simple" | "moderate" | "complex";
  useCases: string[];
  examples?: string[];
}

/**
 * Pattern metadata from examples/index.yaml
 */
export interface PatternMetadata {
  id: string;
  file: string;
  category: "architectural" | "blade" | "communication" | "component-usage" | "best-practice" | "example";
  applies_to: string[];
  description: string;
  features: string[];
  content?: string; // Loaded on demand
}

/**
 * Template metadata from examples/index.yaml
 */
export interface TemplateMetadata {
  id: string;
  file: string;
  blade_type: "list" | "details";
  complexity: "simple" | "moderate" | "complex";
  lines: number;
  features: string[];
  description: string;
  content?: string; // Loaded on demand
}

/**
 * Feature metadata - synthesized from all sources
 */
export interface FeatureMetadata {
  id: string;
  name: string;
  description: string;
  category: "list" | "details" | "global";
  keywords: string[];
  requiredComponents: string[];
  requiredAPIs: string[];
  patterns: string[]; // Pattern IDs that demonstrate this feature
  templates: string[]; // Template IDs that include this feature
  complexity: "simple" | "moderate" | "complex";
}

/**
 * Search and matching types
 */
export interface SearchOptions {
  query?: string;
  category?: string;
  type?: string;
  limit?: number;
  offset?: number;
  threshold?: number; // Minimum score threshold
}

export interface SearchResult<T> {
  item: T;
  score: number;
  matches?: string[];
  reason?: string;
}

export interface IntentMatch {
  component?: string;
  api?: string;
  pattern?: string;
  template?: string;
  score: number;
  reason: string;
  metadata: any;
}

export interface SemanticQuery {
  intent: string;
  context?: "list" | "details" | "general";
  entity?: string;
  features?: string[];
  constraints?: Record<string, any>;
}

/**
 * Registry options
 */
export interface RegistryOptions {
  cacheEnabled?: boolean;
  lazyLoad?: boolean;
  preloadContent?: boolean;
}
