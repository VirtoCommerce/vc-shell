import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseVueSFC } from "@vue/compiler-sfc";
import * as parser from "@babel/parser";
import _traverse from "@babel/traverse";
import { execa } from "execa";

const traverse = (_traverse as any).default || _traverse;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Capability extracted from component analysis
 */
export interface ComponentCapability {
  id: string;
  type: "prop" | "slot" | "event" | "feature" | "pattern";
  name: string;
  description: string;
  requiredProps?: string[];
  relatedSlots?: string[];
  relatedEvents?: string[];
  codeExample?: string;
  useCases: string[];
  complexity: "simple" | "medium" | "advanced";
}

type CapabilityMap = Record<string, ComponentCapability>;

/**
 * Enhanced component information with all capabilities
 */
export interface EnhancedComponent {
  name: string;
  import: string;
  description: string;
  category: string;
  capabilities: CapabilityMap;
  props: Record<string, string>;
  slots: Record<string, string>;
  events: Record<string, string>;
  examples: Array<{ title: string; code: string }>;
}

/**
 * Configuration for ComponentAnalyzer
 */
export interface AnalyzerConfig {
  docsPath: string;
  frameworkPath: string;
  projectPaths: string[];
}

/**
 * ComponentAnalyzer extracts capabilities from multiple sources:
 * 1. Documentation (markdown files)
 * 2. Source code (Vue SFC files)
 * 3. Real usage (grep across projects)
 */
export class ComponentAnalyzer {
  private config: AnalyzerConfig;
  private baseRegistry: Record<string, any>;

  constructor(config: AnalyzerConfig, baseRegistry: Record<string, any>) {
    this.config = config;
    this.baseRegistry = baseRegistry;
  }

  /**
   * Analyze all components and build enhanced registry
   */
  async analyzeAll(): Promise<Record<string, EnhancedComponent>> {
    const enhanced: Record<string, EnhancedComponent> = {};
    const componentNames = Object.keys(this.baseRegistry);

    console.log(`\n🔍 Analyzing ${componentNames.length} components...`);

    for (const componentName of componentNames) {
      try {
        console.log(`\n📦 Analyzing ${componentName}...`);
        const result = await this.analyzeComponent(componentName);
        enhanced[componentName] = result;
        console.log(`✅ ${componentName}: Found ${Object.keys(result.capabilities).length} capabilities`);
      } catch (error) {
        console.error(`❌ Error analyzing ${componentName}:`, error);
        // Continue with next component
      }
    }

    return enhanced;
  }

  /**
   * Analyze single component from all sources
   */
  async analyzeComponent(componentName: string): Promise<EnhancedComponent> {
    const baseInfo = this.baseRegistry[componentName];

    // Start with base info
    const enhanced: EnhancedComponent = {
      name: componentName,
      import: baseInfo.import || "@vc-shell/framework",
      description: baseInfo.description || "",
      category: baseInfo.category || "Unknown",
      capabilities: {},
      props: baseInfo.props || {},
      slots: baseInfo.slots || {},
      events: baseInfo.events || {},
      examples: baseInfo.examples || [],
    };

    // Extract from documentation
    const docsCapabilities = await this.extractFromDocs(componentName);
    Object.assign(enhanced.capabilities, docsCapabilities);

    // Extract from source code
    const sourceCapabilities = await this.extractFromSource(componentName);
    Object.assign(enhanced.capabilities, sourceCapabilities);

    // Extract from real usage
    const usageCapabilities = await this.extractFromUsage(componentName);
    Object.assign(enhanced.capabilities, usageCapabilities);

    // Merge and deduplicate
    this.deduplicateCapabilities(enhanced);

    return enhanced;
  }

  /**
   * Extract capabilities from markdown documentation
   */
  private async extractFromDocs(componentName: string): Promise<CapabilityMap> {
    const capabilities: CapabilityMap = {};
    
    // Convert VcTable -> vc-table.md
    // Remove Vc prefix, then add dash before capitals, then add vc- back
    const withoutVc = componentName.replace(/^Vc/, "");
    const filename = "vc-" + withoutVc
      .replace(/([A-Z])/g, (match, offset) => (offset > 0 ? "-" + match.toLowerCase() : match.toLowerCase()))
      .toLowerCase();
    
    const docPath = path.join(
      this.config.docsPath,
      "platform/developer-guide/docs/custom-apps-development/vc-shell/Essentials/ui-components",
      `${filename}.md`
    );

    if (!fs.existsSync(docPath)) {
      console.log(`  📄 No docs found at ${docPath}`);
      return capabilities;
    }

    const content = fs.readFileSync(docPath, "utf-8");

    // Extract props table
    const propsMatch = content.match(/## Props[\s\S]*?\n\|(.*?)\n\|(.*?)\n((?:\|.*?\n)+)/);
    if (propsMatch) {
      const propLines = propsMatch[3].trim().split("\n");
      propLines.forEach((line, index) => {
        const match = line.match(/\|\s*`([^`]+)`\s*\|\s*`([^`]*)`\s*\|\s*`([^`]*)`\s*\|\s*([^|]+)\|/);
        if (match) {
          const [, propName, propType, defaultValue, description] = match;
          const capabilityId = `prop-${propName}`;
          capabilities[capabilityId] = {
            id: capabilityId,
            type: "prop",
            name: propName,
            description: description.trim(),
            requiredProps: [propName],
            useCases: [],
            complexity: "simple",
          };
        }
      });
    }

    // Extract slots from documentation
    const slotsMatch = content.match(/## Slots[\s\S]*?\n((?:\|.*?\n)+)/);
    if (slotsMatch) {
      const slotLines = slotsMatch[1].trim().split("\n");
      slotLines.slice(2).forEach((line) => { // Skip header rows
        const match = line.match(/\|\s*`([^`]+)`\s*\|\s*([^|]+)\|/);
        if (match) {
          const [, slotName, description] = match;
          const capabilityId = `slot-${slotName}`;
          capabilities[capabilityId] = {
            id: capabilityId,
            type: "slot",
            name: slotName,
            description: description.trim(),
            relatedSlots: [slotName],
            useCases: [],
            complexity: "medium",
          };
        }
      });
    }

    // Extract code examples
    const exampleMatches = content.matchAll(/```vue\n([\s\S]*?)\n```/g);
    for (const match of exampleMatches) {
      const code = match[1];
      // Look for features in examples (filters slot, multiselect, etc.)
      if (code.includes("#filters")) {
        capabilities["feature-filters"] = {
          id: "feature-filters",
          type: "feature",
          name: "Advanced Filters",
          description: "Custom filter panel with staged/applied pattern",
          relatedSlots: ["filters"],
          requiredProps: ["active-filter-count"],
          codeExample: code,
          useCases: ["Status filter", "Date range filter", "Multi-criteria filtering"],
          complexity: "advanced",
        };
      }
      if (code.includes("item-action-builder")) {
        capabilities["feature-row-actions"] = {
          id: "feature-row-actions",
          type: "feature",
          name: "Row Actions",
          description: "Contextual actions for each table row",
          requiredProps: ["item-action-builder", "enable-item-actions"],
          codeExample: code,
          useCases: ["Edit", "Delete", "Conditional actions"],
          complexity: "medium",
        };
      }
      if (code.includes("multiselect")) {
        capabilities["feature-multiselect"] = {
          id: "feature-multiselect",
          type: "feature",
          name: "Multiselect",
          description: "Row selection with bulk actions",
          requiredProps: ["multiselect"],
          relatedEvents: ["selection-changed"],
          codeExample: code,
          useCases: ["Bulk delete", "Bulk status change", "Export selected"],
          complexity: "medium",
        };
      }
    }

    return capabilities;
  }

  /**
   * Extract capabilities from Vue SFC source code
   */
  private async extractFromSource(componentName: string): Promise<CapabilityMap> {
    const capabilities: CapabilityMap = {};

    // Find component file
    const componentPath = this.findComponentFile(componentName);
    if (!componentPath) {
      console.log(`  📦 No source file found for ${componentName}`);
      return capabilities;
    }

    const content = fs.readFileSync(componentPath, "utf-8");
    
    // Parse Vue SFC
    const { descriptor } = parseVueSFC(content);

    // Extract slots from template
    if (descriptor.template) {
      const templateContent = descriptor.template.content;
      const slotMatches = templateContent.matchAll(/<slot\s+name="([^"]+)"/g);
      for (const match of slotMatches) {
        const slotName = match[1];
        const capabilityId = `slot-${slotName}`;
        if (!capabilities[capabilityId]) {
          capabilities[capabilityId] = {
            id: capabilityId,
            type: "slot",
            name: slotName,
            description: `Custom ${slotName} slot`,
            relatedSlots: [slotName],
            useCases: [],
            complexity: "simple",
          };
        }
      }
    }

    // Extract props and emits from script
    if (descriptor.script || descriptor.scriptSetup) {
      const scriptContent = descriptor.script?.content || descriptor.scriptSetup?.content || "";
      
      try {
        const ast = parser.parse(scriptContent, {
          sourceType: "module",
          plugins: ["typescript", "jsx"],
        });

        // Look for defineProps, defineEmits
        traverse(ast, {
          CallExpression(path: any) {
            if (path.node.callee.name === "defineEmits") {
              // Extract events
              const arg = path.node.arguments[0];
              if (arg && arg.type === "ArrayExpression") {
                arg.elements.forEach((el: any) => {
                  if (el.type === "StringLiteral") {
                    const eventName = el.value;
                    const capabilityId = `event-${eventName}`;
                    capabilities[capabilityId] = {
                      id: capabilityId,
                      type: "event",
                      name: eventName,
                      description: `Emitted on ${eventName}`,
                      relatedEvents: [eventName],
                      useCases: [],
                      complexity: "simple",
                    };
                  }
                });
              }
            }
          },
        });
      } catch (error) {
        console.log(`  ⚠️  Could not parse script for ${componentName}`);
      }
    }

    return capabilities;
  }

  /**
   * Extract capabilities from real usage across projects
   */
  private async extractFromUsage(componentName: string): Promise<CapabilityMap> {
    const capabilities: CapabilityMap = {};

    // Search for component usage
    const pattern = `<${componentName}`;
    
    for (const projectPath of this.config.projectPaths) {
      if (!fs.existsSync(projectPath)) {
        continue;
      }

      try {
        const { stdout } = await execa("grep", [
          "-r",
          "-h", // No filenames
          "--include=*.vue",
          pattern,
          projectPath,
        ]);

        const lines = stdout.split("\n").filter(Boolean);
        
        // Analyze usage patterns
        for (const line of lines) {
          // Look for common patterns
          if (line.includes("#filters")) {
            capabilities["feature-filters"] = capabilities["feature-filters"] || {
              id: "feature-filters",
              type: "feature",
              name: "Advanced Filters",
              description: "Custom filter panel with staged/applied pattern",
              relatedSlots: ["filters"],
              useCases: ["Status filter", "Date range filter"],
              complexity: "advanced",
            };
          }
          if (line.includes("#item_")) {
            capabilities["feature-custom-columns"] = capabilities["feature-custom-columns"] || {
              id: "feature-custom-columns",
              type: "feature",
              name: "Custom Column Slots",
              description: "Custom rendering for specific columns",
              relatedSlots: ["item_{columnKey}"],
              useCases: ["Status badge", "Image thumbnail", "Custom formatting"],
              complexity: "medium",
            };
          }
          if (line.includes(":multiselect")) {
            capabilities["feature-multiselect"] = capabilities["feature-multiselect"] || {
              id: "feature-multiselect",
              type: "feature",
              name: "Multiselect",
              description: "Row selection with bulk actions",
              requiredProps: ["multiselect"],
              relatedEvents: ["selection-changed"],
              useCases: ["Bulk operations"],
              complexity: "medium",
            };
          }
        }
      } catch (error) {
        // grep exits with code 1 if no matches found
        continue;
      }
    }

    return capabilities;
  }

  /**
   * Find component source file
   */
  private findComponentFile(componentName: string): string | null {
    // Convert VcTable -> vc-table
    // Remove Vc prefix, then add dash before capitals, then add vc- back
    const withoutVc = componentName.replace(/^Vc/, "");
    const filename = "vc-" + withoutVc
      .replace(/([A-Z])/g, (match, offset) => (offset > 0 ? "-" + match.toLowerCase() : match.toLowerCase()))
      .toLowerCase();

    const possiblePaths = [
      path.join(this.config.frameworkPath, "ui/components/organisms", filename, `${filename}.vue`),
      path.join(this.config.frameworkPath, "ui/components/molecules", filename, `${filename}.vue`),
      path.join(this.config.frameworkPath, "ui/components/atoms", filename, `${filename}.vue`),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    return null;
  }

  /**
   * Deduplicate and merge similar capabilities
   */
  private deduplicateCapabilities(component: EnhancedComponent): void {
    const capabilities = component.capabilities;
    const merged: Record<string, ComponentCapability> = {};

    for (const [id, cap] of Object.entries(capabilities)) {
      // Find if similar capability already exists
      const similar = Object.values(merged).find(
        (m) => m.name.toLowerCase() === cap.name.toLowerCase() && m.type === cap.type
      );

      if (similar) {
        // Merge use cases
        similar.useCases = Array.from(new Set([...similar.useCases, ...cap.useCases]));
        // Keep code example from most complex source
        if (cap.codeExample && (!similar.codeExample || cap.codeExample.length > similar.codeExample.length)) {
          similar.codeExample = cap.codeExample;
        }
        // Merge related props/slots/events
        if (cap.requiredProps) {
          similar.requiredProps = Array.from(new Set([...(similar.requiredProps || []), ...cap.requiredProps]));
        }
        if (cap.relatedSlots) {
          similar.relatedSlots = Array.from(new Set([...(similar.relatedSlots || []), ...cap.relatedSlots]));
        }
        if (cap.relatedEvents) {
          similar.relatedEvents = Array.from(new Set([...(similar.relatedEvents || []), ...cap.relatedEvents]));
        }
      } else {
        merged[id] = cap;
      }
    }

    component.capabilities = merged;
  }

  /**
   * Generate enhanced registry JSON
   */
  static generateRegistryJSON(enhanced: Record<string, EnhancedComponent>): string {
    return JSON.stringify(enhanced, null, 2);
  }

  /**
   * Save enhanced registry to file
   */
  async saveRegistry(enhanced: Record<string, EnhancedComponent>, outputPath: string): Promise<void> {
    const json = ComponentAnalyzer.generateRegistryJSON(enhanced);
    fs.writeFileSync(outputPath, json, "utf-8");
    console.log(`\n✅ Enhanced registry saved to ${outputPath}`);
  }
}

