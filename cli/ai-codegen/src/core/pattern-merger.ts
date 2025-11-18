/**
 * PatternMerger - Composes multiple patterns into complete blade code
 *
 * ARCHITECTURE:
 * ```
 * Patterns (markdown) → parse → AST → merge → complete code
 *
 * Example:
 * - list-basic.md (VcBlade + VcTable structure)
 * - filters-pattern.md (filter panel logic)
 * - multiselect.md (selection handlers)
 * → merges into single Vue SFC with all features
 * ```
 *
 * MERGING STRATEGY:
 * 1. Template section: Merge DOM elements (VcBlade > VcTable + filters slot + etc)
 * 2. Script section: Merge imports, composables, refs, functions
 * 3. Style section: Concatenate styles
 * 4. Deduplicate: Remove duplicate imports, refs, handlers
 *
 * @since 0.7.0
 */

import type { CompositionPattern } from "./generation-rules.js";

export interface MergedCode {
  template: string;
  script: string;
  style: string;
  imports: string[];
  composables: string[];
  refs: string[];
  computed: string[];
  methods: string[];
  lifecycle: string[];
}

export interface MergeOptions {
  deduplicateImports?: boolean;
  sortImports?: boolean;
  addComments?: boolean;
  indentSize?: number;
}

/**
 * PatternMerger intelligently combines multiple composition patterns
 */
export class PatternMerger {
  private defaultOptions: Required<MergeOptions> = {
    deduplicateImports: true,
    sortImports: true,
    addComments: true,
    indentSize: 2,
  };

  /**
   * Merge multiple patterns into complete Vue SFC code
   */
  merge(patterns: CompositionPattern[], options?: MergeOptions): MergedCode {
    const opts = { ...this.defaultOptions, ...options };

    // Initialize merged structure
    const merged: MergedCode = {
      template: "",
      script: "",
      style: "",
      imports: [],
      composables: [],
      refs: [],
      computed: [],
      methods: [],
      lifecycle: [],
    };

    // Process each pattern
    for (const pattern of patterns) {
      this.mergePattern(pattern, merged);
    }

    // Post-processing
    if (opts.deduplicateImports) {
      merged.imports = this.deduplicateArray(merged.imports);
    }

    if (opts.sortImports) {
      merged.imports = this.sortImports(merged.imports);
    }

    // Deduplicate other arrays
    merged.composables = this.deduplicateArray(merged.composables);
    merged.refs = this.deduplicateArray(merged.refs);
    merged.computed = this.deduplicateArray(merged.computed);
    merged.methods = this.deduplicateArray(merged.methods);
    merged.lifecycle = this.deduplicateArray(merged.lifecycle);

    return merged;
  }

  /**
   * Build complete Vue SFC from merged code
   */
  buildSFC(merged: MergedCode, options?: MergeOptions): string {
    const opts = { ...this.defaultOptions, ...options };
    const indent = " ".repeat(opts.indentSize);

    const parts: string[] = [];

    // Template section
    parts.push("<template>");
    parts.push(merged.template || `${indent}<!-- Template content -->`);
    parts.push("</template>");
    parts.push("");

    // Script section
    parts.push('<script setup lang="ts">');

    // Imports
    if (merged.imports.length > 0) {
      parts.push(merged.imports.join("\n"));
      parts.push("");
    }

    // Composables
    if (merged.composables.length > 0) {
      if (opts.addComments) {
        parts.push("// Composables");
      }
      parts.push(merged.composables.join("\n"));
      parts.push("");
    }

    // Refs
    if (merged.refs.length > 0) {
      if (opts.addComments) {
        parts.push("// Reactive state");
      }
      parts.push(merged.refs.join("\n"));
      parts.push("");
    }

    // Computed
    if (merged.computed.length > 0) {
      if (opts.addComments) {
        parts.push("// Computed properties");
      }
      parts.push(merged.computed.join("\n\n"));
      parts.push("");
    }

    // Methods
    if (merged.methods.length > 0) {
      if (opts.addComments) {
        parts.push("// Methods");
      }
      parts.push(merged.methods.join("\n\n"));
      parts.push("");
    }

    // Lifecycle hooks
    if (merged.lifecycle.length > 0) {
      if (opts.addComments) {
        parts.push("// Lifecycle");
      }
      parts.push(merged.lifecycle.join("\n\n"));
    }

    parts.push("</script>");

    // Style section
    if (merged.style) {
      parts.push("");
      parts.push('<style lang="scss" scoped>');
      parts.push(merged.style);
      parts.push("</style>");
    }

    return parts.join("\n");
  }

  /**
   * Merge single pattern into accumulated result
   */
  private mergePattern(pattern: CompositionPattern, merged: MergedCode): void {
    // Extract sections from pattern content
    const sections = this.parsePatternContent(pattern.content);

    // Merge template
    if (sections.template) {
      merged.template = this.mergeTemplates(merged.template, sections.template);
    }

    // Merge script sections
    if (sections.imports) {
      merged.imports.push(...sections.imports);
    }

    if (sections.composables) {
      merged.composables.push(...sections.composables);
    }

    if (sections.refs) {
      merged.refs.push(...sections.refs);
    }

    if (sections.computed) {
      merged.computed.push(...sections.computed);
    }

    if (sections.methods) {
      merged.methods.push(...sections.methods);
    }

    if (sections.lifecycle) {
      merged.lifecycle.push(...sections.lifecycle);
    }

    // Merge styles
    if (sections.style) {
      merged.style += (merged.style ? "\n\n" : "") + sections.style;
    }
  }

  /**
   * Parse pattern content into sections
   */
  private parsePatternContent(content: string): {
    template?: string;
    imports?: string[];
    composables?: string[];
    refs?: string[];
    computed?: string[];
    methods?: string[];
    lifecycle?: string[];
    style?: string;
  } {
    const sections: ReturnType<typeof this.parsePatternContent> = {};

    // Extract code blocks from markdown
    const codeBlocks = this.extractCodeBlocks(content);

    for (const block of codeBlocks) {
      if (block.lang === "vue" || block.lang === "html") {
        // Parse Vue SFC
        const parsed = this.parseVueSFC(block.code);
        sections.template = parsed.template;

        if (parsed.script) {
          const scriptSections = this.parseScriptContent(parsed.script);
          sections.imports = scriptSections.imports;
          sections.composables = scriptSections.composables;
          sections.refs = scriptSections.refs;
          sections.computed = scriptSections.computed;
          sections.methods = scriptSections.methods;
          sections.lifecycle = scriptSections.lifecycle;
        }

        sections.style = parsed.style;
      } else if (block.lang === "typescript" || block.lang === "ts" || block.lang === "javascript" || block.lang === "js") {
        // Parse standalone script
        const scriptSections = this.parseScriptContent(block.code);
        sections.imports = scriptSections.imports;
        sections.composables = scriptSections.composables;
        sections.refs = scriptSections.refs;
        sections.computed = scriptSections.computed;
        sections.methods = scriptSections.methods;
        sections.lifecycle = scriptSections.lifecycle;
      }
    }

    return sections;
  }

  /**
   * Extract code blocks from markdown
   */
  private extractCodeBlocks(markdown: string): Array<{ lang: string; code: string }> {
    const blocks: Array<{ lang: string; code: string }> = [];
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(markdown)) !== null) {
      blocks.push({
        lang: match[1] || "text",
        code: match[2].trim(),
      });
    }

    return blocks;
  }

  /**
   * Parse Vue SFC into sections
   */
  private parseVueSFC(code: string): {
    template?: string;
    script?: string;
    style?: string;
  } {
    const result: ReturnType<typeof this.parseVueSFC> = {};

    // Extract template
    const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
    if (templateMatch) {
      result.template = templateMatch[1].trim();
    }

    // Extract script
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      result.script = scriptMatch[1].trim();
    }

    // Extract style
    const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    if (styleMatch) {
      result.style = styleMatch[1].trim();
    }

    return result;
  }

  /**
   * Parse script content into logical sections
   */
  private parseScriptContent(script: string): {
    imports: string[];
    composables: string[];
    refs: string[];
    computed: string[];
    methods: string[];
    lifecycle: string[];
  } {
    const sections = {
      imports: [] as string[],
      composables: [] as string[],
      refs: [] as string[],
      computed: [] as string[],
      methods: [] as string[],
      lifecycle: [] as string[],
    };

    const lines = script.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();

      // Import statements
      if (trimmed.startsWith("import ")) {
        sections.imports.push(trimmed);
      }
      // Composables (use* calls)
      else if (/^const .* = use[A-Z]/.test(trimmed)) {
        sections.composables.push(trimmed);
      }
      // Refs (ref, reactive, computed)
      else if (/^const .* = (ref|reactive|shallowRef|toRef)\(/.test(trimmed)) {
        sections.refs.push(trimmed);
      }
      // Computed properties
      else if (/^const .* = computed\(/.test(trimmed)) {
        sections.computed.push(this.extractBlock(script, line));
      }
      // Functions
      else if (/^(async\s+)?function /.test(trimmed) || /^const .* = (\(.*\)|async \(.*\)) =>/.test(trimmed)) {
        sections.methods.push(this.extractBlock(script, line));
      }
      // Lifecycle hooks
      else if (/^(onMounted|onBeforeMount|onUpdated|onBeforeUpdate|onUnmounted|watch|watchEffect)\(/.test(trimmed)) {
        sections.lifecycle.push(this.extractBlock(script, line));
      }
    }

    return sections;
  }

  /**
   * Extract complete block (function, computed, etc.) from script
   */
  private extractBlock(script: string, startLine: string): string {
    const startIndex = script.indexOf(startLine);
    if (startIndex === -1) return startLine;

    let braceCount = 0;
    let inString = false;
    let stringChar = "";
    let result = "";
    let i = startIndex;

    while (i < script.length) {
      const char = script[i];
      result += char;

      // Handle strings
      if ((char === '"' || char === "'" || char === "`") && script[i - 1] !== "\\") {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      // Count braces (outside strings)
      if (!inString) {
        if (char === "{" || char === "(") {
          braceCount++;
        } else if (char === "}" || char === ")") {
          braceCount--;

          // Block complete
          if (braceCount === 0 && char === "}") {
            // Check if followed by semicolon
            if (script[i + 1] === ";") {
              result += ";";
            }
            break;
          }
        }
      }

      i++;
    }

    return result.trim();
  }

  /**
   * Merge two template strings
   * Strategy: Insert child templates into parent slots or append
   */
  private mergeTemplates(base: string, addition: string): string {
    if (!base) return addition;
    if (!addition) return base;

    // Simple strategy: wrap both in container if no clear merge point
    // More sophisticated merging would parse AST and find insertion points
    return `${base}\n${addition}`;
  }

  /**
   * Deduplicate array items
   */
  private deduplicateArray(arr: string[]): string[] {
    return Array.from(new Set(arr));
  }

  /**
   * Sort import statements
   * Order: framework imports > 3rd party > local
   */
  private sortImports(imports: string[]): string[] {
    const framework: string[] = [];
    const thirdParty: string[] = [];
    const local: string[] = [];

    for (const imp of imports) {
      if (imp.includes("@vc-shell/framework")) {
        framework.push(imp);
      } else if (imp.includes("vue") || imp.includes("vue-i18n") || imp.includes("vee-validate")) {
        framework.push(imp);
      } else if (imp.includes("./") || imp.includes("../")) {
        local.push(imp);
      } else {
        thirdParty.push(imp);
      }
    }

    return [...framework.sort(), ...thirdParty.sort(), ...local.sort()];
  }

  /**
   * Get pattern by name for testing
   */
  getPattern(patterns: CompositionPattern[], name: string): CompositionPattern | undefined {
    return patterns.find(p => p.name === name);
  }
}
