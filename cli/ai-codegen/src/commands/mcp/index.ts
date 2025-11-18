/**
 * MCP Module Exports
 *
 * This module consolidates all MCP-related functionality that was previously
 * in the monolithic mcp.ts file (>2k lines).
 *
 * Structure:
 * - registry-loader.ts: Component and framework API registry loading
 * - tool-schemas.ts: Zod schemas for all MCP tools
 * - resources.ts: MCP resource definitions and handlers
 */

export * from "./registry-loader";
export * from "./tool-schemas";
export * from "./resources";
