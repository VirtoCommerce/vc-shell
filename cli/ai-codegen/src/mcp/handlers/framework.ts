/**
 * Framework API MCP Tool Handlers
 *
 * Handlers for framework API discovery and inspection using NEW architecture.
 * 5 tools total:
 * 1. search_framework_apis
 * 2. view_framework_apis
 * 3. search_framework_by_intent
 * 4. get_framework_capabilities
 * 5. get_framework_examples
 */

import type { MCPServerContext } from "../context";
import type { ToolHandler } from "./types";

/**
 * 1. search_framework_apis
 * Search for framework APIs with optional filters
 */
export const searchFrameworkAPIsHandler: ToolHandler = async (params, context) => {
  const { query, type, category, limit = 20, offset = 0 } = params;
  const { kb, fuzzyMatcher } = context;

  try {
    let allAPIs = kb.frameworkAPIs.getAll();

    // Filter by type
    if (type) {
      allAPIs = allAPIs.filter((api: any) => api.type === type);
    }

    // Filter by category
    if (category) {
      allAPIs = allAPIs.filter((api: any) => api.category === category);
    }

    // If no query, return filtered with pagination
    if (!query) {
      const paginated = allAPIs.slice(offset, offset + limit);
      return {
        success: true,
        apis: paginated.map((api: any) => ({
          name: api.name,
          type: api.type,
          category: api.category,
          description: api.description,
        })),
        total: allAPIs.length,
        offset,
        limit,
      };
    }

    // Fuzzy search
    const matches = fuzzyMatcher.match(
      allAPIs.map((api: any) => ({
        item: api,
        searchText: `${api.name} ${api.description} ${api.keywords?.join(" ") || ""}`,
        id: api.name,
      })),
      query
    );

    const paginated = matches.slice(offset, offset + limit);

    return {
      success: true,
      apis: paginated.map((m: any) => ({
        name: m.item.name,
        type: m.item.type,
        category: m.item.category,
        description: m.item.description,
        score: m.score,
        confidence: m.confidence,
      })),
      total: matches.length,
      offset,
      limit,
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Framework API search failed"],
    };
  }
};

/**
 * 2. view_framework_apis
 * Get detailed information about specific framework APIs
 */
export const viewFrameworkAPIsHandler: ToolHandler = async (params, context) => {
  const { apis } = params;
  const { kb } = context;

  try {
    const details = [];

    for (const apiName of apis) {
      const api = kb.frameworkAPIs.findByName(apiName);

      if (!api) {
        details.push({
          name: apiName,
          error: `Framework API not found: ${apiName}`,
        });
        continue;
      }

      details.push({
        name: api.name,
        type: api.type,
        category: api.category,
        description: api.description,
        import: api.import,
        methods: api.methods,
        state: api.state,
        capabilities: api.capabilities,
        examples: api.examples?.slice(0, 3), // Top 3 examples
      });
    }

    return {
      success: true,
      apis: details,
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Failed to view framework APIs"],
    };
  }
};

/**
 * 3. search_framework_by_intent
 * Semantic search for framework APIs based on user intent
 */
export const searchFrameworkByIntentHandler: ToolHandler = async (params, context) => {
  const { intent, context: searchContext = "general" } = params;
  const { kb, semanticMatcher } = context;

  try {
    const allAPIs = kb.frameworkAPIs.getAll();

    // Semantic search
    const matches = semanticMatcher.match(
      allAPIs.map((api: any) => ({
        id: api.name,
        name: api.name,
        description: api.description,
        keywords: api.keywords,
        ...api,
      })),
      intent,
      searchContext
    );

    const top5 = matches.slice(0, 5);

    return {
      success: true,
      apis: top5.map((m: any) => ({
        name: m.item.name,
        type: m.item.type,
        category: m.item.category,
        description: m.item.description,
        import: m.item.import,
        methods: m.item.methods,
        matchReason: m.reason,
        confidence: m.confidence,
        examples: m.item.examples?.slice(0, 2),
      })),
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Intent search failed"],
    };
  }
};

/**
 * 4. get_framework_capabilities
 * Get detailed capability information for a framework API
 */
export const getFrameworkCapabilitiesHandler: ToolHandler = async (params, context) => {
  const { api, capability, includeExamples = true } = params;
  const { kb } = context;

  try {
    const frameworkAPI = kb.frameworkAPIs.findByName(api);

    if (!frameworkAPI) {
      return {
        success: false,
        errors: [`Framework API not found: ${api}`],
      };
    }

    let capabilities = frameworkAPI.capabilities || [];

    // Filter by specific capability
    if (capability) {
      capabilities = capabilities.filter((cap: any) =>
        cap.name?.toLowerCase().includes(capability.toLowerCase()) ||
        cap.description?.toLowerCase().includes(capability.toLowerCase())
      );
    }

    return {
      success: true,
      api,
      capabilities,
      methods: frameworkAPI.methods,
      examples: includeExamples ? frameworkAPI.examples : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Failed to get framework capabilities"],
    };
  }
};

/**
 * 5. get_framework_examples
 * Search for framework API examples
 */
export const getFrameworkExamplesHandler: ToolHandler = async (params, context) => {
  const { query, api } = params;
  const { kb, semanticMatcher } = context;

  try {
    let allExamples: any[] = [];

    if (api) {
      // Get examples for specific API
      const frameworkAPI = kb.frameworkAPIs.findByName(api);
      if (!frameworkAPI) {
        return {
          success: false,
          errors: [`Framework API not found: ${api}`],
        };
      }
      allExamples = frameworkAPI.examples || [];
    } else {
      // Get all examples
      const allAPIs = kb.frameworkAPIs.getAll();
      allExamples = allAPIs.flatMap((a: any) =>
        (a.examples || []).map((ex: any) => ({
          ...ex,
          api: a.name,
        }))
      );
    }

    // Semantic search in examples
    const matches = semanticMatcher.match(
      allExamples.map((ex: any, idx: number) => ({
        id: `${ex.api || "unknown"}-${idx}`,
        name: ex.title || "",
        description: ex.description || "",
        content: ex.code || "",
        ...ex,
      })),
      query
    );

    return {
      success: true,
      examples: matches.slice(0, 10).map((m: any) => ({
        api: m.item.api,
        title: m.item.title,
        description: m.item.description,
        code: m.item.code,
        confidence: m.confidence,
      })),
      total: matches.length,
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Failed to get framework examples"],
    };
  }
};

/**
 * Export all framework handlers
 */
export const frameworkHandlers = {
  search_framework_apis: searchFrameworkAPIsHandler,
  view_framework_apis: viewFrameworkAPIsHandler,
  search_framework_by_intent: searchFrameworkByIntentHandler,
  get_framework_capabilities: getFrameworkCapabilitiesHandler,
  get_framework_examples: getFrameworkExamplesHandler,
};
