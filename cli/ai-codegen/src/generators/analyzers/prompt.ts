/**
 * SmartPromptAnalyzer
 *
 * Professional prompt analyzer using Intelligence Layer.
 * ZERO HARDCODING - все через registries.
 */

import type { KnowledgeBase } from "../../knowledge";
import type { FeatureResolver } from "../../intelligence";
import type { PromptAnalysis, AnalysisSchema } from "../types";

export interface AnalyzerOptions {
  includeExamples?: boolean;
  verbose?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * SmartPromptAnalyzer
 *
 * Builds AI analysis prompts dynamically from registries.
 * NO hardcoded features, components, or actions.
 */
export class SmartPromptAnalyzer {
  constructor(
    private kb: KnowledgeBase,
    private featureResolver: FeatureResolver,
    private options: AnalyzerOptions = {},
  ) {}

  /**
   * Build comprehensive analysis prompt for AI
   *
   * Dynamically constructs prompt from:
   * - Available components (from ComponentRegistry)
   * - Available features (from FeatureRegistry)
   * - Available framework APIs (from FrameworkAPIRegistry)
   *
   * NO HARDCODING!
   */
  async buildAnalysisPrompt(userPrompt: string): Promise<string> {
    await this.kb.ensureLoaded();

    // Get ALL available options from registries
    const components = this.kb.components.getAll();
    const listFeatures = this.kb.features.getByCategory("list");
    const detailsFeatures = this.kb.features.getByCategory("details");
    const frameworkAPIs = this.kb.frameworkAPIs.getAll();

    const prompt = `# Task: Analyze UI Module Prompt

You are analyzing a user's request to generate a VC-Shell module. Extract entities, relationships, workflows, and blade requirements.

## User Prompt

"${userPrompt}"

## Available VC-Shell Components

${components.map((c) => `- **${c.component}**: ${c.description}`).join("\n")}

## Available Features

### List Blade Features:
${listFeatures.map((f) => `- **${f.id}**: ${f.description || f.name}`).join("\n")}

### Details Blade Features:
${detailsFeatures.map((f) => `- **${f.id}**: ${f.description || f.name}`).join("\n")}

## Available Framework APIs

${frameworkAPIs.map((api) => `- **${api.name}** (${api.type}): ${api.description}`).join("\n")}

## Your Task

Analyze the user prompt and return a JSON object with the following structure:

\`\`\`json
{
  "moduleName": "kebab-case-module-name",
  "description": "Brief module description",
  "entities": [
    {
      "name": "EntityName",
      "displayName": "Entity Display Name",
      "description": "What this entity represents",
      "properties": [
        { "name": "propertyName", "type": "string|number|boolean|date", "required": true }
      ],
      "blades": [
        {
          "type": "list|details",
          "route": "/route-path",
          "isWorkspace": true|false,
          "features": ["feature-id-from-above"]
        }
      ]
    }
  ]
}
\`\`\`

## Guidelines

1. **Module Name**: Infer from context, use kebab-case
2. **Entities**: Identify main entities (e.g., "Offer", "Vendor", "Product")
3. **Properties**: Extract properties mentioned or implied
4. **Blades**: For each entity:
   - **list blade**: Shows all items (table/grid)
   - **details blade**: Shows/edits single item (form)
5. **Features**: ONLY use feature IDs from the "Available Features" lists above
6. **isWorkspace**: true if this blade should appear in main menu
7. **Routes**: Use RESTful conventions (/vendors, /vendor)

## Important

- ✅ Use ONLY feature IDs listed above
- ✅ Infer reasonable properties if not specified
- ✅ Create both list and details blades by default
- ❌ DO NOT invent feature IDs not in the lists
- ❌ DO NOT hardcode component types (we'll resolve them later)

Return ONLY the JSON object, no additional text.
`;

    return prompt;
  }

  /**
   * Get JSON schema for analysis validation
   */
  getAnalysisSchema(): AnalysisSchema {
    return {
      type: "object",
      properties: {
        moduleName: { type: "string", pattern: "^[a-z0-9-]+$" },
        description: { type: "string" },
        entities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              displayName: { type: "string" },
              description: { type: "string" },
              properties: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    type: { type: "string" },
                    required: { type: "boolean" },
                  },
                  required: ["name", "type"],
                },
              },
              blades: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["list", "details"] },
                    route: { type: "string" },
                    isWorkspace: { type: "boolean" },
                    features: { type: "array", items: { type: "string" } },
                  },
                  required: ["type", "route"],
                },
              },
            },
            required: ["name", "blades"],
          },
        },
      },
      required: ["moduleName", "entities"],
    };
  }

  /**
   * Validate analysis result
   *
   * Uses FeatureResolver to validate feature IDs dynamically.
   */
  async validateAnalysis(analysis: PromptAnalysis): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate module name
    if (!analysis.moduleName || !/^[a-z0-9-]+$/.test(analysis.moduleName)) {
      errors.push("Invalid moduleName: must be kebab-case");
    }

    // Validate entities
    if (!analysis.entities || analysis.entities.length === 0) {
      errors.push("No entities found");
    }

    // Validate features using FeatureResolver (NOT hardcoded!)
    for (const entity of analysis.entities || []) {
      for (const blade of entity.blades || []) {
        if (blade.features && blade.features.length > 0) {
          const validation = await this.featureResolver.validate(blade.features);

          if (validation.invalid.length > 0) {
            warnings.push(
              `Entity "${entity.name}" blade "${blade.type}" has invalid features: ${validation.invalid.join(", ")}`,
            );
          }

          if (validation.warnings.length > 0) {
            warnings.push(...validation.warnings.map(w => `Entity "${entity.name}": ${w}`));
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
