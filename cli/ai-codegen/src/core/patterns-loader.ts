/**
 * Patterns Loader
 *
 * Loads pattern files (markdown examples) from the examples directory.
 * Provides filtering by blade type, features, and pattern category.
 */

import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import { fileURLToPath } from "url";
import type { BladeType } from "./rules-types";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface PatternFile {
  /** Pattern ID (filename without extension) */
  id: string;
  /** Full file path */
  file: string;
  /** Pattern category (based on directory) */
  category: "blade" | "composable" | "pattern" | "framework" | "api";
  /** Blade type (if applicable) */
  bladeType?: BladeType;
  /** File content (markdown) */
  content: string;
  /** Pattern title (from first heading) */
  title?: string;
  /** Features mentioned in pattern */
  features?: string[];
}

export interface TemplateFile {
  /** Template ID (filename without .vue) */
  id: string;
  /** Full file path */
  file: string;
  /** Blade type */
  bladeType: BladeType;
  /** Complexity level */
  complexity: "simple" | "moderate" | "complex";
  /** Features demonstrated */
  features: string[];
  /** Lines of code */
  lines?: number;
  /** File content (.vue file) */
  content: string;
}

export class PatternsLoader {
  private examplesDir: string;
  private cache: Map<string, PatternFile[]> = new Map();
  private templatesCache: Map<string, TemplateFile[]> = new Map();
  private cacheEnabled: boolean;

  constructor(examplesDir?: string, cacheEnabled = true) {
    this.examplesDir = examplesDir || path.join(__dirname, "examples");
    this.cacheEnabled = cacheEnabled;
  }

  /**
   * Load all pattern files
   */
  async loadAllPatterns(): Promise<PatternFile[]> {
    const cacheKey = "all";
    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const patterns: PatternFile[] = [];

    // Pattern directories and their categories (compositions/ merged into patterns/)
    const directories = [
      { path: "patterns", category: "pattern" as const },
      { path: "framework", category: "framework" as const },
      { path: "api", category: "api" as const },
    ];

    for (const { path: dir, category } of directories) {
      const dirPath = path.join(this.examplesDir, dir);
      if (!(await fs.pathExists(dirPath))) {
        continue;
      }

      const files = await glob("**/*.md", { cwd: dirPath });

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const pattern = await this.loadPattern(filePath, category);
        if (pattern) {
          patterns.push(pattern);
        }
      }
    }

    // All patterns (including blade-specific) are now in patterns/ directory
    // No need for hardcoded paths anymore

    if (this.cacheEnabled) {
      this.cache.set(cacheKey, patterns);
    }

    return patterns;
  }

  /**
   * Load a single pattern file
   */
  private async loadPattern(
    filePath: string,
    category: PatternFile["category"],
    bladeType?: BladeType,
  ): Promise<PatternFile | null> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const filename = path.basename(filePath, ".md");

      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : filename;

      // Extract features from content (simple keyword matching)
      const features = this.extractFeatures(content);

      // Infer blade type from filename if not provided
      let inferredBladeType = bladeType;
      if (!inferredBladeType) {
        if (filename.includes("list")) {
          inferredBladeType = "list";
        } else if (filename.includes("details") || filename.includes("edit")) {
          inferredBladeType = "details";
        }
      }

      return {
        id: filename,
        file: filePath,
        category,
        bladeType: inferredBladeType,
        content,
        title,
        features,
      };
    } catch (error) {
      console.warn(`Failed to load pattern from ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Extract features from pattern content
   */
  private extractFeatures(content: string): string[] {
    const features: string[] = [];
    const keywords = [
      "filter",
      "multiselect",
      "validation",
      "gallery",
      "widget",
      "tab",
      "reorderable",
      "toolbar",
      "pagination",
      "search",
      "sort",
      "workspace",
      "menu",
      "domain-event",
      "parent-child",
    ];

    for (const keyword of keywords) {
      if (content.toLowerCase().includes(keyword)) {
        features.push(keyword);
      }
    }

    return [...new Set(features)];
  }

  /**
   * Get patterns by blade type
   */
  async getPatternsByBladeType(bladeType: BladeType): Promise<PatternFile[]> {
    const cacheKey = `blade:${bladeType}`;
    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const allPatterns = await this.loadAllPatterns();
    const filtered = allPatterns.filter(
      (p) => !p.bladeType || p.bladeType === bladeType || p.bladeType === "all",
    );

    if (this.cacheEnabled) {
      this.cache.set(cacheKey, filtered);
    }

    return filtered;
  }

  /**
   * Get patterns by features
   */
  async getPatternsByFeatures(features: string[]): Promise<PatternFile[]> {
    const allPatterns = await this.loadAllPatterns();
    return allPatterns.filter((p) => {
      if (!p.features || p.features.length === 0) {
        return false;
      }
      // Match if pattern has any of the requested features
      return features.some((f) => p.features!.includes(f));
    });
  }

  /**
   * Get relevant patterns for blade context
   */
  async getRelevantPatterns(options: {
    bladeType: BladeType;
    features?: string[];
    isWorkspace?: boolean;
  }): Promise<PatternFile[]> {
    let patterns = await this.getPatternsByBladeType(options.bladeType);

    // Add workspace-specific patterns
    if (options.isWorkspace) {
      const workspacePattern = patterns.find((p) => p.id.includes("workspace"));
      if (!workspacePattern) {
        // Load workspace pattern explicitly
        const workspacePath = path.join(this.examplesDir, "patterns/workspace-blade.md");
        if (await fs.pathExists(workspacePath)) {
          const pattern = await this.loadPattern(workspacePath, "pattern");
          if (pattern) {
            patterns = [pattern, ...patterns];
          }
        }
      }
    }

    // Filter by features if provided
    if (options.features && options.features.length > 0) {
      const featurePatterns = await this.getPatternsByFeatures(options.features);
      // Merge and deduplicate
      const merged = [...patterns];
      for (const fp of featurePatterns) {
        if (!merged.find((p) => p.id === fp.id)) {
          merged.push(fp);
        }
      }
      patterns = merged;
    }

    return patterns;
  }

  /**
   * Load all template files (.vue)
   */
  async loadAllTemplates(): Promise<TemplateFile[]> {
    const cacheKey = "all";
    if (this.cacheEnabled && this.templatesCache.has(cacheKey)) {
      return this.templatesCache.get(cacheKey)!;
    }

    const templates: TemplateFile[] = [];
    const templatesDir = path.join(this.examplesDir, "templates");

    if (!(await fs.pathExists(templatesDir))) {
      return templates;
    }

    const files = await glob("*.vue", { cwd: templatesDir });

    for (const file of files) {
      const filePath = path.join(templatesDir, file);
      const template = await this.loadTemplate(filePath);
      if (template) {
        templates.push(template);
      }
    }

    if (this.cacheEnabled) {
      this.templatesCache.set(cacheKey, templates);
    }

    return templates;
  }

  /**
   * Load a single template file
   */
  private async loadTemplate(filePath: string): Promise<TemplateFile | null> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const filename = path.basename(filePath, ".vue");

      // Parse filename: {bladeType}-{features}.vue
      const parts = filename.split("-");
      const bladeType = parts[0] as BladeType;
      const featurePart = parts.slice(1).join("-");

      // Determine complexity based on features
      let complexity: "simple" | "moderate" | "complex" = "simple";
      const features: string[] = [];

      if (featurePart.includes("simple")) {
        complexity = "simple";
      } else if (
        featurePart.includes("filter") ||
        featurePart.includes("multiselect") ||
        featurePart.includes("validation")
      ) {
        complexity = "moderate";
        if (featurePart.includes("filter")) features.push("filters");
        if (featurePart.includes("multiselect")) features.push("multiselect");
        if (featurePart.includes("validation")) features.push("validation");
      } else if (
        featurePart.includes("gallery") ||
        featurePart.includes("widget") ||
        featurePart.includes("tab") ||
        featurePart.includes("reorderable")
      ) {
        complexity = featurePart.includes("reorderable") ? "moderate" : "complex";
        if (featurePart.includes("gallery")) features.push("gallery");
        if (featurePart.includes("widget")) features.push("widgets");
        if (featurePart.includes("tab")) features.push("tabs");
        if (featurePart.includes("reorderable")) features.push("reorderable");
      }

      // Count lines
      const lines = content.split("\n").length;

      return {
        id: filename,
        file: filePath,
        bladeType,
        complexity,
        features,
        lines,
        content,
      };
    } catch (error) {
      console.warn(`Failed to load template from ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Get best matching template for blade
   */
  async getBestTemplate(options: {
    bladeType: BladeType;
    features?: string[];
  }): Promise<TemplateFile | null> {
    const templates = await this.loadAllTemplates();
    const filtered = templates.filter((t) => t.bladeType === options.bladeType);

    if (filtered.length === 0) {
      return null;
    }

    // If no features requested, return simple template
    if (!options.features || options.features.length === 0) {
      return filtered.find((t) => t.id.includes("simple")) || filtered[0];
    }

    // Find template that matches most features
    let bestMatch = filtered[0];
    let bestScore = 0;

    for (const template of filtered) {
      let score = 0;
      for (const feature of options.features) {
        if (template.features.includes(feature) || template.id.includes(feature)) {
          score++;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = template;
      }
    }

    return bestMatch;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.templatesCache.clear();
  }

  /**
   * Reload all patterns
   */
  async reload(): Promise<void> {
    this.clearCache();
    await this.loadAllPatterns();
    await this.loadAllTemplates();
  }
}
