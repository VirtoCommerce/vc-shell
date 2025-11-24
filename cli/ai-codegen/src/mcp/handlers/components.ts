/**
 * Component MCP Tool Handlers
 *
 * Handlers for component discovery and inspection using NEW architecture.
 * 5 tools total:
 * 1. search_components
 * 2. view_components
 * 3. get_component_examples
 * 4. search_components_by_intent
 * 5. get_component_capabilities
 */

import type { MCPServerContext } from "../context";
import type { ToolHandler } from "./types";

/**
 * 1. search_components
 * Search for components with optional fuzzy matching
 */
export const searchComponentsHandler: ToolHandler = async (params, context) => {
  const { query = "", limit = 20, offset = 0 } = params;
  const { kb, fuzzyMatcher } = context;

  try {
    const allComponents = kb.components.getAll();

    // If no query, return all with pagination
    if (!query) {
      const paginated = allComponents.slice(offset, offset + limit);
      return {
        success: true,
        components: paginated.map((c: any) => ({
          name: c.component,
          description: c.description,
          category: c.category,
        })),
        total: allComponents.length,
        offset,
        limit,
      };
    }

    // Fuzzy search
    const matches = fuzzyMatcher.match(
      allComponents.map((c: any) => ({
        item: c,
        searchText: `${c.component} ${c.description} ${c.keywords?.join(" ") || ""}`,
        id: c.component,
      })),
      query
    );

    const paginated = matches.slice(offset, offset + limit);

    return {
      success: true,
      components: paginated.map((m: any) => ({
        name: m.item.component,
        description: m.item.description,
        category: m.item.category,
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
      errors: [error.message || "Component search failed"],
    };
  }
};

/**
 * 2. view_components
 * Get detailed information about specific components
 */
export const viewComponentsHandler: ToolHandler = async (params, context) => {
  const { components } = params;
  const { kb } = context;

  try {
    const details = [];

    for (const componentName of components) {
      const component = kb.components.findByName(componentName);

      if (!component) {
        details.push({
          name: componentName,
          error: `Component not found: ${componentName}`,
        });
        continue;
      }

      details.push({
        name: component.component,
        description: component.description,
        category: component.category,
        props: component.props,
        slots: component.slots,
        events: component.events,
        capabilities: component.capabilities,
        demos: component.demos, // Demo files, not direct examples
      });
    }

    return {
      success: true,
      components: details,
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Failed to view components"],
    };
  }
};

/**
 * 3. get_component_examples
 * Search for component examples
 */
export const getComponentExamplesHandler: ToolHandler = async (params, context) => {
  const { query, component } = params;
  const { kb, semanticMatcher } = context;

  try {
    let allExamples: any[] = [];

    if (component) {
      // Get examples for specific component from capabilities
      const comp = kb.components.findByName(component);
      if (!comp) {
        return {
          success: false,
          errors: [`Component not found: ${component}`],
        };
      }
      // Examples are in capabilities array
      allExamples = comp.capabilities?.flatMap(cap =>
        (cap.examples || []).map(ex => ({
          example: ex,
          capability: cap.name,
          component: comp.component,
        }))
      ) || [];
    } else {
      // Get all examples from all components' capabilities
      const allComponents = kb.components.getAll();
      allExamples = allComponents.flatMap((c: any) =>
        (c.capabilities || []).flatMap((cap: any) =>
          (cap.examples || []).map((ex: string) => ({
            example: ex,
            capability: cap.name,
            component: c.component,
          }))
        )
      );
    }

    // Semantic search in examples
    const matches = semanticMatcher.match(
      allExamples.map((ex: any, idx: number) => ({
        id: `${ex.component || "unknown"}-${idx}`,
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
        component: m.item.component,
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
      errors: [error.message || "Failed to get component examples"],
    };
  }
};

/**
 * 4. search_components_by_intent
 * Semantic search for components based on user intent
 */
export const searchComponentsByIntentHandler: ToolHandler = async (params, context) => {
  const { intent, context: searchContext = "general" } = params;
  const { componentResolver } = context;

  try {
    const result = await componentResolver.resolve({
      intent,
      context: searchContext,
    });

    if (!result) {
      return {
        success: true,
        components: [],
        message: "No components found matching intent",
      };
    }

    return {
      success: true,
      components: [{
        name: result.item.component,
        description: result.item.description,
        category: result.item.category,
        props: result.item.props,
        slots: result.item.slots,
        events: result.item.events,
        capabilities: result.item.capabilities,
        matchReason: result.reason,
        confidence: result.confidence,
        demos: result.item.demos, // Use demos field instead of non-existent examples
      }],
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Intent search failed"],
    };
  }
};

/**
 * 5. get_component_capabilities
 * Get detailed capability information for a component
 */
export const getComponentCapabilitiesHandler: ToolHandler = async (params, context) => {
  const { component, capability, includeExamples = true } = params;
  const { capabilityResolver } = context;

  try {
    // getCapabilities returns CapabilityMatch[] with single argument
    const allCapabilities = await capabilityResolver.getCapabilities(component);

    if (!allCapabilities || allCapabilities.length === 0) {
      return {
        success: false,
        errors: [`Component not found or has no capabilities: ${component}`],
      };
    }

    // Filter by specific capability if requested
    const filteredCapabilities = capability
      ? allCapabilities.filter((cap: any) => cap.id === capability || cap.name === capability)
      : allCapabilities;

    return {
      success: true,
      component,
      capabilities: filteredCapabilities.map((cap: any) => ({
        id: cap.id,
        name: cap.name,
        description: cap.description,
        complexity: cap.complexity,
        useCases: cap.useCases,
        examples: includeExamples ? cap.examples : undefined,
        methods: cap.methods,
        requiredProps: cap.requiredProps,
        relatedSlots: cap.relatedSlots,
        relatedEvents: cap.relatedEvents,
      })),
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Failed to get component capabilities"],
    };
  }
};

/**
 * Export all component handlers
 */
export const componentHandlers = {
  search_components: searchComponentsHandler,
  view_components: viewComponentsHandler,
  get_component_examples: getComponentExamplesHandler,
  search_components_by_intent: searchComponentsByIntentHandler,
  get_component_capabilities: getComponentCapabilitiesHandler,
};
