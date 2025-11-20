/**
 * Type definitions for examples system
 *
 * Examples are stored as Markdown files with optional frontmatter.
 * Index provides metadata for quick search and filtering.
 */

export type ExampleType = "PROP" | "SLOT" | "EVENT" | "PATTERN" | "COMPOSITION" | "API" | "TUTORIAL";
export type ExampleComplexity = "SIMPLE" | "MODERATE" | "COMPLEX";
export type ExampleCategory = "data-binding" | "navigation" | "forms" | "tables" | "communication" | "lifecycle" | "state" | "ui";

/**
 * Example metadata (from frontmatter or index)
 */
export interface ExampleMetadata {
  /** Unique identifier */
  id: string;
  /** File path relative to examples/ */
  file: string;
  /** Example type */
  type: ExampleType;
  /** Component name (for capability examples) */
  component?: string;
  /** Complexity level */
  complexity: ExampleComplexity;
  /** Category */
  category?: ExampleCategory;
  /** Tags for search */
  tags?: string[];
  /** Is this a critical example (often needed) */
  critical?: boolean;
  /** Related rule IDs */
  related_rules?: string[];
  /** Title */
  title?: string;
  /** Short description */
  description?: string;
}

/**
 * Capability example (component prop/slot/event)
 */
export interface CapabilityExample extends ExampleMetadata {
  type: "PROP" | "SLOT" | "EVENT";
  component: string;
}

/**
 * Pattern example (architectural pattern)
 */
export interface PatternExample extends ExampleMetadata {
  type: "PATTERN";
  /** Pattern category */
  pattern_category?: "list" | "details" | "communication" | "state" | "general";
}

/**
 * Composition example (composable usage)
 */
export interface CompositionExample extends ExampleMetadata {
  type: "COMPOSITION";
  /** Blade type where this composition applies */
  blade_type?: "list" | "details" | "all";
}

/**
 * Framework API example
 */
export interface FrameworkAPIExample extends ExampleMetadata {
  type: "API";
  /** API name (composable, plugin, utility) */
  api_name: string;
  /** API type */
  api_type: "composable" | "plugin" | "utility" | "service";
}

/**
 * Examples index structure
 */
export interface ExamplesIndex {
  /** Capability examples grouped by component */
  capabilities: Record<string, CapabilityExample[]>;
  /** Pattern examples */
  patterns: PatternExample[];
  /** Composition examples */
  compositions: {
    list?: CompositionExample[];
    details?: CompositionExample[];
    shared?: CompositionExample[];
  };
  /** Framework API examples */
  framework: FrameworkAPIExample[];
  /** Tutorial examples */
  tutorials?: ExampleMetadata[];
}

/**
 * Example search query
 */
export interface ExampleSearchQuery {
  /** Component name */
  component?: string;
  /** Example type */
  type?: ExampleType;
  /** Complexity */
  complexity?: ExampleComplexity;
  /** Category */
  category?: ExampleCategory;
  /** Tags (match any) */
  tags?: string[];
  /** Only critical examples */
  critical?: boolean;
  /** Related to rule ID */
  related_rule?: string;
  /** Blade type */
  blade_type?: "list" | "details" | "all";
  /** Text search in title/description */
  text?: string;
}

/**
 * Example with content
 */
export interface Example extends ExampleMetadata {
  /** Markdown content */
  content: string;
  /** Parsed frontmatter */
  frontmatter?: Record<string, any>;
}

/**
 * Frontmatter in markdown files
 */
export interface ExampleFrontmatter {
  id?: string;
  component?: string;
  type?: ExampleType;
  complexity?: ExampleComplexity;
  category?: ExampleCategory;
  tags?: string[];
  critical?: boolean;
  related_rules?: string[];
  title?: string;
  description?: string;
}
