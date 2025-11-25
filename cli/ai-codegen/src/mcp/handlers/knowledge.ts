/**
 * Knowledge Base MCP Tool Handlers
 *
 * Handlers for rules, templates, and patterns using NEW architecture.
 * 3 tools total:
 * 1. get_applicable_rules
 * 2. get_best_template
 * 3. get_relevant_patterns
 */

import type { MCPServerContext } from "../context";
import type { ToolHandler } from "./types";

/**
 * 1. get_applicable_rules
 * Get applicable rules for a blade with full context
 */
export const getApplicableRulesHandler: ToolHandler = async (params, context) => {
  const {
    bladeType,
    isWorkspace = false,
    features = [],
  } = params;
  const { kb } = context;

  try {
    const rules: any[] = [];

    // Workspace blade rules
    if (isWorkspace) {
      const workspaceRule = kb.patterns.get("workspace-blade");
      if (workspaceRule) {
        const content = await kb.patterns.getContent(workspaceRule.id);
        rules.push({
          id: workspaceRule.id,
          category: "workspace",
          description: workspaceRule.description,
          content: content,
          critical: true,
        });
      }
    }

    // Blade type specific rules
    const bladeTypePatterns = kb.patterns.getForBladeType(bladeType);
    for (const pattern of bladeTypePatterns.slice(0, 3)) {
      const content = await kb.patterns.getContent(pattern.id);
      rules.push({
        id: pattern.id,
        category: bladeType,
        description: pattern.description,
        content: content,
        critical: false, // PatternMetadata doesn't have critical field
      });
    }

    // Feature-specific rules
    for (const feature of features) {
      const featurePatterns = bladeTypePatterns.filter((p: any) =>
        p.features?.includes(feature)
      );
      for (const pattern of featurePatterns.slice(0, 2)) {
        const content = await kb.patterns.getContent(pattern.id);
        if (!rules.find((r) => r.id === pattern.id)) {
          rules.push({
            id: pattern.id,
            category: "feature",
            feature,
            description: pattern.description,
            content: content,
            critical: false,
          });
        }
      }
    }

    return {
      success: true,
      rules,
      bladeType,
      isWorkspace,
      features,
      message: `Found ${rules.length} applicable rules`,
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Failed to get applicable rules"],
    };
  }
};

/**
 * 2. get_best_template
 * Get best matching production-ready Vue SFC template
 */
export const getBestTemplateHandler: ToolHandler = async (params, context) => {
  const { bladeType, features = [], complexity } = params;
  const { templateResolver, kb } = context;

  try {
    // Use template resolver to find best match
    const match = await templateResolver.resolve({
      bladeType,
      features,
      complexity,
    });

    if (!match) {
      return {
        success: false,
        errors: [`No template found for ${bladeType} blade with features: ${features.join(", ")}`],
      };
    }

    // Load template content
    const content = await kb.templates.getContent(match.item.id);

    return {
      success: true,
      template: {
        id: match.item.id,
        bladeType: match.item.blade_type, // Field is blade_type, not bladeType
        complexity: match.item.complexity,
        features: match.item.features,
        description: match.item.description,
        content: content, // Full .vue file content
        lines: match.item.lines,
      },
      matchReason: match.reason,
      matchScore: match.score,
      message: `Best template: ${match.item.id} (score: ${match.score})`,
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Failed to get best template"],
    };
  }
};

/**
 * 3. get_relevant_patterns
 * Get relevant architectural patterns for blade context
 */
export const getRelevantPatternsHandler: ToolHandler = async (params, context) => {
  const {
    bladeType,
    features = [],
    isWorkspace = false,
    patterns: specificPatterns,
  } = params;
  const { kb } = context;

  try {
    const relevantPatterns: any[] = [];

    // If specific patterns requested
    if (specificPatterns && specificPatterns.length > 0) {
      for (const patternId of specificPatterns) {
        const pattern = kb.patterns.get(patternId);
        if (pattern) {
          const content = await kb.patterns.getContent(pattern.id);
          relevantPatterns.push({
            id: pattern.id,
            category: pattern.category,
            appliesTo: pattern.applies_to,
            features: pattern.features,
            description: pattern.description,
            content: content,
          });
        }
      }

      return {
        success: true,
        patterns: relevantPatterns,
        message: `Retrieved ${relevantPatterns.length} specific patterns`,
      };
    }

    // Otherwise, get patterns by blade type and features
    const allPatterns = bladeType === "all"
      ? kb.patterns.getAll()
      : kb.patterns.getForBladeType(bladeType as "list" | "details");

    // Workspace patterns
    if (isWorkspace) {
      const workspacePatterns = allPatterns.filter((p: any) =>
        p.id.includes("workspace") || p.features?.includes("workspace")
      );
      for (const pattern of workspacePatterns) {
        const content = await kb.patterns.getContent(pattern.id);
        relevantPatterns.push({
          id: pattern.id,
          category: "workspace",
          description: pattern.description,
          content: content,
          critical: true,
        });
      }
    }

    // Feature-specific patterns
    if (features.length > 0) {
      const featurePatterns = allPatterns.filter((p: any) =>
        features.some((f: string) => p.features?.includes(f))
      );
      for (const pattern of featurePatterns.slice(0, 5)) {
        const content = await kb.patterns.getContent(pattern.id);
        if (!relevantPatterns.find((r) => r.id === pattern.id)) {
          relevantPatterns.push({
            id: pattern.id,
            category: pattern.category,
            appliesTo: pattern.applies_to,
            features: pattern.features,
            description: pattern.description,
            content: content,
          });
        }
      }
    } else {
      // Top 5 general patterns for blade type
      for (const pattern of allPatterns.slice(0, 5)) {
        const content = await kb.patterns.getContent(pattern.id);
        relevantPatterns.push({
          id: pattern.id,
          category: pattern.category,
          appliesTo: pattern.applies_to,
          features: pattern.features,
          description: pattern.description,
          content: content,
        });
      }
    }

    return {
      success: true,
      patterns: relevantPatterns,
      bladeType,
      features,
      isWorkspace,
      message: `Found ${relevantPatterns.length} relevant patterns`,
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Failed to get relevant patterns"],
    };
  }
};

/**
 * Export all knowledge handlers
 */
export const knowledgeHandlers = {
  get_applicable_rules: getApplicableRulesHandler,
  get_best_template: getBestTemplateHandler,
  get_relevant_patterns: getRelevantPatternsHandler,
};
