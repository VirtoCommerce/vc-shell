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

export const generateCompleteModuleSchema = z.object({
  plan: z.any(),
  cwd: z.string(),
  dryRun: z.boolean().optional().default(false),
  mode: z.literal("ai-full").optional().default("ai-full"),
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
  plan: z.any(),
  cwd: z.string(),
  dryRun: z.boolean().optional().default(false),
  strategy: z.literal("ai-full").optional().default("ai-full"),
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
  composable: z
    .object({
      name: z.string(),
      code: z.string(),
    })
    .optional(),
  context: z.object({
    module: z.string(),
    layout: z.enum(["grid", "details", "page"]),
    strategy: z.literal("AI_FULL"),
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

export const createUIPlanFromAnalysisV2Schema = z.object({
  analysis: z.any(),
});

export const getAuditChecklistSchema = z.object({});

export const scaffoldAppSchema = z.object({
  projectName: z.string().regex(/^[a-z0-9-]+$/, "Project name must be in kebab-case"),
  targetDirectory: z.string().optional(),
});
