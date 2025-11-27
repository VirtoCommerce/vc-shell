/**
 * Knowledge Base
 *
 * Master orchestrator for all registries.
 * Provides unified access to framework knowledge.
 */

import { ComponentRegistry } from "./registries/components";
import { FrameworkAPIRegistry } from "./registries/framework";
import { PatternRegistry } from "./registries/patterns";
import { TemplateRegistry } from "./registries/templates";
import { FeatureRegistry } from "./registries/features";
import { getDirname, getExamplesPath } from "../utils/paths";
import type { RegistryOptions } from "./types";

export class KnowledgeBase {
  public readonly components: ComponentRegistry;
  public readonly frameworkAPIs: FrameworkAPIRegistry;
  public readonly patterns: PatternRegistry;
  public readonly templates: TemplateRegistry;
  public readonly features: FeatureRegistry;

  private readonly examplesDir: string;

  constructor(examplesDir?: string, options: RegistryOptions = {}) {
    // Default to package examples directory (cross-platform compatible)
    this.examplesDir = examplesDir || getExamplesPath(getDirname(import.meta.url));

    // Initialize all registries
    this.components = new ComponentRegistry(this.examplesDir, options);
    this.frameworkAPIs = new FrameworkAPIRegistry(this.examplesDir, options);
    this.patterns = new PatternRegistry(this.examplesDir, options);
    this.templates = new TemplateRegistry(this.examplesDir, options);
    this.features = new FeatureRegistry(this.components, this.patterns, this.templates, options);
  }

  /**
   * Load all registries
   */
  async loadAll(): Promise<void> {
    // Load independent registries first
    await Promise.all([
      this.components.load(),
      this.frameworkAPIs.load(),
      this.patterns.load(),
      this.templates.load(),
    ]);

    // Load dependent registry last
    await this.features.load();
  }

  /**
   * Ensure all registries are loaded
   */
  async ensureLoaded(): Promise<void> {
    if (!this.isLoaded) {
      await this.loadAll();
    }
  }

  /**
   * Check if all registries are loaded
   */
  get isLoaded(): boolean {
    return (
      this.components.isLoaded &&
      this.frameworkAPIs.isLoaded &&
      this.patterns.isLoaded &&
      this.templates.isLoaded &&
      this.features.isLoaded
    );
  }

  /**
   * Get statistics about loaded knowledge
   */
  get stats() {
    return {
      components: this.components.count,
      frameworkAPIs: this.frameworkAPIs.count,
      patterns: this.patterns.count,
      templates: this.templates.count,
      features: this.features.count,
      isLoaded: this.isLoaded,
    };
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.components.clear();
    this.frameworkAPIs.clear();
    this.patterns.clear();
    this.templates.clear();
    this.features.clear();
  }

  /**
   * Reload all registries
   */
  async reload(): Promise<void> {
    this.clearAll();
    await this.loadAll();
  }
}

/**
 * Singleton instance
 */
let instance: KnowledgeBase | null = null;

/**
 * Get singleton instance of KnowledgeBase
 */
export function getKnowledgeBase(examplesDir?: string, options?: RegistryOptions): KnowledgeBase {
  if (!instance) {
    instance = new KnowledgeBase(examplesDir, options);
  }
  return instance;
}

/**
 * Reset singleton instance
 */
export function resetKnowledgeBase(): void {
  instance = null;
}
