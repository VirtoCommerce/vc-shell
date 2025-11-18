/**
 * Registry Loader Module
 * Handles loading of component and framework API registries
 */

import * as fs from "fs";
import * as path from "path";

export interface RegistryLoaderOptions {
  rootPath: string;
}

export class RegistryLoader {
  private componentRegistry: any = null;
  private frameworkRegistry: any = null;
  private examplesPath: string;

  constructor(private options: RegistryLoaderOptions) {
    // Detect if running from dist/ or src/
    const isCompiledBuild = options.rootPath.includes("/dist");
    const schemasDir = isCompiledBuild ? "schemas" : path.join("src", "schemas");
    const examplesDir = isCompiledBuild ? "examples" : path.join("src", "examples");

    this.examplesPath = path.join(options.rootPath, examplesDir);
  }

  /**
   * Load component registry
   */
  loadComponentRegistry(): any {
    if (this.componentRegistry) {
      return this.componentRegistry;
    }

    // Detect if running from dist/ or src/
    const isCompiledBuild = this.options.rootPath.includes("/dist");
    const schemasDir = isCompiledBuild ? "schemas" : path.join("src", "schemas");
    const registryPath = path.join(this.options.rootPath, schemasDir, "component-registry.json");

    if (!fs.existsSync(registryPath)) {
      throw new Error(`Component registry not found at: ${registryPath}`);
    }

    this.componentRegistry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
    return this.componentRegistry;
  }

  /**
   * Load framework API registry
   */
  loadFrameworkRegistry(): any {
    if (this.frameworkRegistry) {
      return this.frameworkRegistry;
    }

    // Detect if running from dist/ or src/
    const isCompiledBuild = this.options.rootPath.includes("/dist");
    const schemasDir = isCompiledBuild ? "schemas" : path.join("src", "schemas");
    const registryPath = path.join(this.options.rootPath, schemasDir, "framework-api-registry.json");

    if (!fs.existsSync(registryPath)) {
      throw new Error(`Framework API registry not found at: ${registryPath}`);
    }

    this.frameworkRegistry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
    return this.frameworkRegistry;
  }

  /**
   * Get examples path
   */
  getExamplesPath(): string {
    return this.examplesPath;
  }

  /**
   * Load example file
   */
  loadExample(relativePath: string): string | null {
    const fullPath = path.join(this.examplesPath, relativePath);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    return fs.readFileSync(fullPath, "utf-8");
  }
}
