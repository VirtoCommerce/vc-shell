import type { NamingConfig } from "../core/code-generator";
import type { Column, Field } from "../core/template-adapter";
import type { Blade } from "../core/validator";
import type { BladeLogic, ComposableDefinition } from "./logic";

/**
 * Universal blade generation context used across all generators.
 * This is the SINGLE source of truth for BladeGenerationContext type.
 *
 * Used by:
 * - UnifiedCodeGenerator (template-based generation)
 * - SmartCodeGenerator (strategy decision)
 * - AIGenerationGuideBuilder (AI-guided generation)
 * - BladeComposer (composition strategy)
 *
 * IMPORTANT: All fields marked as required MUST be provided.
 * Optional fields can be omitted depending on generation strategy.
 */
export interface BladeGenerationContext {
  // ============================================
  // CORE REQUIRED FIELDS
  // ============================================

  /**
   * Blade type: list, details, or page (mapped to details generation)
   */
  type: "list" | "details" | "page";

  /**
   * Entity name in singular kebab-case
   * Examples: "vendor", "offer", "product"
   * Used in task descriptions and file names
   */
  entity: string;

  /**
   * Module name in kebab-case (usually plural of entity)
   * Examples: "vendors", "offers", "products"
   * Used for module registration and routing
   */
  module: string;

  /**
   * Blade definition from UI-Plan
   */
  blade: Blade;

  /**
   * Naming conventions for all generated code
   */
  naming: NamingConfig;

  /**
   * List of enabled features
   * Examples: ["filters", "multiselect", "validation", "gallery"]
   */
  features: string[];

  // ============================================
  // COMPONENT GENERATION FIELDS
  // ============================================

  /**
   * Component class name in PascalCase
   * Example: "VendorsList", "OfferDetails"
   */
  componentName: string;

  /**
   * Composable function name in camelCase
   * Example: "useVendorList", "useOfferDetails"
   */
  composableName: string;

  /**
   * Route path for this blade
   * Example: "/vendors", "/offers/:id?"
   */
  route: string;

  /**
   * i18n key for menu title
   * Example: "VENDORS.MENU_TITLE"
   */
  menuTitleKey: string;

  // ============================================
  // DATA STRUCTURE FIELDS (optional)
  // ============================================

  /**
   * Table columns for list blades
   */
  columns?: Column[];

  /**
   * Form fields for details blades
   */
  fields?: Field[];

  // ============================================
  // BLADE LOGIC & BEHAVIOR (optional)
  // ============================================

  /**
   * Blade logic definition (handlers, toolbar, state)
   * Can be provided by user or inferred automatically
   */
  logic?: BladeLogic;

  /**
   * Composable definition with mock data and API calls
   */
  composableDefinition?: ComposableDefinition;

  /**
   * Whether this is a workspace blade (full-screen)
   */
  isWorkspace?: boolean;

  // ============================================
  // STRATEGY DECISION FIELDS
  // ============================================

  /**
   * Complexity score for strategy decision
   * 0-3: simple (template)
   * 4-7: moderate (composition)
   * 8+: complex (AI-guided)
   *
   * Calculated by SmartCodeGenerator.calculateComplexity()
   */
  complexity: number;

  // ============================================
  // FILE PATH FIELDS (optional, for unified-generator)
  // ============================================

  /**
   * Blade component file name
   * Example: "vendors-list.vue"
   */
  fileName?: string;

  /**
   * Full path to blade component file
   */
  filePath?: string;

  /**
   * Composable file name
   * Example: "useVendorList.ts"
   */
  composableFileName?: string;

  /**
   * Full path to composable file
   */
  composablePath?: string;

  /**
   * Whether this blade requires StatusBadge component
   */
  requiresStatusBadge?: boolean;
}
