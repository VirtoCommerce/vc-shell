/**
 * Response Templates Module
 *
 * Contains structured response templates for AI execution.
 * These templates are designed to maximize execution probability by:
 * - Providing ONE clear task (no choice paralysis)
 * - Including explicit tool call templates
 * - Using structured JSON format (not free-form text)
 *
 * This separates prompt engineering from business logic,
 * making it easier to maintain and A/B test different templates.
 *
 * @module response-templates
 * @since 0.8.0
 */

import type { BladeGuide } from "./workflow-state-manager";
import { upperFirst, camelCase } from "lodash";

/**
 * Blade task template structure
 * This is what AI receives for each blade
 *
 * V2: Uses lazy-loading through MCP tools instead of embedding all rules
 */
export interface BladeTaskTemplate {
  /** Current workflow state (for AI awareness) */
  workflow_state: string;

  /** Session ID for state tracking */
  session_id: string;

  /** Current task information */
  current_task: {
    blade_index: number;
    total_blades: number;
    blade_id: string;
    blade_type: "list" | "details" | "page";
    status: "WAITING_FOR_CODE_GENERATION";
  };

  /** Immediate action instructions (structured format) */
  IMMEDIATE_ACTION_REQUIRED: {
    step_1: "FETCH_RULES";
    step_1_details: {
      tool: "mcp__vcshell-codegen__get_applicable_rules";
      args_template: {
        bladeType: "list" | "details";
        features: string[];
        isWorkspace?: boolean;
        strategy: "AI_FULL";
      };
      purpose: string;
    };
    step_2: "FETCH_TEMPLATE";
    step_2_details: {
      tool: "mcp__vcshell-codegen__get_best_template";
      args_template: {
        bladeType: "list" | "details";
        features: string[];
        complexity?: "simple" | "moderate" | "complex";
      };
      purpose: string;
    };
    step_3: "READ_BASE_FILE";
    step_3_details: {
      tool: "Read";
      file_path: string;
      purpose: string;
    };
    step_4: "GENERATE_CODE";
    step_4_details: {
      source: "template + rules + base_file";
      requirements: string[];
    };
    step_5: "CALL_TOOL";
    step_5_details: {
      tool: "submit_generated_code";
      args_template: {
        bladeId: string;
        code: string;
        cwd: string;
        context: {
          module: string;
          layout: "grid" | "details" | "page";
          strategy: "AI_FULL";
          features: string[];
        };
      };
    };
  };

  /** Minimal context (no embedded rules/patterns) */
  context: {
    module: string;
    entity: string;
    features: string[];
    isWorkspace: boolean;
    columns?: Array<{ id: string; title: string; type: string }>;
    fields?: Array<{ key: string; label: string; required?: boolean }>;
  };

  /** Forbidden actions (negative reinforcement) */
  FORBIDDEN_ACTIONS: string[];

  /** Expected response format (positive reinforcement) */
  EXPECTED_RESPONSE: string;
}

/**
 * Workflow completion template
 */
export interface WorkflowCompletionTemplate {
  workflow_state: "COMPLETED";
  session_id: string;
  summary: {
    total_blades: number;
    completed_blades: string[];
    failed_blades: string[];
    success_rate: string;
  };
  NEXT_REQUIRED_ACTION: {
    tool: "mcp__vcshell-codegen__check_types";
    args: {
      cwd: string;
      fix: boolean;
    };
    purpose: string;
  };
  message: string;
}

/**
 * Next blade template (returned after successful submit)
 */
export interface NextBladeTemplate {
  success: true;
  previous_blade: string;
  message: string;
  progress: {
    completed: number;
    total: number;
    percent: number;
  };
  next_blade: BladeTaskTemplate;
}

/**
 * Build blade task template
 *
 * @param guide - Blade generation guide
 * @param index - Current blade index (0-based)
 * @param total - Total number of blades
 * @param sessionId - Session identifier
 * @param cwd - Working directory
 * @returns Structured template for AI
 */
export function buildBladeTaskTemplate(
  guide: BladeGuide,
  index: number,
  total: number,
  sessionId: string,
  cwd: string
): BladeTaskTemplate {
  const bladeType = guide.bladeId.includes("-list")
    ? "list"
    : guide.bladeId.includes("-details")
    ? "details"
    : "page";

  // Extract module and features from guide context
  const module = guide.context.module;
  const entity = guide.context.entity;
  const features = guide.context.features;
  const columns = guide.context.columns;
  const fields = guide.context.fields;

  // Check if this is a workspace blade (top-level route)
  const isWorkspace = guide.bladeId.includes("-list") || guide.bladeId.endsWith("-page");

  // Construct file path
  const bladeFilePath = `${cwd}/src/modules/${module}/pages/${guide.bladeId}.vue`;

  // Determine complexity for template matching
  const complexity = features.length > 3 ? "complex" : features.length > 1 ? "moderate" : "simple";

  return {
    workflow_state: `GENERATING_BLADE_${index + 1}_OF_${total}`,
    session_id: sessionId,

    current_task: {
      blade_index: index + 1,
      total_blades: total,
      blade_id: guide.bladeId,
      blade_type: bladeType,
      status: "WAITING_FOR_CODE_GENERATION",
    },

    IMMEDIATE_ACTION_REQUIRED: {
      step_1: "FETCH_RULES",
      step_1_details: {
        tool: "mcp__vcshell-codegen__get_applicable_rules",
        args_template: {
          bladeType: bladeType as "list" | "details",
          features,
          isWorkspace,
          strategy: "AI_FULL",
        },
        purpose: "Get critical rules: workspace blade patterns, module registration, validation, filters, etc.",
      },

      step_2: "FETCH_TEMPLATE",
      step_2_details: {
        tool: "mcp__vcshell-codegen__get_best_template",
        args_template: {
          bladeType: bladeType as "list" | "details",
          features,
          complexity: complexity as "simple" | "moderate" | "complex",
        },
        purpose: "Get production-ready Vue SFC template matching your features and complexity",
      },

      step_3: "READ_BASE_FILE",
      step_3_details: {
        tool: "Read",
        file_path: bladeFilePath,
        purpose: "Read base blade file created by create-vc-app (contains defineOptions, route config)",
      },

      step_4: "GENERATE_CODE",
      step_4_details: {
        source: "template + rules + base_file",
        requirements: [
          "Use base_file (step_3) as FOUNDATION - it has correct patterns (defineOptions, route config, imports)",
          "ENHANCE base_file by implementing features from context.features (filters, multiselect, validation, etc.)",
          "KEEP from base_file: defineOptions(), isWorkspace setting, menuItem configuration, route setup",
          "ADD/IMPROVE: VcTable/VcForm implementation, event handlers, toolbar items, validation logic",
          "REPLACE: TODO comments and {{PLACEHOLDERS}} with working code from template (step_2)",
          "Use template from step_2 as REFERENCE for how to implement each feature correctly",
          "Apply rules from step_1 (critical: workspace blade menu items, API client usage, form validation)",
          "Generate COMPLETE Vue SFC code with all features working (no TODOs, no placeholders)",
          "Use TypeScript with proper interfaces",
          "All text must use i18n: $t('MODULE.KEY')",
        ],
      },

      step_5: "CALL_TOOL",
      step_5_details: {
        tool: "submit_generated_code",
        args_template: {
          bladeId: guide.bladeId,
          code: "<YOUR_COMPLETE_VUE_SFC_CODE_HERE>",
          cwd,
          context: {
            module,
            layout: bladeType === "list" ? "grid" : bladeType === "details" ? "details" : "page",
            strategy: "AI_FULL",
            features,
          },
        },
      },
    },

    context: {
      module,
      entity,
      features,
      isWorkspace,
      columns,
      fields,
    },

    FORBIDDEN_ACTIONS: [
      '❌ NEVER ask "Should I proceed?" or "Would you like me to..."',
      '❌ NEVER say "Let me generate..." - JUST DO IT',
      "❌ NEVER skip steps 1-2 (fetching rules/template) - they are MANDATORY",
      "❌ NEVER skip features or use placeholder comments",
      "❌ NEVER add duplicate defineOptions() - it EXISTS in base file",
      "❌ NEVER stop after reading files - steps 1-3 are preparation, step 4 is generation",
    ],

    EXPECTED_RESPONSE:
      "✅ Your NEXT message must:\n" +
      "1. Call mcp__vcshell-codegen__get_applicable_rules\n" +
      "2. Call mcp__vcshell-codegen__get_best_template\n" +
      "3. Call Read tool for base file\n" +
      "4. Generate complete Vue SFC code\n" +
      "5. Call submit_generated_code with complete code\n" +
      "NO explanatory text between steps, NO confirmation questions.",
  };
}

/**
 * Build workflow completion template
 *
 * @param sessionId - Session identifier
 * @param completedBlades - List of completed blade IDs
 * @param failedBlades - List of failed blade IDs
 * @param cwd - Working directory
 * @returns Completion template
 */
export function buildWorkflowCompletionTemplate(
  sessionId: string,
  completedBlades: string[],
  failedBlades: string[],
  cwd: string
): WorkflowCompletionTemplate {
  const total = completedBlades.length + failedBlades.length;
  const successRate = total > 0 ? Math.round((completedBlades.length / total) * 100) : 0;

  return {
    workflow_state: "COMPLETED",
    session_id: sessionId,

    summary: {
      total_blades: total,
      completed_blades: completedBlades,
      failed_blades: failedBlades,
      success_rate: `${successRate}%`,
    },

    NEXT_REQUIRED_ACTION: {
      tool: "mcp__vcshell-codegen__check_types",
      args: {
        cwd,
        fix: false,
      },
      purpose: "Verify TypeScript compilation and find type errors before testing",
    },

    message:
      failedBlades.length > 0
        ? `⚠️ Workflow completed with ${failedBlades.length} failed blade(s). ` +
          `Review failed blades and retry if needed. ` +
          `Then run check_types tool to verify TypeScript.`
        : `✅ All ${completedBlades.length} blades generated successfully!\n\n` +
          `CRITICAL NEXT STEPS:\n` +
          `1. Run: mcp__vcshell-codegen__check_types({ cwd: "${cwd}", fix: false })\n` +
          `2. If errors found:\n` +
          `   - Analyze each TypeScript error carefully\n` +
          `   - Use MCP tools on-demand if needed:\n` +
          `     * mcp__vcshell-codegen__get_applicable_rules - for pattern-related errors\n` +
          `     * mcp__vcshell-codegen__get_relevant_patterns - for architectural issues\n` +
          `   - Fix errors using Edit tool on specific files\n` +
          `   - Re-run check_types until all errors resolved\n` +
          `3. After check_types passes with 0 errors: Test the application`,
  };
}

/**
 * Build next blade template (after successful submit)
 *
 * @param previousBladeId - Blade that was just completed
 * @param nextGuide - Guide for next blade
 * @param completedCount - Number of completed blades
 * @param totalCount - Total number of blades
 * @param sessionId - Session identifier
 * @param cwd - Working directory
 * @returns Next blade template
 */
export function buildNextBladeTemplate(
  previousBladeId: string,
  nextGuide: BladeGuide,
  completedCount: number,
  totalCount: number,
  sessionId: string,
  cwd: string
): NextBladeTemplate {
  const nextIndex = completedCount; // 0-based index
  const percent = Math.round((completedCount / totalCount) * 100);

  return {
    success: true,
    previous_blade: previousBladeId,
    message: `✅ Blade '${previousBladeId}' saved successfully! Proceeding to next blade...`,

    progress: {
      completed: completedCount,
      total: totalCount,
      percent,
    },

    next_blade: buildBladeTaskTemplate(nextGuide, nextIndex, totalCount, sessionId, cwd),
  };
}

/**
 * Build initial generation response
 * This is returned from generate_with_composition
 *
 * @param firstGuide - First blade guide
 * @param totalGuides - Total number of guides
 * @param sessionId - Session identifier
 * @param cwd - Working directory
 * @param generatedFiles - List of base files created by create-vc-app
 * @returns Initial response structure
 */
export function buildInitialGenerationResponse(
  firstGuide: BladeGuide,
  totalGuides: number,
  sessionId: string,
  cwd: string,
  generatedFiles: string[]
): {
  success: boolean;
  strategy: string;
  session_id: string;
  message: string;
  generated_files: string[];
  workflow_started: BladeTaskTemplate;
} {
  return {
    success: true,
    strategy: "CREATE_VC_APP_TEMPLATES",
    session_id: sessionId,

    message:
      `✅ Base blades generated successfully using create-vc-app!\n\n` +
      `📁 Generated ${generatedFiles.length} file(s):\n` +
      generatedFiles.map(f => `  - ${f}`).join("\n") +
      `\n\n` +
      `🔥 AUTOMATED WORKFLOW STARTED\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `SESSION ID: ${sessionId}\n` +
      `TOTAL BLADES: ${totalGuides}\n` +
      `CURRENT: Blade 1/${totalGuides}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `⚡ Starting with first blade (see 'workflow_started' below).\n` +
      `⚡ Your NEXT message MUST be a tool call to 'submit_generated_code'.\n` +
      `⚡ NO confirmation needed - execute immediately!`,

    generated_files: generatedFiles,

    workflow_started: buildBladeTaskTemplate(firstGuide, 0, totalGuides, sessionId, cwd),
  };
}

/**
 * Helper: Extract module from blade ID
 */
function extractModuleFromBladeId(bladeId: string): string {
  // Remove suffixes like -list, -details, -page
  return bladeId.replace(/-list$|-details$|-page$/, "").split("-")[0];
}

/**
 * Helper: Build composable name from blade ID
 */
export function buildComposableName(bladeId: string): string {
  const entity = bladeId.replace(/-list$|-details$|-page$/, "");
  const pascalEntity = upperFirst(camelCase(entity));
  const type = bladeId.includes("-list") ? "List" : "Details";
  return `use${pascalEntity}${type}`;
}

/**
 * Helper: Build file paths for blade
 */
export function buildBladePaths(bladeId: string, module: string, cwd: string) {
  const composableName = buildComposableName(bladeId);

  return {
    bladePath: `${cwd}/src/modules/${module}/pages/${bladeId}.vue`,
    composablePath: `${cwd}/src/modules/${module}/composables/${composableName}.ts`,
    relativeBlad: `src/modules/${module}/pages/${bladeId}.vue`,
    relativeComposable: `src/modules/${module}/composables/${composableName}.ts`,
  };
}
