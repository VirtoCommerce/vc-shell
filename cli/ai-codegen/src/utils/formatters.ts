import dedent from "dedent";

export interface Component {
  name: string;
  import: string;
  description?: string;
  category?: string;
  props?: Record<string, string>;
  events?: Record<string, string>;
  slots?: Record<string, string>;
  examples?: Array<{ title: string; code: string }>;
  dependencies?: string[];
  demos?: string[];
  keywords?: string[];
}

export interface SearchResult {
  items: Array<{
    name: string;
    description?: string;
    category?: string;
    score?: number;
  }>;
  total: number;
  limit?: number;
  offset?: number;
}

export interface DiffResult {
  component: string;
  hasChanges: boolean;
  changes?: Array<{
    type: "added" | "removed" | "modified";
    line: number;
    content: string;
  }>;
}

/**
 * Format a list of components for display
 */
export function formatComponentList(components: Component[]): string {
  if (components.length === 0) {
    return "No components found.";
  }

  const lines: string[] = [
    `Found ${components.length} component(s):`,
    "",
  ];

  for (const component of components) {
    lines.push(`• ${component.name}`);
    if (component.description) {
      lines.push(`  ${component.description}`);
    }
    if (component.category) {
      lines.push(`  Category: ${component.category}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Format detailed component information
 */
export function formatComponentDetails(component: Component): string {
  const sections: string[] = [];

  sections.push(`# ${component.name}`);
  sections.push("");

  if (component.description) {
    sections.push(component.description);
    sections.push("");
  }

  if (component.category) {
    sections.push(`**Category:** ${component.category}`);
    sections.push("");
  }

  sections.push(`**Import:** \`${component.import}\``);
  sections.push("");

  if (component.props && Object.keys(component.props).length > 0) {
    sections.push("## Props");
    sections.push("");
    for (const [name, type] of Object.entries(component.props)) {
      sections.push(`- **${name}**: ${type}`);
    }
    sections.push("");
  }

  if (component.events && Object.keys(component.events).length > 0) {
    sections.push("## Events");
    sections.push("");
    for (const [name, description] of Object.entries(component.events)) {
      sections.push(`- **${name}**: ${description}`);
    }
    sections.push("");
  }

  if (component.slots && Object.keys(component.slots).length > 0) {
    sections.push("## Slots");
    sections.push("");
    for (const [name, description] of Object.entries(component.slots)) {
      sections.push(`- **${name}**: ${description}`);
    }
    sections.push("");
  }

  if (component.dependencies && component.dependencies.length > 0) {
    sections.push("## Dependencies");
    sections.push("");
    sections.push(component.dependencies.map((dep) => `- ${dep}`).join("\n"));
    sections.push("");
  }

  if (component.examples && component.examples.length > 0) {
    sections.push("## Examples");
    sections.push("");
    for (const example of component.examples) {
      sections.push(`### ${example.title}`);
      sections.push("");
      sections.push("```vue");
      sections.push(example.code);
      sections.push("```");
      sections.push("");
    }
  }

  if (component.demos && component.demos.length > 0) {
    sections.push("## Demos");
    sections.push("");
    sections.push(`See: ${component.demos.join(", ")}`);
    sections.push("");
  }

  return sections.join("\n");
}

/**
 * Format multiple component details
 */
export function formatMultipleComponentDetails(components: Component[]): string {
  if (components.length === 0) {
    return "No components found.";
  }

  return components
    .map((component) => formatComponentDetails(component))
    .join("\n---\n\n");
}

/**
 * Format search results with pagination
 */
export function formatSearchResults(result: SearchResult): string {
  if (result.items.length === 0) {
    return "No components found matching your search.";
  }

  const lines: string[] = [];

  lines.push(`Found ${result.total} component(s)${result.limit ? ` (showing ${result.items.length})` : ""}:`);
  lines.push("");

  for (const item of result.items) {
    let line = `• ${item.name}`;
    if (item.category) {
      line += ` [${item.category}]`;
    }
    if (item.score !== undefined) {
      line += ` (score: ${item.score.toFixed(2)})`;
    }
    lines.push(line);

    if (item.description) {
      lines.push(`  ${item.description}`);
    }
    lines.push("");
  }

  if (result.limit && result.total > result.items.length) {
    const remaining = result.total - (result.offset || 0) - result.items.length;
    if (remaining > 0) {
      lines.push(`... and ${remaining} more`);
      lines.push("");
      lines.push(
        `Use --offset ${(result.offset || 0) + result.limit} to see more results`
      );
    }
  }

  return lines.join("\n");
}

/**
 * Format diff results
 */
export function formatDiffResults(results: DiffResult[]): string {
  const componentsWithChanges = results.filter((r) => r.hasChanges);

  if (componentsWithChanges.length === 0) {
    return "No updates found. All components are up to date.";
  }

  const lines: string[] = [
    `Found updates for ${componentsWithChanges.length} component(s):`,
    "",
  ];

  for (const result of componentsWithChanges) {
    lines.push(`• ${result.component}`);
    if (result.changes) {
      const stats = {
        added: result.changes.filter((c) => c.type === "added").length,
        removed: result.changes.filter((c) => c.type === "removed").length,
        modified: result.changes.filter((c) => c.type === "modified").length,
      };
      lines.push(
        `  +${stats.added} -${stats.removed} ~${stats.modified} changes`
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Format component examples/demos
 */
export function formatComponentExamples(
  componentName: string,
  examples: Array<{ title: string; code: string; description?: string }>
): string {
  if (examples.length === 0) {
    return dedent`
      No examples found for ${componentName}.
      
      Try viewing the component directly to see inline usage examples:
      vcgen view ${componentName}
    `;
  }

  const sections: string[] = [
    `# ${componentName} Examples`,
    "",
    `Found ${examples.length} example(s):`,
    "",
  ];

  for (const example of examples) {
    sections.push(`## ${example.title}`);
    sections.push("");

    if (example.description) {
      sections.push(example.description);
      sections.push("");
    }

    sections.push("```vue");
    sections.push(example.code);
    sections.push("```");
    sections.push("");
  }

  return sections.join("\n");
}

/**
 * Format error message for MCP
 */
export function formatMcpError(error: Error, suggestion?: string): string {
  return dedent`
    Error: ${error.message}
    
    ${suggestion ? `💡 Suggestion: ${suggestion}` : ""}
    
    ${error.stack ? `Stack trace:\n${error.stack}` : ""}
  `;
}

/**
 * Format success message
 */
export function formatSuccess(message: string, details?: string[]): string {
  const lines: string[] = [`✓ ${message}`, ""];

  if (details && details.length > 0) {
    lines.push(...details);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Format warning message
 */
export function formatWarning(message: string, details?: string[]): string {
  const lines: string[] = [`⚠️  ${message}`, ""];

  if (details && details.length > 0) {
    lines.push(...details);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Format info message
 */
export function formatInfo(message: string, details?: string[]): string {
  const lines: string[] = [`ℹ️  ${message}`, ""];

  if (details && details.length > 0) {
    lines.push(...details);
    lines.push("");
  }

  return lines.join("\n");
}

