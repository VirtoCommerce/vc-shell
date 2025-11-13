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
  mode: z.enum(["ai-first", "template", "auto"]).optional().default("auto").describe("Generation mode: ai-first (AI generates code), template (use templates+AST), auto (try AI, fallback to template)"),
});

export const validateAndFixPlanSchema = z.object({
  plan: z.record(z.unknown()).describe("UI-Plan JSON object to validate and fix"),
});

export const generateBladeSchema = z.object({
  type: z.enum(["list", "details"]).describe("Blade type to generate"),
  entity: z.string().describe("Entity name (singular, e.g., 'vendor', 'product')"),
  columns: z.array(z.object({
    key: z.string(),
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

// Type exports

export type SearchComponentsInput = z.infer<typeof searchComponentsSchema>;
export type ViewComponentsInput = z.infer<typeof viewComponentsSchema>;
export type GetComponentExamplesInput = z.infer<typeof getComponentExamplesSchema>;
export type ScaffoldAppInput = z.infer<typeof scaffoldAppSchema>;
export type ValidateUIPlanInput = z.infer<typeof validateUIPlanSchema>;

export type ViewCommandOptions = z.infer<typeof viewCommandOptionsSchema>;
export type SearchCommandOptions = z.infer<typeof searchCommandOptionsSchema>;
export type DiffCommandOptions = z.infer<typeof diffCommandOptionsSchema>;
export type McpInitOptions = z.infer<typeof mcpInitOptionsSchema>;
export type GenerateOptions = z.infer<typeof generateOptionsSchema>;
export type ValidateCommandOptions = z.infer<typeof validateCommandOptionsSchema>;

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

