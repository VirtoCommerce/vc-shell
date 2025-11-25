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
        { "name": "propertyName", "type": "string|number|boolean|date|array", "required": true }
      ],
      "blades": [
        {
          "type": "list",
          "route": "/entities",
          "isWorkspace": true,
          "features": ["feature-id-from-above"],
          "columns": [
            {
              "id": "propertyName",
              "title": "Display Title",
              "type": "text|number|date|date-ago|image|status-icon|link",
              "sortable": true
            }
          ]
        },
        {
          "type": "details",
          "route": "/entity",
          "isWorkspace": false,
          "features": ["feature-id-from-above"],
          "fields": [
            {
              "id": "propertyName",
              "label": "Field Label",
              "component": "VcInput|VcTextarea|VcSelect|VcCheckbox|VcSwitch|VcGallery|VcEditor",
              "required": true,
              "rules": "required|min:3"
            }
          ],
          "sections": [
            {
              "id": "section-id",
              "title": "Section Title",
              "fields": ["field1", "field2"]
            }
          ]
        }
      ]
    }
  ]
}
\`\`\`

### IMPORTANT: Routes in VC-Shell
- Routes are for workspace blades ONLY (menu items)
- Details blades do NOT have routes with :id params
- Navigation to details is via openBlade() with params object
- Example: list blade has route "/offers", details blade has route "/offer" (no :id!)

### Column Types (for list blades):
- **text**: Regular text display
- **number**: Numeric value
- **date**: Full date/time
- **date-ago**: Relative time ("2 hours ago")
- **image**: Image thumbnail (use for imgSrc, thumbnail, image properties)
- **status-icon**: Boolean as icon (checkmark/cross)
- **link**: Clickable link

### Field Components (for details blades):
Use REAL component names from VC-Shell:
- **VcInput**: Text input (also for dates with type="date")
- **VcTextarea**: Multi-line text
- **VcSelect**: Dropdown select with search
- **VcCheckbox**: Checkbox for boolean
- **VcSwitch**: Toggle switch for boolean
- **VcRadioButton**: Radio button group
- **VcMultivalue**: Tags/multiple values input
- **VcInputCurrency**: Currency input with formatting
- **VcEditor**: Rich text/markdown editor
- **VcGallery**: Image gallery with upload
- **VcFileUpload**: File upload

### Grouping Fields:
- **VcCard**: Use to group related fields into sections with title
- Fields inside VcCard need padding: add tw-p-4 class

## Guidelines

1. **Module Name**: Infer from context, use kebab-case
2. **Entities**: Identify main entities (e.g., "Offer", "Vendor", "Product")
3. **Properties**: Extract ALL properties mentioned or implied
4. **Blades** (VC-Shell "pages"):
   - A blade is a page. Multiple blades can be visible at once (master/detail).
   - **list blade**: Shows all items (table/grid)
   - **details blade**: Shows/edits single item (form)
5. **Navigation & Workspace**:
   - **isWorkspace: true** = blade is registered in sidebar menu
   - Any blade type (list OR details) can be a workspace blade
   - Typically: list blade is workspace, details opens from list
   - But: if module has only details blade, or user specifies - details can be workspace too
   - Routes are simple paths: /offers, /settings - NO :id parameters ever!
6. **Features**: ONLY use feature IDs from the "Available Features" lists above
7. **Routes**: Simple kebab-case paths. NEVER use URL parameters like :id
8. **Defaults**: Create both list and details blades by default
9. **Columns (CRITICAL for list blades)**:
   - If user specifies which columns to show - use ONLY those columns
   - If not specified - pick 5-7 most important columns (not all properties!)
   - Always include: image (if exists), name/title, status, date
   - Use appropriate column types (image for images, status-icon for booleans)
10. **Fields (for details blades)**:
    - Include ALL editable properties
    - Group into logical sections if many fields
    - Use appropriate field types based on property type
11. **Do not invent** feature IDs not in the lists

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
                    // Columns for list blades - user-specified or smart selection
                    columns: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          title: { type: "string" },
                          type: { type: "string", enum: ["text", "number", "date", "date-ago", "image", "status-icon", "link"] },
                          sortable: { type: "boolean" },
                          width: { type: "number" },
                        },
                        required: ["id", "title"],
                      },
                    },
                    // Fields for details blades with real component names
                    fields: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          label: { type: "string" },
                          component: {
                            type: "string",
                            enum: [
                              "VcInput", "VcTextarea", "VcSelect", "VcCheckbox",
                              "VcSwitch", "VcRadioButton", "VcMultivalue",
                              "VcInputCurrency", "VcEditor", "VcGallery", "VcFileUpload"
                            ],
                          },
                          required: { type: "boolean" },
                          rules: { type: "string" },
                        },
                        required: ["id", "label", "component"],
                      },
                    },
                    // Sections for grouping fields in VcCard
                    sections: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          title: { type: "string" },
                          fields: { type: "array", items: { type: "string" } },
                        },
                        required: ["id", "title", "fields"],
                      },
                    },
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
