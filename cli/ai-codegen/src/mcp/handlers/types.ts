/**
 * MCP Tool Handler Types
 */

import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { MCPServerContext } from "../context";

/**
 * Tool handler function type
 */
export type ToolHandler = (params: any, context: MCPServerContext) => Promise<any>;

/**
 * Tool registration map
 */
export interface ToolHandlers {
  [toolName: string]: ToolHandler;
}

/**
 * Handler registration function type
 */
export type HandlerRegistration = (server: Server, context: MCPServerContext) => void;
