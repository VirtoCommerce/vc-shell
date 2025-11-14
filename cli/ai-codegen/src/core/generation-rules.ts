import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface GenerationRules {
  bladeStructure: {
    list: string;
    details: string;
  };
  naming: {
    components: string;
    composables: string;
    files: string;
    variables: string;
  };
  i18n: {
    structure: string;
    case: string;
    usage: string;
  };
  composition: {
    listBasic: string;
    listWithFilters: string;
    listWithMultiselect: string;
    formBasic: string;
    formWithSections: string;
    formWithGallery: string;
  };
  validation: {
    required: string[];
    forbidden: string[];
  };
  typescript: {
    strictMode: boolean;
    requireTypes: string[];
  };
  patterns: Map<string, CompositionPattern>;
}

export interface CompositionPattern {
  name: string;
  type: "list" | "details" | "shared";
  description: string;
  content: string;
  features: string[];
  requiredComponents: string[];
  codeExample?: string;
}

/**
 * GenerationRulesProvider loads and consolidates rules from composition patterns
 * 
 * Provides:
 * - Blade structure rules
 * - Naming conventions
 * - i18n patterns
 * - Composition patterns from markdown files
 * - Validation rules
 */
export class GenerationRulesProvider {
  private rules: GenerationRules | null = null;
  private patternsPath: string;

  constructor() {
    // Determine path to examples/compositions
    // In production (dist/): dist/examples/compositions
    // In development (src/): src/examples/compositions
    this.patternsPath = __dirname.includes("/dist")
      ? path.join(__dirname, "examples", "compositions")
      : path.join(__dirname, "..", "examples", "compositions");
  }

  /**
   * Get consolidated generation rules
   */
  getRules(): GenerationRules {
    if (!this.rules) {
      this.rules = this.loadRules();
    }
    return this.rules;
  }

  /**
   * Load rules from patterns and definitions
   */
  private loadRules(): GenerationRules {
    const patterns = this.loadPatterns();

    return {
      bladeStructure: {
        list: "VcBlade > VcTable (with columns, search, pagination, sorting)",
        details: "VcBlade > VcContainer > VcForm (with Field + VcInput for each field)",
      },
      naming: {
        components: "PascalCase (EntityList, EntityDetails, StatusBadge)",
        composables: "use + PascalCase (useEntityList, useEntityDetails)",
        files: "kebab-case (entity-list.vue, useEntityList.ts, status-badge.vue)",
        variables: "camelCase (selectedItemId, loadingState, currentPage)",
      },
      i18n: {
        structure: "MODULE.PAGES.BLADE_TYPE.SECTION.KEY",
        case: "SCREAMING_SNAKE_CASE for all parts",
        usage: "Always use $t() or t() for strings, never hardcode text",
      },
      composition: {
        listBasic: this.getPatternSummary("list-basic"),
        listWithFilters: this.getPatternSummary("list-with-filters"),
        listWithMultiselect: this.getPatternSummary("list-with-multiselect"),
        formBasic: this.getPatternSummary("form-basic"),
        formWithSections: this.getPatternSummary("form-with-sections"),
        formWithGallery: "VcBlade > VcContainer > [VcGallery + VcForm]",
      },
      validation: {
        required: [
          "Use Field component from vee-validate for form inputs",
          "Include validation rules for required fields",
          "All VcComponents must exist in registry",
          "All imports must be valid",
          "defineOptions must include name and url",
        ],
        forbidden: [
          "Do NOT use VcField for form inputs (read-only display only)",
          "Do NOT hardcode strings (use i18n)",
          "Do NOT skip error handling in async methods",
          "Do NOT use inline styles (use Tailwind classes)",
        ],
      },
      typescript: {
        strictMode: true,
        requireTypes: [
          "Props interface with proper types",
          "Emits interface with event signatures",
          "Entity interfaces for data models",
          "Composable return types",
        ],
      },
      patterns,
    };
  }

  /**
   * Load composition patterns from markdown files
   */
  private loadPatterns(): Map<string, CompositionPattern> {
    const patterns = new Map<string, CompositionPattern>();

    if (!fs.existsSync(this.patternsPath)) {
      console.warn(`Patterns path not found: ${this.patternsPath}`);
      return patterns;
    }

    const files = fs.readdirSync(this.patternsPath);

    for (const file of files) {
      if (!file.endsWith(".md")) continue;

      const filePath = path.join(this.patternsPath, file);
      const content = fs.readFileSync(filePath, "utf-8");
      
      const pattern = this.parsePattern(file, content);
      if (pattern) {
        patterns.set(pattern.name, pattern);
      }
    }

    return patterns;
  }

  /**
   * Parse pattern from markdown file
   */
  private parsePattern(filename: string, content: string): CompositionPattern | null {
    const name = filename.replace(".md", "");
    
    // Determine type from name
    let type: "list" | "details" | "shared" = "shared";
    if (name.includes("list")) type = "list";
    else if (name.includes("form") || name.includes("details")) type = "details";

    // Extract title from first # heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const description = titleMatch ? titleMatch[1] : name;

    // Extract features from content
    const features: string[] = [];
    if (content.includes("filters")) features.push("filters");
    if (content.includes("multiselect")) features.push("multiselect");
    if (content.includes("validation")) features.push("validation");
    if (content.includes("gallery") || content.includes("VcGallery")) features.push("gallery");

    // Extract required components
    const requiredComponents: string[] = [];
    const componentMatches = content.matchAll(/<(Vc[A-Z][a-zA-Z]*)/g);
    for (const match of componentMatches) {
      if (!requiredComponents.includes(match[1])) {
        requiredComponents.push(match[1]);
      }
    }

    // Extract code example (first ```vue or ```typescript block)
    const codeMatch = content.match(/```(?:vue|typescript)\n([\s\S]+?)\n```/);
    const codeExample = codeMatch ? codeMatch[1] : undefined;

    return {
      name,
      type,
      description,
      content,
      features,
      requiredComponents,
      codeExample,
    };
  }

  /**
   * Get pattern by name
   */
  getPattern(name: string): CompositionPattern | undefined {
    const rules = this.getRules();
    return rules.patterns.get(name);
  }

  /**
   * Get patterns by type
   */
  getPatternsByType(type: "list" | "details" | "shared"): CompositionPattern[] {
    const rules = this.getRules();
    return Array.from(rules.patterns.values()).filter(p => p.type === type);
  }

  /**
   * Get patterns by features
   */
  getPatternsByFeatures(features: string[]): CompositionPattern[] {
    const rules = this.getRules();
    return Array.from(rules.patterns.values()).filter(pattern => {
      return features.some(feature => pattern.features.includes(feature));
    });
  }

  /**
   * Get relevant patterns for blade generation
   */
  getRelevantPatterns(type: "list" | "details", features?: string[]): CompositionPattern[] {
    const rules = this.getRules();
    const patterns: CompositionPattern[] = [];

    // Get base pattern
    const baseName = type === "list" ? "list-basic" : "form-basic";
    const basePattern = rules.patterns.get(baseName);
    if (basePattern) {
      patterns.push(basePattern);
    }

    // Get feature-specific patterns
    if (features && features.length > 0) {
      const featurePatterns = this.getPatternsByFeatures(features);
      patterns.push(...featurePatterns);
    }

    return patterns;
  }

  /**
   * Get pattern summary (for composition rules)
   */
  private getPatternSummary(patternName: string): string {
    const patterns = this.loadPatterns();
    const pattern = patterns.get(patternName);
    
    if (!pattern) {
      return `Pattern ${patternName} (see compositions/${patternName}.md)`;
    }

    return `${pattern.description} - Components: ${pattern.requiredComponents.join(", ")}`;
  }

  /**
   * Get rules as formatted text for AI context
   */
  getRulesAsText(): string {
    const rules = this.getRules();
    
    return `# VC-Shell Code Generation Rules

## Blade Structure

**List Blades:**
${rules.bladeStructure.list}

**Details Blades:**
${rules.bladeStructure.details}

## Naming Conventions

- **Components:** ${rules.naming.components}
- **Composables:** ${rules.naming.composables}
- **Files:** ${rules.naming.files}
- **Variables:** ${rules.naming.variables}

## i18n Rules

- **Structure:** ${rules.i18n.structure}
- **Case:** ${rules.i18n.case}
- **Usage:** ${rules.i18n.usage}

## Composition Patterns

**List Basic:** ${rules.composition.listBasic}
**List with Filters:** ${rules.composition.listWithFilters}
**List with Multiselect:** ${rules.composition.listWithMultiselect}
**Form Basic:** ${rules.composition.formBasic}
**Form with Sections:** ${rules.composition.formWithSections}

## Validation Rules

**Required:**
${rules.validation.required.map(r => `- ${r}`).join("\n")}

**Forbidden:**
${rules.validation.forbidden.map(r => `- ${r}`).join("\n")}

## TypeScript

- **Strict Mode:** ${rules.typescript.strictMode ? "Enabled" : "Disabled"}
- **Required Types:** ${rules.typescript.requireTypes.join(", ")}
`;
  }

  /**
   * Get relevant capabilities for component based on features from UI-Plan
   * Maps UI-Plan features to component capabilities
   */
  getRelevantCapabilities(
    component: string,
    features: string[] = []
  ): Array<{ id: string; name: string; type: string; description: string }> {
    // Load unified registry with capabilities - use path relative to patterns directory
    const registryPath = path.join(
      this.patternsPath, 
      "..", 
      "..", 
      "schemas", 
      "component-registry.json"
    );
    
    let registry: any = {};
    try {
      registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
    } catch (error) {
      console.warn("Component registry not found", error);
      return [];
    }

    const componentData = registry[component];
    if (!componentData || !componentData.capabilities) {
      return [];
    }

    const relevantCaps: Array<{ id: string; name: string; type: string; description: string }> = [];

    // Feature to capability mapping
    const featureMappings: Record<string, string[]> = {
      "filters": ["feature-filters", "slot-filters"],
      "search": ["prop-searchValue", "prop-searchPlaceholder", "event-search:change"],
      "multiselect": ["feature-multiselect", "prop-multiselect", "event-selection-changed"],
      "sorting": ["prop-sort", "event-header-click"],
      "pagination": ["prop-pages", "prop-currentPage", "prop-totalCount", "event-pagination-click"],
      "custom-slots": ["feature-custom-columns", "slot-default"],
      "row-actions": ["feature-row-actions", "prop-item-action-builder", "prop-enable-item-actions"],
      "validation": ["prop-validation", "event-validation"],
      "gallery": ["slot-default", "prop-items", "event-upload", "event-reorder"],
      "widgets": ["slot-widgets"],
    };

    // If no features specified, return all capabilities
    if (features.length === 0) {
      for (const [capId, cap] of Object.entries(componentData.capabilities)) {
        relevantCaps.push({
          id: capId,
          name: (cap as any).name,
          type: (cap as any).type,
          description: (cap as any).description,
        });
      }
      return relevantCaps;
    }

    // Map features to capabilities
    const capabilityIds = new Set<string>();
    for (const feature of features) {
      const mappedIds = featureMappings[feature] || [];
      mappedIds.forEach(id => capabilityIds.add(id));
    }

    // Get matching capabilities
    for (const capId of capabilityIds) {
      const cap = componentData.capabilities[capId];
      if (cap) {
        relevantCaps.push({
          id: capId,
          name: cap.name,
          type: cap.type,
          description: cap.description,
        });
      }
    }

    // Also include capabilities that match feature keywords
    for (const [capId, cap] of Object.entries(componentData.capabilities)) {
      if (capabilityIds.has(capId)) continue; // Already added

      const capText = `${(cap as any).name} ${(cap as any).description}`.toLowerCase();
      for (const feature of features) {
        if (capText.includes(feature.toLowerCase())) {
          relevantCaps.push({
            id: capId,
            name: (cap as any).name,
            type: (cap as any).type,
            description: (cap as any).description,
          });
          break;
        }
      }
    }

    return relevantCaps;
  }

  /**
   * Export rules as JSON for MCP resource
   */
  exportRulesAsJSON(): string {
    const rules = this.getRules();
    
    // Convert patterns Map to object for JSON serialization
    const patternsObj: Record<string, Omit<CompositionPattern, "content">> = {};
    for (const [name, pattern] of rules.patterns) {
      patternsObj[name] = {
        name: pattern.name,
        type: pattern.type,
        description: pattern.description,
        features: pattern.features,
        requiredComponents: pattern.requiredComponents,
        codeExample: pattern.codeExample,
      };
    }

    return JSON.stringify({
      bladeStructure: rules.bladeStructure,
      naming: rules.naming,
      i18n: rules.i18n,
      composition: rules.composition,
      validation: rules.validation,
      typescript: rules.typescript,
      patterns: patternsObj,
    }, null, 2);
  }
}

// Singleton instance
let rulesProvider: GenerationRulesProvider | null = null;

export function getGenerationRulesProvider(): GenerationRulesProvider {
  if (!rulesProvider) {
    rulesProvider = new GenerationRulesProvider();
  }
  return rulesProvider;
}

