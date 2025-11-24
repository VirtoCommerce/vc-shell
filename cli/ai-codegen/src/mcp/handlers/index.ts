/**
 * MCP Tool Handlers Registration
 *
 * Centralizes all tool handlers from NEW architecture.
 * Total: 26 tools
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { MCPServerContext } from "../context";
import type { ToolHandlers } from "./types";

// Import all handler modules
import { workflowHandlers } from "./workflow";
import { componentHandlers } from "./components";
import { frameworkHandlers } from "./framework";
import { knowledgeHandlers } from "./knowledge";
import { utilityHandlers } from "./utilities";

/**
 * Combined tool handlers map (26 tools)
 */
export const allHandlers: ToolHandlers = {
  // Workflow handlers (9 tools)
  ...workflowHandlers,

  // Component handlers (5 tools)
  ...componentHandlers,

  // Framework handlers (5 tools)
  ...frameworkHandlers,

  // Knowledge handlers (3 tools)
  ...knowledgeHandlers,

  // Utility handlers (4 tools)
  ...utilityHandlers,
};

/**
 * Register all tool handlers with MCP server
 */
export function registerToolHandlers(server: Server, context: MCPServerContext): void {
  console.error("[MCP Handlers] Registering 26 tool handlers...");

  // Register CallToolRequest handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: params } = request.params;

    console.error(`[MCP Tool] ${name} called`);

    // Find handler
    const handler = allHandlers[name];
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      // Execute handler
      const result = await handler(params || {}, context);

      // Return result in MCP format
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      console.error(`[MCP Tool Error] ${name}:`, error);

      // Return error in MCP format
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              errors: [error.message || "Unknown error"],
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  console.error("[MCP Handlers] ✓ All 26 tool handlers registered");
}

/**
 * Get handler count by category
 */
export function getHandlerStats() {
  return {
    workflow: Object.keys(workflowHandlers).length,
    components: Object.keys(componentHandlers).length,
    framework: Object.keys(frameworkHandlers).length,
    knowledge: Object.keys(knowledgeHandlers).length,
    utilities: Object.keys(utilityHandlers).length,
    total: Object.keys(allHandlers).length,
  };
}

// Export individual handler modules
export { workflowHandlers } from "./workflow";
export { componentHandlers } from "./components";
export { frameworkHandlers } from "./framework";
export { knowledgeHandlers } from "./knowledge";
export { utilityHandlers } from "./utilities";
