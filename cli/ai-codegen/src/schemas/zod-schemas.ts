import { z } from "zod";

// MCP Tool Schemas

export const searchComponentsSchema = z.object({
  query: z.string().optional().describe("Search query for fuzzy matching"),
  limit: z.number().optional().describe("Maximum number of results to return"),
  offset: z.number().optional().describe("Number of results to skip for pagination"),
});

export const viewComponentsSchema = z.object({
  components: z
    .array(z.string())
    .min(1)
    .describe("Array of component names to view"),
});

export const getComponentExamplesSchema = z.object({
  query: z.string().describe("Search query for examples (e.g., 'VcTable-demo')"),
  component: z
    .string()
    .optional()
    .describe("Optional component name to filter examples"),
});

export const scaffoldAppSchema = z.object({
  projectName: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Project name must be kebab-case")
    .describe("Name of the project in kebab-case"),
  targetDirectory: z
    .string()
    .optional()
    .describe("Directory where to create the project"),
});

export const validateUIPlanSchema = z.object({
  plan: z.record(z.unknown()).describe("UI-Plan JSON object to validate"),
});

export const getBladeTemplateSchema = z.object({
  type: z.enum(["list", "details"]).describe("Type of blade template to retrieve"),
  complexity: z
    .enum(["simple", "filters", "multiselect", "validation"])
    .describe("Complexity level: simple (basic CRUD), filters (with filters slot), multiselect (bulk actions), validation (async validation)"),
});

export const generateCompleteModuleSchema = z.object({
  plan: z.record(z.unknown()).describe("UI-Plan JSON object to generate from"),
  cwd: z.string().describe("Working directory (project root)"),
  dryRun: z.boolean().optional().describe("If true, shows what would be generated without writing files"),
  mode: z.literal("ai-full").optional().default("ai-full").describe("Generation mode: ai-full (LLM produces code; templates/composition removed)"),
});

export const validateAndFixPlanSchema = z.object({
  plan: z.record(z.unknown()).describe("UI-Plan JSON object to validate and fix"),
});

export const generateBladeSchema = z.object({
  type: z.enum(["list", "details"]).describe("Blade type to generate"),
  entity: z.string().describe("Entity name (singular, e.g., 'vendor', 'product')"),
  columns: z.array(z.object({
    id: z.string(),
    title: z.string(),
    type: z.string().optional(),
    sortable: z.boolean().optional(),
  })).optional().describe("Column definitions for list blades"),
  fields: z.array(z.object({
    key: z.string(),
    as: z.string(),
    label: z.string(),
    type: z.string().optional(),
    required: z.boolean().optional(),
    validation: z.string().optional(),
  })).optional().describe("Field definitions for details blades"),
  features: z.array(z.string()).optional().describe("Additional features: filters, multiselect, validation, gallery"),
});

// CLI Command Schemas

export const viewCommandOptionsSchema = z.object({
  components: z.array(z.string()).min(1),
  cwd: z.string(),
});

export const searchCommandOptionsSchema = z.object({
  query: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  cwd: z.string(),
});

export const diffCommandOptionsSchema = z.object({
  component: z.string().optional(),
  cwd: z.string(),
  yes: z.boolean().optional(),
});

export const mcpInitOptionsSchema = z.object({
  client: z.enum(["cursor", "vscode", "claude", "codex"]),
  cwd: z.string(),
});

export const generateOptionsSchema = z.object({
  plan: z.string(),
  cwd: z.string(),
  dryRun: z.boolean().optional(),
  fix: z.boolean().optional(),
  story: z.boolean().optional(),
  test: z.boolean().optional(),
  verbose: z.boolean().optional(),
});

export const validateCommandOptionsSchema = z.object({
  plan: z.string(),
  cwd: z.string(),
});

// Component Registry Schema

const componentCapabilitySchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  requiredProps: z.array(z.string()).optional(),
  useCases: z.array(z.string()).optional(),
  complexity: z.string().optional(),
});

const componentTemplateSchema = z.object({
  id: z.string(),
  file: z.string(),
  complexity: z.string().optional(),
  lines: z.number().optional(),
  features: z.array(z.string()).optional(),
  description: z.string().optional(),
  requiredComponents: z.array(z.string()).optional(),
});

const slotComponentSchema = z.object({
  name: z.string(),
  file: z.string(),
  description: z.string().optional(),
  usage: z.string().optional(),
  props: z.record(z.string()).optional(),
  events: z.record(z.string()).optional(),
  example: z.string().optional(),
});

export const componentSchema = z.object({
  import: z.string(),
  component: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(["UI", "Form", "Layout", "Data"]).optional(),
  props: z.record(z.string()).optional(),
  events: z.record(z.string()).optional(),
  slots: z.record(z.string()).optional(),
  examples: z
    .array(
      z.object({
        title: z.string(),
        code: z.string(),
      })
    )
    .optional(),
  dependencies: z.array(z.string()).optional(),
  demos: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  constraints: z.record(z.unknown()).optional(),
  capabilities: z.record(componentCapabilitySchema).optional(),
  templates: z.array(componentTemplateSchema).optional(),
  components: z.array(slotComponentSchema).optional(),
});

export const componentRegistrySchema = z.record(componentSchema);

// UI-Plan Schema (Zod version - complementary to JSON Schema)

export const uiPlanBladeSchema = z.object({
  id: z.string(),
  route: z.string(),
  layout: z.enum(["grid", "details", "page"]),
  title: z.string(),
  isWorkspace: z.boolean().optional(),
  components: z.array(
    z.object({
      type: z.string(),
      model: z.string().optional(),
      dataSource: z.string().optional(),
      fields: z.array(z.unknown()).optional(),
      columns: z.array(z.unknown()).optional(),
      actions: z.array(z.string()).optional(),
    })
  ),
  permissions: z.array(z.string()).optional(),
  features: z.array(z.enum(["filters", "multiselect", "validation", "gallery", "widgets"])).optional(),
  customSlots: z.array(z.object({
    name: z.string(),
    component: z.string().optional(),
    props: z.record(z.unknown()).optional(),
  })).optional(),
  logic: z.object({
    handlers: z.record(z.string()).optional(),
    toolbar: z.array(z.object({
      id: z.string(),
      icon: z.string().optional(),
      action: z.string(),
    })).optional(),
    state: z.record(z.object({
      source: z.enum(["composable", "local", "prop"]),
      reactive: z.boolean(),
      default: z.unknown().optional(),
    })).optional(),
  }).optional(),
  composable: z.object({
    name: z.string().optional(),
    methods: z.array(z.string()).optional(),
    mockData: z.boolean().optional().default(true),
  }).optional(),
});

export const uiPlanSchema = z.object({
  $schema: z.string().optional(),
  module: z.string(),
  blades: z.array(uiPlanBladeSchema),
  data: z
    .object({
      sources: z.record(z.unknown()).optional(),
    })
    .optional(),
});

// Search Result Schema

export const searchResultItemSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  score: z.number().optional(),
});

export const searchResultSchema = z.object({
  items: z.array(searchResultItemSchema),
  total: z.number(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

// Diff Result Schema

export const diffChangeSchema = z.object({
  type: z.enum(["added", "removed", "modified"]),
  line: z.number(),
  content: z.string(),
});

export const diffResultSchema = z.object({
  component: z.string(),
  hasChanges: z.boolean(),
  changes: z.array(diffChangeSchema).optional(),
});

// Framework API Registry Schema

export const frameworkMethodParamSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
  required: z.boolean(),
  default: z.unknown().optional(),
});

export const frameworkMethodSchema = z.object({
  name: z.string(),
  description: z.string(),
  signature: z.string(),
  params: z.array(frameworkMethodParamSchema),
  returns: z.string(),
  useCases: z.array(z.string()).optional(),
});

export const frameworkStateSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
  reactive: z.boolean(),
  default: z.unknown().optional(),
});

export const frameworkCapabilitySchema = z.object({
  id: z.string(),
  type: z.enum(["method", "state", "feature"]),
  name: z.string(),
  description: z.string(),
  useCases: z.array(z.string()),
  complexity: z.enum(["simple", "medium", "advanced"]),
});

export const frameworkExampleSchema = z.object({
  title: z.string(),
  code: z.string(),
  method: z.string().optional(),
  description: z.string().optional(),
});

export const frameworkAPISchema = z.object({
  name: z.string(),
  import: z.string(),
  type: z.enum(["composable", "plugin", "utility", "service"]),
  description: z.string(),
  category: z.string(),
  keywords: z.array(z.string()),
  methods: z.array(frameworkMethodSchema).optional(),
  state: z.array(frameworkStateSchema).optional(),
  capabilities: z.record(frameworkCapabilitySchema).optional(),
  examples: z.array(frameworkExampleSchema).optional(),
  dependencies: z.array(z.string()).optional(),
  relatedAPIs: z.array(z.string()).optional(),
  requiresPlugin: z.string().optional(),
  requiresContext: z.boolean().optional(),
});

export const frameworkRegistrySchema = z.object({
  composables: z.record(frameworkAPISchema),
  plugins: z.record(frameworkAPISchema),
  utilities: z.record(frameworkAPISchema),
  services: z.record(frameworkAPISchema),
});

// MCP Tool Schemas for Framework APIs

export const searchFrameworkAPIsSchema = z.object({
  query: z.string().optional().describe("Search query for fuzzy matching"),
  category: z.string().optional().describe("Filter by category (Navigation, Data, UI, Utility)"),
  type: z.enum(["composable", "plugin", "utility", "service"]).optional().describe("Filter by API type"),
  limit: z.number().optional().describe("Maximum number of results to return"),
  offset: z.number().optional().describe("Number of results to skip for pagination"),
});

export const viewFrameworkAPIsSchema = z.object({
  apis: z
    .array(z.string())
    .min(1)
    .describe("Array of framework API names to view (e.g., ['useBladeNavigation', 'useApiClient'])"),
});

export const searchFrameworkByIntentSchema = z.object({
  intent: z.string().describe("Natural language description of what you need (e.g., 'I need to close a blade after saving')"),
  context: z.enum(["list", "details", "general"]).optional().describe("Optional context to narrow search"),
});

export const getFrameworkCapabilitiesSchema = z.object({
  api: z.string().describe("Framework API name (e.g., 'useBladeNavigation')"),
  capability: z.string().optional().describe("Optional specific capability ID to filter"),
  includeExamples: z.boolean().optional().default(true).describe("Include code examples"),
});

export const getFrameworkExamplesSchema = z.object({
  query: z.string().describe("Search query for examples (e.g., 'blade navigation', 'close blade')"),
  api: z.string().optional().describe("Optional API name to filter examples"),
});

// Type exports

export type SearchComponentsInput = z.infer<typeof searchComponentsSchema>;
export type ViewComponentsInput = z.infer<typeof viewComponentsSchema>;
export type GetComponentExamplesInput = z.infer<typeof getComponentExamplesSchema>;
export type ScaffoldAppInput = z.infer<typeof scaffoldAppSchema>;
export type ValidateUIPlanInput = z.infer<typeof validateUIPlanSchema>;

export type ViewCommandOptions = z.infer<typeof viewCommandOptionsSchema>;

// Framework API Type exports

export type FrameworkMethodParam = z.infer<typeof frameworkMethodParamSchema>;
export type FrameworkMethod = z.infer<typeof frameworkMethodSchema>;
export type FrameworkState = z.infer<typeof frameworkStateSchema>;
export type FrameworkCapability = z.infer<typeof frameworkCapabilitySchema>;
export type FrameworkExample = z.infer<typeof frameworkExampleSchema>;
export type FrameworkAPI = z.infer<typeof frameworkAPISchema>;
export type FrameworkRegistry = z.infer<typeof frameworkRegistrySchema>;

export type SearchFrameworkAPIsInput = z.infer<typeof searchFrameworkAPIsSchema>;
export type ViewFrameworkAPIsInput = z.infer<typeof viewFrameworkAPIsSchema>;
export type SearchFrameworkByIntentInput = z.infer<typeof searchFrameworkByIntentSchema>;
export type GetFrameworkCapabilitiesInput = z.infer<typeof getFrameworkCapabilitiesSchema>;
export type GetFrameworkExamplesInput = z.infer<typeof getFrameworkExamplesSchema>;
export type SearchCommandOptions = z.infer<typeof searchCommandOptionsSchema>;
export type DiffCommandOptions = z.infer<typeof diffCommandOptionsSchema>;
export type McpInitOptions = z.infer<typeof mcpInitOptionsSchema>;
export type GenerateOptions = z.infer<typeof generateOptionsSchema>;
export type ValidateCommandOptions = z.infer<typeof validateCommandOptionsSchema>;

export type ComponentCapability = z.infer<typeof componentCapabilitySchema>;
export type ComponentTemplate = z.infer<typeof componentTemplateSchema>;
export type SlotComponent = z.infer<typeof slotComponentSchema>;
export type Component = z.infer<typeof componentSchema>;
export type ComponentRegistry = z.infer<typeof componentRegistrySchema>;
export type UIPlan = z.infer<typeof uiPlanSchema>;
export type UIPlanBlade = z.infer<typeof uiPlanBladeSchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;
export type SearchResultItem = z.infer<typeof searchResultItemSchema>;
export type DiffResult = z.infer<typeof diffResultSchema>;
export type DiffChange = z.infer<typeof diffChangeSchema>;
export type GetBladeTemplateInput = z.infer<typeof getBladeTemplateSchema>;
export type GenerateCompleteModuleInput = z.infer<typeof generateCompleteModuleSchema>;
export type ValidateAndFixPlanInput = z.infer<typeof validateAndFixPlanSchema>;
export type GenerateBladeInput = z.infer<typeof generateBladeSchema>;

// Component Capabilities MCP Tools Schemas

export const searchComponentsByIntentSchema = z.object({
  intent: z.string().describe("Natural language description of what you need (e.g., 'I need filtering', 'show images', 'bulk delete')"),
  context: z.enum(["list", "details", "general"]).optional().describe("Optional context to narrow search"),
});

export const getComponentCapabilitiesSchema = z.object({
  component: z.string().describe("Component name (e.g., 'VcTable')"),
  capability: z.string().optional().describe("Optional filter for specific capability ID"),
  includeExamples: z.boolean().optional().default(true).describe("Include code examples"),
});

export type SearchComponentsByIntentInput = z.infer<typeof searchComponentsByIntentSchema>;
export type GetComponentCapabilitiesInput = z.infer<typeof getComponentCapabilitiesSchema>;

// New AI-First Generation Schemas

export const generateWithCompositionSchema = z.object({
  plan: z.record(z.unknown()).describe("UI-Plan JSON object to generate from"),
  cwd: z.string().describe("Working directory (project root)"),
  strategy: z.literal("ai-full").optional().default("ai-full").describe("Generation strategy: ai-full only (templates/composition removed)"),
  dryRun: z.boolean().optional().describe("If true, shows what would be generated without writing files"),
  bladeId: z.string().optional().describe("Optional: Generate guide for specific blade only (e.g., 'offers-list'). Reduces response size for large modules."),
});

export const inferBladeLogicSchema = z.object({
  blade: z.object({
    id: z.string(),
    layout: z.enum(["grid", "details", "page"]),
    features: z.array(z.string()).optional(),
    components: z.array(z.unknown()).optional(),
  }).describe("Blade definition to infer logic from"),
  merge: z.boolean().optional().default(false).describe("If true, merges with existing blade.logic (if provided)"),
});

export const getCompositionGuideSchema = z.object({
  type: z.enum(["list", "details"]).describe("Blade type"),
  features: z.array(z.string()).optional().describe("Features to include (filters, multiselect, validation, gallery, widgets)"),
  complexity: z.enum(["simple", "moderate", "complex"]).optional().describe("Optional complexity hint"),
});

export type GenerateWithCompositionInput = z.infer<typeof generateWithCompositionSchema>;
export type InferBladeLogicInput = z.infer<typeof inferBladeLogicSchema>;
export type GetCompositionGuideInput = z.infer<typeof getCompositionGuideSchema>;

// Submit Generated Code Schema (Priority 1: LLM Integration)

export const submitGeneratedCodeSchema = z.object({
  bladeId: z.string().describe("ID of the blade this code is for (e.g., 'products-list', 'vendor-details')"),
  code: z.string().describe("Complete Vue SFC code generated by AI (must include <template>, <script>, and optionally <style>)"),
  context: z.object({
    module: z.string().describe("Module name (e.g., 'products', 'vendors')"),
    layout: z.enum(["grid", "details", "page"]).describe("Blade layout type"),
    features: z.array(z.string()).optional().describe("Features used in the blade (filters, multiselect, validation, gallery, widgets)"),
    strategy: z.literal("AI_FULL").describe("Generation strategy used (AI_FULL only)"),
    guideId: z.string().optional().describe("Optional: ID of the generation guide that was followed"),
  }).describe("Context about the generated code"),
  composable: z.object({
    name: z.string().describe("Composable name (e.g., 'useProductList', 'useVendorDetails')"),
    code: z.string().describe("Complete TypeScript code for the composable"),
  }).optional().describe("Optional: Composable code if generated separately"),
  retry: z.object({
    attempt: z.number().describe("Retry attempt number (1-based)"),
    previousErrors: z.array(z.string()).optional().describe("Errors from previous attempt"),
  }).optional().describe("Optional: Retry information if this is a correction attempt"),
});

export type SubmitGeneratedCodeInput = z.infer<typeof submitGeneratedCodeSchema>;

/**
 * Schema for analyze_prompt_v2 tool (Extended)
 * Returns instructions for AI to perform deep analysis
 */
export const analyzePromptV2Schema = z.object({
  prompt: z.string().describe("User's natural language prompt (any language, any complexity)"),
  module: z.string().optional().describe("Optional: Override module name (kebab-case)"),
});

export type AnalyzePromptV2Input = z.infer<typeof analyzePromptV2Schema>;

/**
 * Schema for create_ui_plan_from_analysis_v2 tool
 * Creates UI-Plan from V2 extended analysis
 */
export const createUIPlanFromAnalysisV2Schema = z.object({
  analysis: z.object({
    moduleName: z.string().describe("Primary module name (kebab-case)"),
    entities: z.array(z.object({
      name: z.string().describe("Entity name (plural, kebab-case)"),
      singular: z.string().describe("Entity name (singular, kebab-case)"),
      blades: z.array(z.object({
        type: z.enum(["list", "details", "dashboard", "wizard", "custom"]).describe("Blade type"),
        route: z.string().optional().describe("Custom route (e.g., /vendors/pending)"),
        features: z.array(z.string()).describe("Features for this blade"),
        columns: z.array(z.object({
          id: z.string(),
          title: z.string(),
          type: z.string().optional(),
          sortable: z.boolean().optional(),
          width: z.string().optional(),
          align: z.enum(["left", "center", "right"]).optional(),
        })).optional().describe("Columns for list blades"),
        fields: z.array(z.object({
          key: z.string(),
          label: z.string(),
          as: z.string(),
          required: z.boolean().optional(),
          type: z.string().optional(),
          placeholder: z.string().optional(),
          options: z.array(z.string()).optional(),
          validation: z.string().optional(),
        })).optional().describe("Fields for details/form blades"),
        actions: z.array(z.object({
          id: z.string(),
          label: z.string(),
          icon: z.string().optional(),
          type: z.enum(["primary", "secondary", "danger"]),
          condition: z.string().optional(),
        })).optional().describe("Custom actions"),
        permissions: z.array(z.string()).optional().describe("Required permissions"),
        isWorkspace: z.boolean().optional(),
      })).describe("Blades for this entity"),
      dataSource: z.object({
        type: z.enum(["api", "graphql", "static", "computed"]),
        endpoint: z.string().optional(),
        query: z.string().optional(),
        transform: z.string().optional(),
      }).optional().describe("Data source configuration"),
      relationships: z.array(z.object({
        type: z.enum(["hasMany", "belongsTo", "manyToMany"]),
        entity: z.string(),
        foreignKey: z.string().optional(),
        displayIn: z.enum(["list", "details", "both"]).optional(),
      })).optional().describe("Relationships to other entities"),
    })).describe("All detected entities"),
    workflow: z.object({
      type: z.enum(["linear", "branching", "parallel"]),
      steps: z.array(z.object({
        id: z.string(),
        title: z.string(),
        bladeId: z.string(),
        nextStep: z.union([z.string(), z.array(z.string())]).optional(),
        condition: z.string().optional(),
      })),
    }).optional().describe("Workflow definition"),
    globalFeatures: z.array(z.object({
      name: z.string(),
      config: z.record(z.any()).optional(),
    })).optional().describe("Global features"),
    businessRules: z.array(z.object({
      type: z.enum(["validation", "workflow", "permission", "calculation"]),
      description: z.string(),
      appliesTo: z.string().optional(),
    })).optional().describe("Business rules"),
    integrations: z.array(z.object({
      service: z.string(),
      purpose: z.string(),
      entities: z.array(z.string()).optional(),
    })).optional().describe("External integrations"),
    confidence: z.number().min(0).max(1).describe("Confidence score"),
    complexity: z.enum(["simple", "moderate", "complex"]).describe("Detected complexity"),
    requiresCustomCode: z.boolean().optional(),
    notes: z.array(z.string()).optional(),
  }).describe("Extended V2 analysis from AI"),
});

export type CreateUIPlanFromAnalysisV2Input = z.infer<typeof createUIPlanFromAnalysisV2Schema>;
