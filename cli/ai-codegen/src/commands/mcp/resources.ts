/**
 * Resources Module
 * MCP resource definitions and handlers
 */

import * as fs from "fs";
import * as path from "path";

export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

/**
 * Get all available resources
 */
export function getResourceDefinitions(rootPath: string): ResourceDefinition[] {
  return [
    {
      uri: "vcshell://ui-plan-schema",
      name: "UI-Plan JSON Schema",
      description: "Complete JSON schema for UI-Plan with validation rules and examples",
      mimeType: "application/json",
    },
    {
      uri: "vcshell://ui-plan-example-complete",
      name: "Complete UI-Plan Example",
      description: "Comprehensive UI-Plan example showing all features and correct format",
      mimeType: "application/json",
    },
    {
      uri: "vcshell://component-registry",
      name: "Component Registry",
      description: "Complete registry of all VC-Shell components with props, events, and capabilities",
      mimeType: "application/json",
    },
    {
      uri: "vcshell://framework-api-registry",
      name: "Framework API Registry",
      description: "Registry of all framework composables, plugins, utilities, and services",
      mimeType: "application/json",
    },
    {
      uri: "vcshell://generation-rules",
      name: "Code Generation Rules",
      description: "Best practices and rules for generating VC-Shell code",
      mimeType: "text/markdown",
    },
    {
      uri: "vcshell://audit-checklist",
      name: "Code Audit Checklist",
      description: "Comprehensive checklist for verifying generated code quality",
      mimeType: "text/markdown",
    },
  ];
}

/**
 * Read resource content
 */
export function readResource(uri: string, rootPath: string): string {
  const schemasPath = path.join(rootPath, "src", "schemas");
  const examplesPath = path.join(rootPath, "src", "examples");
  const docsPath = path.join(rootPath, "docs");

  switch (uri) {
    case "vcshell://ui-plan-schema":
      return fs.readFileSync(path.join(schemasPath, "ui-plan.schema.json"), "utf-8");

    case "vcshell://ui-plan-example-complete":
      return fs.readFileSync(path.join(examplesPath, "ui-plan-example-complete.json"), "utf-8");

    case "vcshell://component-registry":
      return fs.readFileSync(path.join(schemasPath, "component-registry.json"), "utf-8");

    case "vcshell://framework-api-registry":
      return fs.readFileSync(path.join(schemasPath, "framework-api-registry.json"), "utf-8");

    case "vcshell://generation-rules":
      return fs.readFileSync(path.join(docsPath, "GENERATION_RULES.md"), "utf-8");

    case "vcshell://audit-checklist":
      return fs.readFileSync(path.join(docsPath, "AUDIT_CHECKLIST.md"), "utf-8");

    default:
      throw new Error(`Unknown resource URI: ${uri}`);
  }
}
