import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { fileURLToPath } from "node:url";
import { SearchEngine } from "../core/search-engine.js";
import { formatMultipleComponentDetails } from "../utils/formatters.js";
import { componentNotFoundError } from "../utils/errors.js";
import type { Component } from "../schemas/zod-schemas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ViewCommandOptions {
  components: string[];
  cwd: string;
}

export async function viewCommand(options: ViewCommandOptions): Promise<void> {
  const { components } = options;

  // Get path to component registry
  const schemasPath = __dirname.includes("/dist")
    ? path.join(__dirname, "schemas")
    : path.join(__dirname, "..", "schemas");

  const registryPath = path.join(schemasPath, "component-registry.json");

  // Load registry
  const registry: Record<string, Component> = JSON.parse(
    fs.readFileSync(registryPath, "utf-8")
  );

  // Initialize search engine
  const searchEngine = new SearchEngine(registry);

  // Get components
  const componentData = searchEngine.getComponents(components);

  if (componentData.length === 0) {
    const availableComponents = Array.from(searchEngine.getAllComponents().keys());
    const error = componentNotFoundError(components.join(", "), availableComponents);
    console.error(chalk.red(`\n${error.message}\n`));
    if (error.suggestion) {
      console.log(chalk.yellow(`💡 ${error.suggestion}\n`));
    }
    process.exit(1);
  }

  // Format and print
  const componentsWithDetails = componentData.map(({ name, component }) => ({
    name,
    ...component,
  }));

  const formatted = formatMultipleComponentDetails(componentsWithDetails);
  console.log(formatted);
}

