#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Validator } from "../core/validator.js";
import { SearchEngine } from "../core/search-engine.js";
import {
  searchComponentsSchema,
  viewComponentsSchema,
  getComponentExamplesSchema,
  scaffoldAppSchema,
  validateUIPlanSchema,
  getBladeTemplateSchema,
  type Component,
} from "../schemas/zod-schemas.js";
import {
  formatComponentList,
  formatMultipleComponentDetails,
  formatSearchResults,
  formatComponentExamples,
  formatMcpError,
} from "../utils/formatters.js";
import { generateMinimalAuditChecklist } from "../utils/audit-checklist.js";
import { componentNotFoundError, mcpError } from "../utils/errors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MCP Server for VC-Shell AI Code Generation
 * Provides tools and resources for Cursor/Claude to generate UI-Plans and Vue code
 */
export async function mcpServerCommand() {
  const server = new Server(
    {
      name: "vcshell-codegen",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // Get paths to schemas and examples
  const schemasPath = __dirname.includes("/dist")
    ? path.join(__dirname, "schemas")
    : path.join(__dirname, "..", "schemas");

  const examplesPath = __dirname.includes("/dist")
    ? path.join(__dirname, "examples")
    : path.join(__dirname, "..", "examples");

  // Load component registry once
  const registryPath = path.join(schemasPath, "component-registry.json");
  const registry: Record<string, Component> = JSON.parse(
    fs.readFileSync(registryPath, "utf-8")
  );

  // Initialize search engine
  const searchEngine = new SearchEngine(registry);

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "validate_ui_plan",
          description:
            "Validate a UI-Plan JSON against the VC-Shell schema and component registry",
          inputSchema: zodToJsonSchema(validateUIPlanSchema),
        },
        {
          name: "search_components",
          description:
            "Search for VC-Shell components with optional fuzzy matching. Supports pagination and filtering by category. Replaces get_component_list with more powerful search capabilities.",
          inputSchema: zodToJsonSchema(searchComponentsSchema),
        },
        {
          name: "view_components",
          description:
            "Get detailed information about one or more components including props, events, slots, examples, and dependencies",
          inputSchema: zodToJsonSchema(viewComponentsSchema),
        },
        {
          name: "get_component_examples",
          description:
            "Search for component examples and demos. Returns full code examples from demo files.",
          inputSchema: zodToJsonSchema(getComponentExamplesSchema),
        },
        {
          name: "get_audit_checklist",
          description:
            "Get a comprehensive audit checklist for verifying generated code. Use this after code generation to ensure quality.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "scaffold_app",
          description:
            "Create a new VC-Shell application from scratch using create-vc-app. This initializes a complete project structure with TypeScript, Vue 3, and all necessary dependencies.",
          inputSchema: zodToJsonSchema(scaffoldAppSchema),
        },
        {
          name: "get_blade_template",
          description:
            "Get a complete, production-ready Vue SFC blade template. Returns full file content (150-330 lines) that AI should copy and adapt. Available templates: list-simple, list-filters, list-multiselect, details-simple, details-validation. Use this instead of generating code from scratch.",
          inputSchema: zodToJsonSchema(getBladeTemplateSchema),
        },
      ],
    };
  });

  // List available resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: "vcshell://component-registry",
          name: "VC-Shell Component Registry",
          description: "Complete registry of available VC-Shell components with examples",
          mimeType: "application/json",
        },
        {
          uri: "vcshell://ui-plan-schema",
          name: "UI-Plan JSON Schema",
          description: "JSON Schema for VC-Shell UI-Plan validation",
          mimeType: "application/json",
        },
        {
          uri: "vcshell://blade-list-pattern",
          name: "Blade List Pattern",
          description: "Complete example of a list/grid blade with table, search, and CRUD operations",
          mimeType: "text/markdown",
        },
        {
          uri: "vcshell://blade-details-pattern",
          name: "Blade Details Pattern",
          description: "Complete example of a details/form blade with validation and save/delete",
          mimeType: "text/markdown",
        },
        {
          uri: "vcshell://composable-list-pattern",
          name: "List Composable Pattern",
          description: "Example of useEntityList composable for list blades",
          mimeType: "text/markdown",
        },
        {
          uri: "vcshell://composable-details-pattern",
          name: "Details Composable Pattern",
          description: "Example of useEntityDetails composable for details blades",
          mimeType: "text/markdown",
        },
        {
          uri: "vcshell://component-templates",
          name: "Slot Component Templates",
          description: "Reusable Vue components for table slots and blade composition (status-badge, image-grid, actions-dropdown, widget-container)",
          mimeType: "application/json",
        },
      ],
    };
  });

  // Read resource content
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;

    switch (uri) {
      case "vcshell://component-registry": {
        const content = fs.readFileSync(registryPath, "utf-8");
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: content,
            },
          ],
        };
      }

      case "vcshell://ui-plan-schema": {
        const schemaPath = path.join(schemasPath, "ui-plan.v1.schema.json");
        const content = fs.readFileSync(schemaPath, "utf-8");
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: content,
            },
          ],
        };
      }

      case "vcshell://blade-list-pattern": {
        const examplePath = path.join(examplesPath, "blade-list-pattern.md");
        if (fs.existsSync(examplePath)) {
          const content = fs.readFileSync(examplePath, "utf-8");
          return {
            contents: [
              {
                uri,
                mimeType: "text/markdown",
                text: content,
              },
            ],
          };
        }
        throw new Error("Blade list pattern example not found");
      }

      case "vcshell://blade-details-pattern": {
        const examplePath = path.join(examplesPath, "blade-details-pattern.md");
        if (fs.existsSync(examplePath)) {
          const content = fs.readFileSync(examplePath, "utf-8");
          return {
            contents: [
              {
                uri,
                mimeType: "text/markdown",
                text: content,
              },
            ],
          };
        }
        throw new Error("Blade details pattern example not found");
      }

      case "vcshell://composable-list-pattern": {
        const examplePath = path.join(examplesPath, "composable-list-pattern.md");
        if (fs.existsSync(examplePath)) {
          const content = fs.readFileSync(examplePath, "utf-8");
          return {
            contents: [
              {
                uri,
                mimeType: "text/markdown",
                text: content,
              },
            ],
          };
        }
        throw new Error("Composable list pattern example not found");
      }

      case "vcshell://composable-details-pattern": {
        const examplePath = path.join(examplesPath, "composable-details-pattern.md");
        if (fs.existsSync(examplePath)) {
          const content = fs.readFileSync(examplePath, "utf-8");
          return {
            contents: [
              {
                uri,
                mimeType: "text/markdown",
                text: content,
              },
            ],
          };
        }
        throw new Error("Composable details pattern example not found");
      }

      case "vcshell://component-templates": {
        // Return slot component metadata and code
        const slotComponents = registry._slotComponents?.components || [];
        const componentsPath = path.join(examplesPath, "components");
        
        const componentsData = slotComponents.map((comp: any) => {
          const compPath = path.join(examplesPath, comp.file);
          let code = "";
          
          if (fs.existsSync(compPath)) {
            code = fs.readFileSync(compPath, "utf-8");
          }
          
          return {
            name: comp.name,
            file: comp.file,
            description: comp.description,
            usage: comp.usage,
            props: comp.props,
            events: comp.events,
            example: comp.example,
            code,
          };
        });

        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify({
                description: "Reusable components for custom table slots and blade composition",
                components: componentsData,
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "validate_ui_plan": {
          const parsed = validateUIPlanSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const validator = new Validator();
          const result = validator.validateUIPlan(parsed.data.plan);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    valid: result.valid,
                    message: result.valid ? "UI-Plan is valid" : "UI-Plan has validation errors",
                    errors: result.errors || undefined,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "search_components": {
          const parsed = searchComponentsSchema.safeParse(args || {});
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { query, limit, offset } = parsed.data;
          const searchResult = searchEngine.search({
            query,
            limit: limit || 20,
            offset: offset || 0,
          });

          const formatted = formatSearchResults(searchResult);

          return {
            content: [
              {
                type: "text",
                text: formatted,
              },
            ],
          };
        }

        case "view_components": {
          const parsed = viewComponentsSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { components } = parsed.data;
          const componentData = searchEngine.getComponents(components);

          if (componentData.length === 0) {
            const availableComponents = Array.from(searchEngine.getAllComponents().keys());
            throw componentNotFoundError(
              components.join(", "),
              availableComponents
            );
          }

          const componentsWithDetails = componentData.map(({ name, component }) => ({
            name,
            ...component,
          }));

          const formatted = formatMultipleComponentDetails(componentsWithDetails);

          return {
            content: [
              {
                type: "text",
                text: formatted,
              },
            ],
          };
        }

        case "get_component_examples": {
          const parsed = getComponentExamplesSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { query, component } = parsed.data;

          const componentsPath = path.join(examplesPath, "components");
          const templatesPath = path.join(examplesPath, "templates");

          const foundFiles: Array<{ file: string; path: string; type: string }> = [];

          // Search in components/ for .md demos
          if (fs.existsSync(componentsPath)) {
            const files = fs.readdirSync(componentsPath);
            for (const file of files) {
              if (file.endsWith("-demo.md") || file.endsWith("-example.md")) {
                if (component && !file.toLowerCase().includes(component.toLowerCase())) {
                  continue;
                }
                if (query && !file.toLowerCase().includes(query.toLowerCase())) {
                  continue;
                }
                foundFiles.push({
                  file,
                  path: path.join(componentsPath, file),
                  type: "demo",
                });
              }
            }
          }

          // Search in templates/ for .vue templates
          if (fs.existsSync(templatesPath)) {
            const files = fs.readdirSync(templatesPath);
            for (const file of files) {
              if (file.endsWith(".vue")) {
                if (query && !file.toLowerCase().includes(query.toLowerCase())) {
                  continue;
                }
                foundFiles.push({
                  file,
                  path: path.join(templatesPath, file),
                  type: "template",
                });
              }
            }
          }

          if (foundFiles.length === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: `No examples or templates found matching query: "${query}"${component ? ` for component: ${component}` : ""}

Try:
- "VcTable" for component demos
- "list" for list blade templates  
- "details" for details blade templates
- "filter" for examples with filters`,
                },
              ],
            };
          }

          // Read and format found files
          let output = `# Examples and Templates\n\nFound ${foundFiles.length} result(s):\n\n`;

          for (const { file, path: filePath, type } of foundFiles) {
            const content = fs.readFileSync(filePath, "utf-8");
            const title = file.replace("-demo.md", "").replace("-example.md", "").replace(".vue", "");
            const fileType = type === "template" ? "Production Template" : "Demo";

            output += `## ${title} (${fileType})\n\n`;
            
            if (type === "template") {
              const templates = registry.VcBlade?.templates || [];
              const templateInfo = templates.find((t: any) => t.file === `templates/${file}`);
              
              if (templateInfo) {
                output += `**Complexity:** ${templateInfo.complexity}\n`;
                output += `**Features:** ${templateInfo.features?.join(", ")}\n`;
                output += `**Lines:** ~${templateInfo.lines}\n\n`;
                output += `**Usage:** Production-ready template - COPY and ADAPT.\n\n`;
              }
            }

            output += `\`\`\`${type === "template" ? "vue" : "markdown"}\n${content}\n\`\`\`\n\n---\n\n`;
          }

          return {
            content: [
              {
                type: "text",
                text: output,
              },
            ],
          };
        }

        case "get_audit_checklist": {
          const checklist = generateMinimalAuditChecklist();

          return {
            content: [
              {
                type: "text",
                text: checklist,
              },
            ],
          };
        }

        case "scaffold_app": {
          const parsed = scaffoldAppSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { projectName, targetDirectory } = parsed.data;

          const targetDir = targetDirectory || process.cwd();
          const projectPath = path.join(targetDir, projectName);

          // Check if directory already exists
          if (fs.existsSync(projectPath)) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: false,
                      error: `Directory '${projectName}' already exists`,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    message: `Ready to create VC-Shell app '${projectName}'`,
                    instructions: [
                      `Run the following command to create the app:`,
                      `npx @vc-shell/create-vc-app ${projectName}`,
                      ``,
                      `Then follow the prompts to configure your project.`,
                      ``,
                      `After creation, navigate to the project:`,
                      `cd ${projectName}`,
                      ``,
                      `Start the development server:`,
                      `npm run dev`,
                    ].join("\n"),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "get_blade_template": {
          const parsed = getBladeTemplateSchema.safeParse(args);
          if (!parsed.success) {
            throw new Error(`Invalid arguments: ${parsed.error.message}`);
          }

          const { type, complexity } = parsed.data;
          
          // Map type + complexity to template filename
          const templateMap: Record<string, string> = {
            "list-simple": "list-simple.vue",
            "list-filters": "list-filters.vue",
            "list-multiselect": "list-multiselect.vue",
            "details-simple": "details-simple.vue",
            "details-validation": "details-validation.vue",
          };

          const templateKey = `${type}-${complexity}`;
          const templateFile = templateMap[templateKey];

          if (!templateFile) {
            return {
              content: [
                {
                  type: "text",
                  text: `Template not found for type="${type}" complexity="${complexity}". Available: list-simple, list-filters, list-multiselect, details-simple, details-validation`,
                },
              ],
              isError: true,
            };
          }

          const templatePath = path.join(examplesPath, "templates", templateFile);
          
          if (!fs.existsSync(templatePath)) {
            return {
              content: [
                {
                  type: "text",
                  text: `Template file not found: ${templateFile}`,
                },
              ],
              isError: true,
            };
          }

          const content = fs.readFileSync(templatePath, "utf-8");
          
          // Get template metadata from registry
          const templates = registry.VcBlade?.templates || [];
          const templateInfo = templates.find((t: any) => t.id === templateKey);

          const metadata = templateInfo
            ? `
## Template: ${templateInfo.description}

**Complexity:** ${templateInfo.complexity}
**Features:** ${templateInfo.features?.join(", ")}
**Lines:** ~${templateInfo.lines}
${templateInfo.requiredComponents ? `**Required Components:** ${templateInfo.requiredComponents.join(", ")}` : ""}

**Instructions:**
1. COPY the template code below as-is
2. RENAME entity names (Entity → YourEntity)
3. ADAPT columns/fields for your data model
4. UPDATE i18n keys (ENTITIES → YOUR_MODULE)
5. PRESERVE all event handlers and state management logic

`
            : "";

          return {
            content: [
              {
                type: "text",
                text: `${metadata}
\`\`\`vue
${content}
\`\`\`

**Next Steps:**
- Copy this template
- Adapt entity names and types
- Customize columns/fields
- Update translation keys
- Create corresponding composable (useEntityList or useEntityDetails)
`,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      // Format error for MCP
      const errorMessage =
        error instanceof Error ? formatMcpError(error) : String(error);

      return {
        content: [
          {
            type: "text",
            text: errorMessage,
          },
        ],
        isError: true,
      };
    }
  });

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("VC-Shell MCP Server started");
}
