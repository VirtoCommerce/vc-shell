/**
 * Examples Loader
 *
 * Loads examples from Markdown files with optional frontmatter.
 * Uses index.yaml for quick search and metadata.
 */

import fs from "fs-extra";
import path from "path";
import yaml from "yaml";
import { getDirname, getExamplesPath } from "../utils/paths";
import type {
  ExamplesIndex,
  Example,
  ExampleMetadata,
  ExampleSearchQuery,
  ExampleFrontmatter,
  CapabilityExample,
  PatternExample,
  CompositionExample,
  FrameworkAPIExample,
} from "./examples-types";

const __dirname = getDirname(import.meta.url);

export class ExamplesLoader {
  private examplesDir: string;
  private indexCache: ExamplesIndex | null = null;
  private cacheEnabled: boolean;

  constructor(options: { examplesDir?: string; cache?: boolean } = {}) {
    this.examplesDir = options.examplesDir || getExamplesPath(__dirname);
    this.cacheEnabled = options.cache !== false;
  }

  /**
   * Load examples index from index.yaml
   */
  async loadIndex(): Promise<ExamplesIndex> {
    if (this.cacheEnabled && this.indexCache) {
      return this.indexCache;
    }

    const indexPath = path.join(this.examplesDir, "index.yaml");

    if (!(await fs.pathExists(indexPath))) {
      // Return empty index if file doesn't exist
      return {
        capabilities: {},
        patterns: [],
        compositions: {},
        framework: [],
      };
    }

    const content = await fs.readFile(indexPath, "utf-8");
    const index = yaml.parse(content) as ExamplesIndex;

    if (this.cacheEnabled) {
      this.indexCache = index;
    }

    return index;
  }

  /**
   * Get example by ID
   */
  async getExample(id: string): Promise<Example | null> {
    const index = await this.loadIndex();
    const metadata = this.findInIndex(index, id);

    if (!metadata) {
      return null;
    }

    const filePath = path.join(this.examplesDir, metadata.file);
    const content = await this.loadMarkdown(filePath);

    return {
      ...metadata,
      content,
      frontmatter: this.parseFrontmatter(content),
    };
  }

  /**
   * Get example content by file path
   */
  async getExampleByPath(relativePath: string): Promise<string> {
    const filePath = path.isAbsolute(relativePath)
      ? relativePath
      : path.join(this.examplesDir, relativePath);

    if (await fs.pathExists(filePath)) {
      return await fs.readFile(filePath, "utf-8");
    }

    return "";
  }

  /**
   * Search examples
   */
  async search(query: ExampleSearchQuery): Promise<ExampleMetadata[]> {
    const index = await this.loadIndex();
    const allExamples = this.flattenIndex(index);

    return allExamples.filter((example) => {
      // Component filter
      if (query.component && example.component !== query.component) {
        return false;
      }

      // Type filter
      if (query.type && example.type !== query.type) {
        return false;
      }

      // Complexity filter
      if (query.complexity && example.complexity !== query.complexity) {
        return false;
      }

      // Category filter
      if (query.category && example.category !== query.category) {
        return false;
      }

      // Critical filter
      if (query.critical !== undefined && example.critical !== query.critical) {
        return false;
      }

      // Tags filter (match any)
      if (query.tags && query.tags.length > 0) {
        if (!example.tags || !query.tags.some((tag) => example.tags!.includes(tag))) {
          return false;
        }
      }

      // Related rule filter
      if (query.related_rule) {
        if (!example.related_rules || !example.related_rules.includes(query.related_rule)) {
          return false;
        }
      }

      // Blade type filter
      if (query.blade_type && "blade_type" in example) {
        const composition = example as CompositionExample;
        if (composition.blade_type && composition.blade_type !== "all" && composition.blade_type !== query.blade_type) {
          return false;
        }
      }

      // Text search
      if (query.text) {
        const searchText = query.text.toLowerCase();
        const matchTitle = example.title?.toLowerCase().includes(searchText);
        const matchDescription = example.description?.toLowerCase().includes(searchText);
        const matchId = example.id.toLowerCase().includes(searchText);

        if (!matchTitle && !matchDescription && !matchId) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get examples for component
   */
  async getComponentExamples(component: string): Promise<CapabilityExample[]> {
    const index = await this.loadIndex();
    return index.capabilities[component] || [];
  }

  /**
   * Get examples related to rule
   */
  async getExamplesForRule(ruleId: string): Promise<ExampleMetadata[]> {
    return await this.search({ related_rule: ruleId });
  }

  /**
   * Get critical examples (most commonly needed)
   */
  async getCriticalExamples(): Promise<ExampleMetadata[]> {
    return await this.search({ critical: true });
  }

  /**
   * Get pattern examples
   */
  async getPatterns(category?: string): Promise<PatternExample[]> {
    const index = await this.loadIndex();
    let patterns = index.patterns;

    if (category) {
      patterns = patterns.filter((p) => p.pattern_category === category);
    }

    return patterns;
  }

  /**
   * Get composition examples for blade type
   */
  async getCompositions(bladeType?: "list" | "details" | "shared"): Promise<CompositionExample[]> {
    const index = await this.loadIndex();

    if (!bladeType) {
      return [
        ...(index.compositions.list || []),
        ...(index.compositions.details || []),
        ...(index.compositions.shared || []),
      ];
    }

    return index.compositions[bladeType] || [];
  }

  /**
   * Get framework API examples
   */
  async getFrameworkExamples(apiName?: string): Promise<FrameworkAPIExample[]> {
    const index = await this.loadIndex();
    let examples = index.framework;

    if (apiName) {
      examples = examples.filter((e) => e.api_name === apiName);
    }

    return examples;
  }

  /**
   * Load markdown file
   */
  private async loadMarkdown(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, "utf-8");
    } catch (error) {
      console.warn(`Failed to load example from ${filePath}:`, error);
      return "";
    }
  }

  /**
   * Parse frontmatter from markdown
   */
  private parseFrontmatter(content: string): ExampleFrontmatter | undefined {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return undefined;
    }

    try {
      return yaml.parse(match[1]) as ExampleFrontmatter;
    } catch (error) {
      console.warn("Failed to parse frontmatter:", error);
      return undefined;
    }
  }

  /**
   * Find example in index by ID
   */
  private findInIndex(index: ExamplesIndex, id: string): ExampleMetadata | null {
    // Search in capabilities
    for (const examples of Object.values(index.capabilities)) {
      const found = examples.find((e) => e.id === id);
      if (found) return found;
    }

    // Search in patterns
    const pattern = index.patterns.find((p) => p.id === id);
    if (pattern) return pattern;

    // Search in compositions
    const allCompositions = [
      ...(index.compositions.list || []),
      ...(index.compositions.details || []),
      ...(index.compositions.shared || []),
    ];
    const composition = allCompositions.find((c) => c.id === id);
    if (composition) return composition;

    // Search in framework
    const framework = index.framework.find((f) => f.id === id);
    if (framework) return framework;

    // Search in tutorials
    if (index.tutorials) {
      const tutorial = index.tutorials.find((t) => t.id === id);
      if (tutorial) return tutorial;
    }

    return null;
  }

  /**
   * Flatten index to array
   */
  private flattenIndex(index: ExamplesIndex): ExampleMetadata[] {
    const all: ExampleMetadata[] = [];

    // Capabilities
    for (const examples of Object.values(index.capabilities)) {
      all.push(...examples);
    }

    // Patterns
    all.push(...index.patterns);

    // Compositions
    if (index.compositions.list) all.push(...index.compositions.list);
    if (index.compositions.details) all.push(...index.compositions.details);
    if (index.compositions.shared) all.push(...index.compositions.shared);

    // Framework
    all.push(...index.framework);

    // Tutorials
    if (index.tutorials) all.push(...index.tutorials);

    return all;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.indexCache = null;
  }

  /**
   * Reload index
   */
  async reload(): Promise<ExamplesIndex> {
    this.clearCache();
    return await this.loadIndex();
  }
}
