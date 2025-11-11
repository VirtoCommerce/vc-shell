import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SearchEngine } from "../core/search-engine.js";
import { formatSearchResults } from "../utils/formatters.js";
import type { Component } from "../schemas/zod-schemas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SearchCommandOptions {
  query?: string;
  category?: string;
  limit?: number;
  offset?: number;
  cwd: string;
}

export async function searchCommand(options: SearchCommandOptions): Promise<void> {
  const { query, category, limit = 20, offset = 0 } = options;

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

  // Perform search
  const searchResult = searchEngine.search({
    query,
    category,
    limit,
    offset,
  });

  // Format and print
  const formatted = formatSearchResults(searchResult);
  console.log(formatted);
}

