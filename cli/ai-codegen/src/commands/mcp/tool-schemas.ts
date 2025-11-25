/**
 * Tool Schemas Module
 * Zod schemas for all MCP tools
 */

import { z } from "zod";

// Component search schemas
export const searchComponentsSchema = z.object({
  query: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export const viewComponentsSchema = z.object({
  components: z.array(z.string()).min(1),
});

export const getComponentExamplesSchema = z.object({
  query: z.string(),
  component: z.string().optional(),
});

export const searchComponentsByIntentSchema = z.object({
  intent: z.string(),
  context: z.enum(["list", "details", "general"]).optional(),
});

export const getComponentCapabilitiesSchema = z.object({
  component: z.string(),
  capability: z.string().optional(),
  includeExamples: z.boolean().optional().default(true),
});

// Framework API schemas
export const searchFrameworkAPIsSchema = z.object({
  query: z.string().optional(),
  type: z.enum(["composable", "plugin", "utility", "service"]).optional(),
  category: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export const viewFrameworkAPIsSchema = z.object({
  apis: z.array(z.string()).min(1),
});

export const getFrameworkExamplesSchema = z.object({
  query: z.string(),
  api: z.string().optional(),
});

export const searchFrameworkByIntentSchema = z.object({
  intent: z.string(),
  context: z.enum(["list", "details", "general"]).optional(),
});

export const getFrameworkCapabilitiesSchema = z.object({
  api: z.string(),
  capability: z.string().optional(),
  includeExamples: z.boolean().optional().default(true),
});

// Generation schemas
export const getBladeTemplateSchema = z.object({
  type: z.enum(["list", "details"]),
  complexity: z.enum(["simple", "filters", "multiselect", "validation"]),
});

export const validateAndFixPlanSchema = z.object({
  plan: z.any(),
});

export const generateBladeSchema = z.object({
  type: z.enum(["list", "details"]),
  entity: z.string(),
  features: z.array(z.string()).optional(),
  columns: z.array(z.any()).optional(),
  fields: z.array(z.any()).optional(),
});

export const generateWithCompositionSchema = z.object({
  plan: z.any().optional().describe(
    "UI-Plan JSON. If not provided, will be taken from workflow state (after validate_ui_plan)."
  ),
  cwd: z.string(),
  dryRun: z.boolean().optional().default(false),
  strategy: z.literal("ai-full").optional().default("ai-full"),
  bladeId: z.string().optional().describe(
    "Generate instructions for a specific blade only. " +
    "Use this when full module generation exceeds MCP token limit (25000 tokens). " +
    "Generate one blade at a time, then repeat for remaining blades. " +
    "Example: 'offers-list' or 'offer-details'"
  ),
  // NEW: Pagination params for artifact-by-artifact generation
  artifactType: z.enum(["blade", "composable", "apiClient", "all"]).optional().describe(
    "Type of artifact to generate. Use 'blade' or 'composable' for step-by-step generation. " +
    "Default: 'all' for small modules (1-2 blades), 'blade' for larger modules."
  ),
  contextLevel: z.enum(["metadata", "essential", "full"]).optional().describe(
    "How much context to include in the generation guide. " +
    "METADATA: ~2KB - only IDs and descriptions (for overview). " +
    "ESSENTIAL: ~10KB - template + top 2 patterns (default for generation). " +
    "FULL: ~25KB+ - everything (may exceed limits)."
  ),
});

export const inferBladeLogicSchema = z.object({
  blade: z.any(),
  merge: z.boolean().optional().default(false),
});

export const getCompositionGuideSchema = z.object({
  type: z.enum(["list", "details"]),
  features: z.array(z.string()).optional(),
  complexity: z.enum(["simple", "moderate", "complex"]).optional(),
});

export const submitGeneratedCodeSchema = z.object({
  bladeId: z.string(),
  code: z.string(),
  cwd: z.string().optional(), // Optional: working directory (fallback to workflow state)
  composable: z
    .object({
      name: z.string(),
      code: z.string(),
    })
    .optional(),
  apiClient: z
    .object({
      name: z.string().describe("API client file name (e.g., 'offers.client.ts')"),
      code: z.string().describe("Complete API client TypeScript code"),
    })
    .optional()
    .describe("Optional: Module API client code (one per module, not per entity)"),
  context: z.object({
    module: z.string(),
    layout: z.enum(["grid", "details", "page"]),
    features: z.array(z.string()).optional(),
    guideId: z.string().optional(),
  }),
  retry: z
    .object({
      attempt: z.number(),
      previousErrors: z.array(z.string()).optional(),
    })
    .optional(),
});

export const validateUIPlanSchema = z.object({
  plan: z.any(),
});

export const analyzePromptV2Schema = z.object({
  prompt: z.string(),
  module: z.string().optional(),
});

/**
 * NEW: Schema for discover_components_and_apis tool
 * Mandatory step between analysis and UI-Plan creation
 */
export const discoverComponentsAndAPIsSchema = z.object({
  analysis: z.any().describe(
    "Prompt analysis V2 result from analyze_prompt_v2. " +
    "Used to extract entities, features, and workflows to discover relevant components and framework APIs."
  ),
});

export const createUIPlanFromAnalysisV2Schema = z.object({
  analysis: z.any(),
});

export const getAuditChecklistSchema = z.object({});

export const scaffoldAppSchema = z.object({
  projectName: z.string().regex(/^[a-z0-9-]+$/, "Project name must be in kebab-case"),
  targetDirectory: z.string().optional(),
});

// Type checking schema
export const checkTypesSchema = z.object({
  cwd: z.string().describe("Working directory (project root) to run vue-tsc"),
  fix: z.boolean().optional().default(false).describe("If true, attempt to auto-fix type errors"),
});

// Workflow orchestration schema
export const getWorkflowStatusSchema = z.object({});

export const resetWorkflowSchema = z.object({});

export const startModuleWorkflowSchema = z.object({
  prompt: z.string().describe("User's module request (e.g., 'Create vendor management module with list and details')"),
  cwd: z.string().describe("Project directory where module should be generated"),
  module: z.string().optional().describe("Module name override (if not provided, will be inferred from prompt)"),
});

// ============================================================================
// NEW TRANSPARENT TOOLS - Rules, Templates, Patterns
// ============================================================================

/**
 * Get applicable rules for a blade with full context
 * Replaces implicit rule embedding with explicit MCP tool call
 */
export const getApplicableRulesSchema = z.object({
  bladeType: z.enum(["list", "details"]).describe("Type of blade being generated"),
  isWorkspace: z.boolean().optional().describe("Whether this is a workspace blade (appears in sidebar menu)"),
  features: z.array(z.string()).optional().describe("Features to include (filters, multiselect, validation, etc.)"),
});

/**
 * Get best matching template with full .vue content
 * Returns production-ready Vue SFC template (different from old getBladeTemplate)
 */
export const getBestTemplateSchema = z.object({
  bladeType: z.enum(["list", "details"]).describe("Type of blade template needed"),
  features: z.array(z.string()).optional().describe("Features to match (filters, multiselect, gallery, validation, etc.)"),
  complexity: z.enum(["simple", "moderate", "complex"]).optional().describe("Desired complexity level"),
});

/**
 * Get relevant patterns for blade context
 * Returns architectural patterns and examples
 */
export const getRelevantPatternsSchema = z.object({
  bladeType: z.enum(["list", "details", "all"]).describe("Type of blade"),
  features: z.array(z.string()).optional().describe("Features to find patterns for"),
  isWorkspace: z.boolean().optional().describe("Whether this is a workspace blade"),
  patterns: z.array(z.string()).optional().describe("Specific pattern IDs to retrieve (workspace-blade, module-registration, etc.)"),
});

/**
 * Generate widget using create-vc-app
 * Creates a widget component for a specific blade
 */
export const generateWidgetSchema = z.object({
  cwd: z.string().describe("Project root directory (must be VC-Shell project)"),
  module: z.string().describe("Module name (e.g., 'offers', 'products')"),
  blade: z.string().describe("Blade name where widget will be used (e.g., 'offer-details', 'products-list')"),
  widgetName: z.string().describe("Widget name in PascalCase (e.g., 'SpecialPrices', 'Stats')"),
  entityName: z.string().optional().describe("Related entity name (e.g., 'Offer', 'Product')"),
  icon: z.string().optional().describe("Material icon name (default: 'material-list')"),
});
