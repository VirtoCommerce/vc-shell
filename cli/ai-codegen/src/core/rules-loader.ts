/**
 * Rules Loader
 *
 * Loads rules from YAML files and provides filtering/caching capabilities.
 * This allows rules to be defined externally and customized without code changes.
 */

import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import yaml from "js-yaml";
import { fileURLToPath } from "url";
import type {
  Rule,
  RuleCategory,
  GenerationStrategy,
  BladeType,
  RulesLoaderOptions,
} from "./rules-types.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class RulesLoader {
  private rulesDir: string;
  private examplesDir: string;
  private cache: Map<string, Rule[]> = new Map();
  private cacheEnabled: boolean;

  constructor(options: RulesLoaderOptions = {}) {
    this.rulesDir = options.rulesDir || path.join(__dirname, "../rules");
    this.examplesDir = options.examplesDir || path.join(__dirname, "../examples");
    this.cacheEnabled = options.cache !== false;
  }

  /**
   * Load all rules
   */
  async loadAllRules(): Promise<Rule[]> {
    const cacheKey = "all";
    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const categories: RuleCategory[] = ["critical", "constraint", "best-practice", "custom"];
    const allRules: Rule[] = [];

    for (const category of categories) {
      const categoryPath = path.join(this.rulesDir, category);
      if (!(await fs.pathExists(categoryPath))) {
        continue;
      }

      const files = await glob("**/*.{yaml,yml}", { cwd: categoryPath });

      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const rule = await this.loadRule(filePath);
        if (rule && rule.enabled) {
          allRules.push(rule);
        }
      }
    }

    // Sort by priority (higher = more important)
    allRules.sort((a, b) => b.priority - a.priority);

    if (this.cacheEnabled) {
      this.cache.set(cacheKey, allRules);
    }

    return allRules;
  }

  /**
   * Load a single rule from file
   */
  private async loadRule(filePath: string): Promise<Rule | null> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const rule = yaml.load(content) as Rule;

      // Resolve paths to examples
      if (rule.examples) {
        rule.examples = rule.examples.map((ex) => {
          // If path is already absolute, use it
          if (path.isAbsolute(ex)) {
            return ex;
          }
          // Otherwise, resolve relative to examples dir
          return path.join(this.examplesDir, ex);
        });
      }

      if (rule.correct_pattern?.file) {
        rule.correct_pattern.file = path.isAbsolute(rule.correct_pattern.file)
          ? rule.correct_pattern.file
          : path.join(this.examplesDir, rule.correct_pattern.file);
      }

      if (rule.wrong_pattern?.file) {
        rule.wrong_pattern.file = path.isAbsolute(rule.wrong_pattern.file)
          ? rule.wrong_pattern.file
          : path.join(this.examplesDir, rule.wrong_pattern.file);
      }

      return rule;
    } catch (error) {
      console.warn(`Failed to load rule from ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Load rules by category
   */
  async loadByCategory(category: RuleCategory): Promise<Rule[]> {
    const cacheKey = `category:${category}`;
    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const allRules = await this.loadAllRules();
    const filtered = allRules.filter((r) => r.category === category);

    if (this.cacheEnabled) {
      this.cache.set(cacheKey, filtered);
    }

    return filtered;
  }

  /**
   * Load rules for specific strategy
   */
  async loadForStrategy(strategy: GenerationStrategy): Promise<Rule[]> {
    const cacheKey = `strategy:${strategy}`;
    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const allRules = await this.loadAllRules();
    const filtered = allRules.filter(
      (r) => !r.strategy || r.strategy === "ALL" || r.strategy === strategy,
    );

    if (this.cacheEnabled) {
      this.cache.set(cacheKey, filtered);
    }

    return filtered;
  }

  /**
   * Load rules for specific blade type
   */
  async loadForBladeType(bladeType: BladeType): Promise<Rule[]> {
    const cacheKey = `blade:${bladeType}`;
    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const allRules = await this.loadAllRules();
    const filtered = allRules.filter(
      (r) => !r.applies_to || r.applies_to.includes("all") || r.applies_to.includes(bladeType),
    );

    if (this.cacheEnabled) {
      this.cache.set(cacheKey, filtered);
    }

    return filtered;
  }

  /**
   * Load rules filtered by multiple criteria
   */
  async loadFiltered(options: {
    category?: RuleCategory;
    strategy?: GenerationStrategy;
    bladeType?: BladeType;
  }): Promise<Rule[]> {
    let rules = await this.loadAllRules();

    if (options.category) {
      rules = rules.filter((r) => r.category === options.category);
    }

    if (options.strategy) {
      rules = rules.filter(
        (r) => !r.strategy || r.strategy === "ALL" || r.strategy === options.strategy,
      );
    }

    if (options.bladeType) {
      rules = rules.filter(
        (r) =>
          !r.applies_to || r.applies_to.includes("all") || r.applies_to.includes(options.bladeType!),
      );
    }

    return rules;
  }

  /**
   * Load example file content
   */
  async loadExample(examplePath: string): Promise<string> {
    try {
      const fullPath = path.isAbsolute(examplePath)
        ? examplePath
        : path.join(this.examplesDir, examplePath);

      if (await fs.pathExists(fullPath)) {
        return await fs.readFile(fullPath, "utf-8");
      }
      return "";
    } catch (error) {
      console.warn(`Failed to load example from ${examplePath}:`, error);
      return "";
    }
  }

  /**
   * Get rule by ID
   */
  async getRuleById(id: string): Promise<Rule | null> {
    const allRules = await this.loadAllRules();
    return allRules.find((r) => r.id === id) || null;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Reload all rules (clears cache and reloads)
   */
  async reload(): Promise<Rule[]> {
    this.clearCache();
    return await this.loadAllRules();
  }
}
