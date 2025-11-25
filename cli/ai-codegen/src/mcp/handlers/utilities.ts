/**
 * Utility MCP Tool Handlers
 *
 * Handlers for utility tools using NEW architecture.
 * 4 tools total:
 * 1. scaffold_app
 * 2. generate_widget
 * 3. check_types
 * 4. validate_and_fix_plan
 */

import fs from "node:fs";
import path from "node:path";
import type { MCPServerContext } from "../context";
import type { ToolHandler } from "./types";

/**
 * 1. scaffold_app
 * Create a new VC-Shell application from scratch using execa + tsx
 */
export const scaffoldAppHandler: ToolHandler = async (params, context) => {
  const { projectName, targetDirectory } = params;
  const { rootPath } = context;

  const targetDir = targetDirectory || process.cwd();
  const projectPath = path.join(targetDir, projectName);

  // Check if directory already exists
  if (fs.existsSync(projectPath)) {
    return {
      success: false,
      errors: [`Directory '${projectName}' already exists`],
      suggestion: "Choose a different project name or remove existing directory",
    };
  }

  try {
    // Import execa dynamically
    const { execa } = await import("execa");

    // Run create-vc-app in non-interactive mode
    console.error(`[scaffold_app] Creating VC-Shell app: ${projectName}...`);

    await execa(
      "npx",
      [
        "tsx",
        path.resolve(rootPath, "create-vc-app", "src", "index.ts"),
        projectName,
        "--skip-module-gen",
        "--overwrite",
      ],
      {
        cwd: targetDir,
        stdio: "pipe",
      },
    );

    return {
      success: true,
      projectName,
      projectPath,
      message: `VC-Shell app '${projectName}' created successfully`,
      nextStep: "Use start_module_workflow to generate modules",
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Failed to scaffold app"],
    };
  }
};

/**
 * 2. generate_widget
 * Generate a widget component using execa + tsx
 */
export const generateWidgetHandler: ToolHandler = async (params, context) => {
  const { cwd, module, blade, widgetName, entityName, icon } = params;
  const { rootPath } = context;

  // Validate cwd exists
  if (!fs.existsSync(cwd)) {
    return {
      success: false,
      errors: [`Directory does not exist: ${cwd}`],
    };
  }

  // Validate it's a VC-Shell project
  const packageJsonPath = path.join(cwd, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return {
      success: false,
      errors: [`Not a valid project directory (missing package.json): ${cwd}`],
    };
  }

  try {
    // Import execa and lodash dynamically
    const { execa } = await import("execa");
    const { kebabCase } = await import("lodash-es");

    const args = [
      "@vc-shell/create-vc-app",
      "blade",
      "--widget",
      "--widget-module",
      module,
      "--widget-blade",
      blade,
      "--widget-name",
      widgetName,
    ];

    if (entityName) {
      args.push("--widget-entity", entityName);
    }

    if (icon) {
      args.push("--widget-icon", icon);
    }

    console.error(`[generate_widget] Running: npx ${args.join(" ")}`);

    await execa("npx", args, {
      cwd: cwd,
      stdio: "pipe",
    });

    const widgetFileName = kebabCase(widgetName);
    const widgetPath = path.join(cwd, "src", "modules", module, "components", "widgets", `${widgetFileName}.vue`);

    return {
      success: true,
      module,
      blade,
      widgetName,
      widgetPath,
      message: `Widget '${widgetName}' generated successfully for ${module}/${blade}`,
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Failed to generate widget"],
    };
  }
};

/**
 * 3. check_types
 * Run vue-tsc type checking on the project
 */
export const checkTypesHandler: ToolHandler = async (params, context) => {
  const { cwd, fix = false } = params;

  try {
    // Run vue-tsc directly using execa
    const { execa } = await import("execa");

    try {
      const result = await execa("npx", ["vue-tsc", "--noEmit"], {
        cwd,
        stdio: "pipe",
      });

      return {
        success: true,
        message: "No type errors found",
        cwd,
      };
    } catch (error: any) {
      // vue-tsc exits with non-zero on errors
      const output = error.stdout || error.stderr || "";
      const errorLines = output
        .split("\n")
        .filter((line: string) => line.includes("error TS") || line.includes("): error"));

      return {
        success: false,
        errors: errorLines.length > 0 ? errorLines.slice(0, 50) : ["Type checking failed"],
        errorCount: errorLines.length,
        cwd,
        message: `Found ${errorLines.length} type errors`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Type checking failed"],
    };
  }
};

/**
 * 4. validate_and_fix_plan
 * Validate UI-Plan and suggest fixes for errors
 *
 * NOTE: This uses workflow orchestrator to update workflow state.
 * If validation succeeds, workflow advances to "validating" state.
 */
export const validateAndFixPlanHandler: ToolHandler = async (params, context) => {
  const { plan: rawPlan } = params;
  const { uiPlanValidator, orchestrator } = context;

  try {
    // Parse plan if it's a JSON string
    let plan = rawPlan;
    if (typeof rawPlan === "string") {
      try {
        plan = JSON.parse(rawPlan);
      } catch (parseError) {
        return {
          success: false,
          errors: ["Invalid plan: must be a valid JSON object or JSON string"],
        };
      }
    }

    // Validate plan using UIPlanValidator (more detailed than workflow validator)
    const validationResult = await uiPlanValidator.validate(plan);

    if (validationResult.valid) {
      // Update workflow state via orchestrator
      // This advances the workflow to "validating" state
      const workflowResult = await orchestrator.executeStep("validating" as any, {
        plan,
      });

      return {
        success: true,
        plan,
        validationResult,
        workflowUpdated: workflowResult.success,
        message: "UI-Plan is valid, no fixes needed. Workflow advanced to 'validating' state.",
      };
    }

    // UIPlanValidator doesn't have autoFix - just return validation errors
    // with suggestions for common issues
    const errors = validationResult.errors || [];
    const suggestions = errors.map((error: any) => {
      const suggestion: any = {
        path: error.path || "unknown",
        error: error.message || String(error),
      };

      // Add common fix suggestions based on error patterns
      if (error.message?.includes("required")) {
        suggestion.fix = "Add the required field to the plan";
      } else if (error.message?.includes("invalid")) {
        suggestion.fix = "Check the field value against schema";
      } else if (error.message?.includes("component")) {
        suggestion.fix = "Verify component exists in registry";
      }

      return suggestion;
    });

    return {
      success: false,
      plan,
      validationResult,
      errors: errors.map((e: any) => e.message || String(e)),
      suggestions,
      message: `UI-Plan validation failed with ${errors.length} error(s). Manual fixes required.`,
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Validation failed"],
    };
  }
};

/**
 * Export all utility handlers
 */
export const utilityHandlers = {
  scaffold_app: scaffoldAppHandler,
  generate_widget: generateWidgetHandler,
  check_types: checkTypesHandler,
  validate_and_fix_plan: validateAndFixPlanHandler,
};
