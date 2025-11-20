/**
 * Workflow Orchestrator
 * Ensures AI follows correct sequence for module generation
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export type WorkflowStep =
  | "init" // Initial state
  | "analyzed" // After analyze_prompt_v2
  | "planned" // After create_ui_plan_from_analysis_v2
  | "validated" // After validate_ui_plan or validate_and_fix_plan
  | "generated" // After generate_with_composition
  | "code_submitted" // After submit_generated_code
  | "completed"; // After check_types or module fully complete

export interface WorkflowState {
  step: WorkflowStep;
  cwd?: string; // Working directory for the current workflow
  analysis?: any;
  plan?: any;
  generatedGuides?: any;
  errors?: string[];
  canProceed: boolean;
  nextStep: string;
  requiredTool?: string;
}

// Persistent state file location
const STATE_FILE = path.join(os.tmpdir(), ".vc-shell-workflow-state.json");

/**
 * Tool categories for workflow enforcement
 */
const TOOL_CATEGORIES = {
  // App scaffolding (independent workflow)
  scaffolding: ["scaffold_app", "generate_widget"],

  // Main workflow tools (strict sequence)
  workflow_critical: [
    "analyze_prompt_v2", // Step 1: MANDATORY
    "create_ui_plan_from_analysis_v2", // Step 2: Requires analysis
    "validate_ui_plan", // Step 3a: Validate plan
    "validate_and_fix_plan", // Step 3b: Validate + fix plan
    "generate_with_composition", // Step 4: Generate with AI_FULL
    "submit_generated_code", // Step 5: Submit AI-written code
  ],

  // Discovery/Research (always available)
  discovery: [
    // Component discovery
    "search_components",
    "view_components",
    "get_component_examples",
    "search_components_by_intent",
    "get_component_capabilities",
    // Framework API discovery
    "search_framework_apis",
    "view_framework_apis",
    "search_framework_by_intent",
    "get_framework_capabilities",
    "get_framework_examples",
  ],

  // Workflow management (always available)
  workflow_management: ["get_workflow_status", "start_module_workflow"],

  // Post-generation quality checks (after code generation)
  quality_checks: ["check_types"],
};

export class WorkflowOrchestrator {
  private state: WorkflowState = {
    step: "init",
    canProceed: false,
    nextStep: "Start by analyzing the user prompt using analyze_prompt_v2 tool",
  };

  constructor() {
    // Load persisted state on initialization
    this.loadState();
  }

  /**
   * Load workflow state from disk
   */
  private loadState() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const data = fs.readFileSync(STATE_FILE, "utf-8");
        this.state = JSON.parse(data);
      }
    } catch (error) {
      // If loading fails, use default state
      console.error("Failed to load workflow state:", error);
    }
  }

  /**
   * Save workflow state to disk
   */
  private saveState() {
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to save workflow state:", error);
    }
  }

  /**
   * Check if workflow can proceed to next step
   */
  canExecuteTool(toolName: string): { allowed: boolean; reason?: string; nextStep?: string } {
    // 1. Always allowed tools
    if (
      TOOL_CATEGORIES.discovery.includes(toolName) ||
      TOOL_CATEGORIES.workflow_management.includes(toolName) ||
      TOOL_CATEGORIES.scaffolding.includes(toolName)
    ) {
      return { allowed: true };
    }

    // 2. Quality checks - allowed after code submission
    if (TOOL_CATEGORIES.quality_checks.includes(toolName)) {
      if (["init", "analyzed", "planned", "validated", "generated"].includes(this.state.step)) {
        return {
          allowed: false,
          reason: `${toolName} can only be used after code submission. Submit code using submit_generated_code first.`,
          nextStep: this.getNextStepSuggestion(),
        };
      }
      return { allowed: true };
    }

    // 4. Workflow-critical tools - strict sequence enforcement
    const transitions: Record<
      string,
      {
        allowedFrom: WorkflowStep[];
        nextState: WorkflowStep;
      }
    > = {
      // Step 1: Analysis (MANDATORY FIRST)
      // Note: analyze_prompt_v2 returns INSTRUCTIONS only, doesn't change state
      // State changes to "analyzed" only when AI provides actual analysis JSON
      analyze_prompt_v2: {
        allowedFrom: ["init"],
        nextState: "init", // Don't change state - only return instructions
      },

      // Step 2: UI-Plan creation (REQUIRES ANALYSIS OR can work from init with inline analysis)
      // Note: This tool validates the plan internally, so it goes directly to "validated" state
      create_ui_plan_from_analysis_v2: {
        allowedFrom: ["init", "analyzed"], // Can accept inline analysis from init
        nextState: "validated", // Changed from "planned" - plan is validated during creation
      },

      // Step 3: Validation (can validate from init if plan provided, or from planned/validated)
      validate_ui_plan: {
        allowedFrom: ["init", "planned", "validated"], // Allow from init with provided plan
        nextState: "validated",
      },

      validate_and_fix_plan: {
        allowedFrom: ["init", "planned", "validated"], // Allow from init with provided plan
        nextState: "validated",
      },

      // Step 4: Generation (REQUIRES VALIDATED PLAN)
      // Allow retry from generated state if generation needs to be redone
      generate_with_composition: {
        allowedFrom: ["validated", "generated"],
        nextState: "generated",
      },

      // Step 5: Code submission (AFTER generation, AI writes code then submits)
      submit_generated_code: {
        allowedFrom: ["generated", "code_submitted"], // Allow from generated (AI writes code) or retry
        nextState: "code_submitted",
      },

      // Step 6: Type checking (OPTIONAL after code submission for verification)
      check_types: {
        allowedFrom: ["code_submitted", "completed"],
        nextState: "completed", // Type check completes the workflow
      },
    };

    const transition = transitions[toolName];

    if (!transition) {
      // Unknown tool, allow (might be a new tool)
      return { allowed: true };
    }

    const allowed = transition.allowedFrom.includes(this.state.step);

    if (!allowed) {
      const reason = this.getBlockedReason(toolName);
      const nextStep = this.getNextStepSuggestion();

      return {
        allowed: false,
        reason,
        nextStep,
      };
    }

    return { allowed: true };
  }

  /**
   * Update workflow state after tool execution
   */
  updateState(toolName: string, result: any, args?: any) {
    // ⚠️ IMPORTANT: analyze_prompt_v2 returns INSTRUCTIONS, not analysis result
    // It does NOT change workflow state - only provides guidance to AI

    // Store cwd from args if provided (for generate_with_composition, submit_generated_code, check_types)
    if (args?.cwd && typeof args.cwd === 'string') {
      this.state.cwd = args.cwd;
    }

    const stateTransitions: Record<string, WorkflowStep> = {
      // analyze_prompt_v2: Intentionally NOT here - returns instructions only, no state change
      create_ui_plan_from_analysis_v2: "validated", // Changed: goes directly to validated (plan is validated during creation)
      validate_ui_plan: "validated",
      validate_and_fix_plan: "validated",
      generate_with_composition: "generated",
      submit_generated_code: "code_submitted", // Submit code after generation
      check_types: "completed", // Type check completes the workflow
    };

    // Special handling for create_ui_plan_from_analysis_v2
    if (toolName === "create_ui_plan_from_analysis_v2") {
      // Extract plan from result - it's nested in content[0].text as JSON string
      let planData = result;
      if (result.content && Array.isArray(result.content) && result.content[0]?.text) {
        try {
          planData = JSON.parse(result.content[0].text);
        } catch {
          // If parsing fails, use result as-is
        }
      }

      // Store the actual plan object
      this.state.plan = planData.plan || planData;
      // Analysis is implicitly completed when plan is created
      this.state.analysis = { completed: true, inline: true };

      // Plan is validated during creation, set state to "validated"
      // (The tool only returns success if validation passes)
      if (planData.validation?.valid === true || planData.valid === true) {
        this.state.step = "validated";
        this.state.canProceed = true;
        this.state.nextStep = this.getNextStepSuggestion();
        this.saveState();
        return;
      }
    }

    const nextState = stateTransitions[toolName];
    if (nextState) {
      this.state.step = nextState;
      this.state.canProceed = true;
      this.state.nextStep = this.getNextStepSuggestion();

      // Store results
      if (toolName === "generate_with_composition") {
        this.state.generatedGuides = result;
      }

      // Store plan from validate_ui_plan or validate_and_fix_plan
      if (toolName === "validate_ui_plan" || toolName === "validate_and_fix_plan") {
        // Extract plan from result
        let planData = result;
        if (result.content && Array.isArray(result.content) && result.content[0]?.text) {
          try {
            planData = JSON.parse(result.content[0].text);
          } catch {
            // If parsing fails, use result as-is
          }
        }

        // Store the plan if it's in the result
        if (planData.plan) {
          this.state.plan = planData.plan;
        } else if (planData.fixedPlan) {
          // validate_and_fix_plan returns fixedPlan
          this.state.plan = planData.fixedPlan;
        }
      }

      // Persist state to disk
      this.saveState();
    }
  }

  /**
   * Get current workflow state
   */
  getState(): WorkflowState {
    return { ...this.state };
  }

  /**
   * Reset workflow (for new module)
   */
  reset() {
    this.state = {
      step: "init",
      canProceed: false,
      nextStep: "Start by analyzing the user prompt using analyze_prompt_v2 tool",
    };

    // Remove persisted state file
    try {
      if (fs.existsSync(STATE_FILE)) {
        fs.unlinkSync(STATE_FILE);
      }
    } catch (error) {
      console.error("Failed to delete workflow state file:", error);
    }
  }

  /**
   * Get detailed blocked reason for specific tool
   */
  private getBlockedReason(toolName: string): string {
    const reasons: Record<string, Partial<Record<WorkflowStep, string>>> = {
      analyze_prompt_v2: {
        analyzed: "Prompt already analyzed. Proceed to create_ui_plan_from_analysis_v2.",
        planned: "Already past analysis step. UI-Plan created.",
        validated: "Already past analysis step. UI-Plan validated.",
        generated: "Already past analysis step. Code guides generated.",
        code_submitted: "Already past analysis step. Code submitted.",
        completed: "Module already completed. Use reset for new module.",
      },
      create_ui_plan_from_analysis_v2: {
        // Removed init block - now allowed from init with inline analysis
        // Removed planned block - state goes directly to "validated" after plan creation
        validated: "UI-Plan already created and validated. Proceed to generation.",
        generated: "Already past planning step.",
        code_submitted: "Already past planning step.",
        completed: "Module already completed.",
      },
      validate_ui_plan: {
        // Removed init/analyzed blocks - now allowed with provided plan
      },
      validate_and_fix_plan: {
        // Removed init/analyzed blocks - now allowed with provided plan
      },
      generate_with_composition: {
        init: "Cannot generate without validated UI-Plan. Sequence: analyze → create plan (with auto-validation) → generate.",
        analyzed: "Cannot generate without UI-Plan. Run create_ui_plan_from_analysis_v2 first (includes validation).",
        // Removed "planned" state - create_ui_plan_from_analysis_v2 now goes directly to "validated"
      },
      submit_generated_code: {
        init: "Cannot submit code without generation. Complete workflow first.",
        analyzed: "Cannot submit code without generation. Create UI-Plan first (includes validation).",
        // Removed "planned" state - no longer exists in workflow
        validated:
          "Cannot submit code without generation. Run generate_with_composition first to get code generation guides.",
        completed: "Code already submitted and workflow completed. Use reset to start new module.",
      },
      check_types: {
        init: "Cannot check types before code is submitted. Complete workflow first.",
        analyzed: "Cannot check types before code is submitted.",
        validated: "Cannot check types before code is submitted. Generate and submit code first.",
        generated: "Cannot check types before code is submitted. Submit code using submit_generated_code first.",
      },
    };

    return (
      reasons[toolName]?.[this.state.step] ||
      `Tool ${toolName} cannot be executed at step ${this.state.step}`
    );
  }

  /**
   * Get next step suggestion based on current state
   */
  private getNextStepSuggestion(): string {
    const suggestions: Record<WorkflowStep, string> = {
      init: "Option 1: Use analyze_prompt_v2 to get analysis instructions, then manually create analysis JSON and call create_ui_plan_from_analysis_v2. Option 2: Directly call create_ui_plan_from_analysis_v2 with inline analysis JSON.",
      analyzed:
        "Use create_ui_plan_from_analysis_v2 to create and validate UI-Plan from the analysis result",
      planned:
        "⚠️ DEPRECATED STATE - This should not occur. Plan creation now goes directly to 'validated' state.",
      validated:
        "Use generate_with_composition to generate AI instructions for code writing",
      generated:
        "Read the generation guide, write Vue SFC code following the instructions, then use submit_generated_code to save and validate the code",
      code_submitted:
        "Code submitted successfully! Optionally use check_types to verify TypeScript types, or start a new blade/module",
      completed:
        "Module generation completed! Use check_types for final verification or use reset_workflow to start a new module",
    };

    return suggestions[this.state.step] || "Unknown state";
  }

  /**
   * Get workflow progress (0-100%)
   */
  getProgress(): number {
    const progressMap: Record<WorkflowStep, number> = {
      init: 0,
      analyzed: 20,
      planned: 40,
      validated: 60,
      generated: 80,
      code_submitted: 90,
      completed: 100,
    };

    return progressMap[this.state.step] || 0;
  }

  /**
   * Check if specific tool category is available at current step
   */
  isToolCategoryAvailable(category: keyof typeof TOOL_CATEGORIES): boolean {
    // Discovery and workflow management always available
    if (category === "discovery" || category === "workflow_management") {
      return true;
    }

    // Scaffolding always available
    if (category === "scaffolding") {
      return true;
    }

    // Quality checks available after code submission
    if (category === "quality_checks") {
      return ["code_submitted", "completed"].includes(this.state.step);
    }

    return true;
  }
}

/**
 * Global workflow orchestrator instance
 * Used by MCP server to enforce workflow
 */
export const globalWorkflow = new WorkflowOrchestrator();
