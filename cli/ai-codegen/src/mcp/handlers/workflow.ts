/**
 * Workflow MCP Tool Handlers
 *
 * Handlers for workflow orchestration tools using NEW architecture.
 * 8 tools total:
 * 1. analyze_prompt_v2
 * 2. discover_components_and_apis
 * 3. create_ui_plan_from_analysis_v2
 * 4. validate_ui_plan
 * 5. generate_with_composition
 * 6. submit_generated_code
 * 7. get_workflow_status
 * 8. reset_workflow
 * 9. start_module_workflow (full workflow)
 */

import type { MCPServerContext } from "../context";
import type { ToolHandler } from "./types";

/**
 * 1. analyze_prompt_v2
 * Generate analysis prompt and schema for AI to analyze
 *
 * This tool does NOT perform analysis - it returns instructions for AI.
 * AI should analyze the prompt and call discover_components_and_apis with results.
 */
export const analyzePromptV2Handler: ToolHandler = async (params, context) => {
  const { prompt, module } = params;
  const { orchestrator } = context;

  try {
    const result = await orchestrator.executeStep("analyzing" as any, {
      prompt,
      module,
    });

    if (!result.success) {
      return {
        success: false,
        errors: result.errors || ["Analysis failed"],
      };
    }

    return {
      success: true,
      analysisPrompt: result.data?._analysisPrompt,
      analysisSchema: result.data?._analysisSchema,
      warnings: result.warnings || [],
      message: "Analysis prompt generated. AI should now analyze the prompt and call discover_components_and_apis.",
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Unknown error during analysis"],
    };
  }
};

/**
 * 2. discover_components_and_apis
 * Semantic search for relevant components and framework APIs based on analysis
 *
 * This tool receives the AI-generated analysis and discovers relevant components.
 * The analysis is automatically saved to workflow state by the orchestrator.
 */
export const discoverComponentsAndAPIsHandler: ToolHandler = async (params, context) => {
  const { analysis: rawAnalysis } = params;
  const { orchestrator } = context;

  try {
    // Parse analysis if it's a JSON string
    let analysis = rawAnalysis;
    if (typeof rawAnalysis === "string") {
      try {
        analysis = JSON.parse(rawAnalysis);
      } catch (parseError) {
        return {
          success: false,
          errors: ["Invalid analysis: must be a valid JSON object or JSON string"],
        };
      }
    }

    // Execute discovery step
    // The orchestrator will automatically save analysis to state via result.data
    const result = await orchestrator.executeStep("discovering" as any, {
      analysis,
    });

    if (!result.success) {
      return {
        success: false,
        errors: result.errors || ["Discovery failed"],
      };
    }

    return {
      success: true,
      analysis, // Include parsed analysis in response
      discoveredComponents: result.data?.discoveredComponents || [],
      discoveredAPIs: result.data?.discoveredAPIs || [],
      message: "Components and APIs discovered successfully. Next: create_ui_plan_from_analysis_v2",
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Unknown error during discovery"],
    };
  }
};

/**
 * 3. create_ui_plan_from_analysis_v2
 * Create UI-Plan from analysis with discovered components
 */
export const createUIPlanFromAnalysisV2Handler: ToolHandler = async (params, context) => {
  const { analysis: rawAnalysis } = params;
  const { orchestrator } = context;

  try {
    // Parse analysis if it's a JSON string
    let analysis = rawAnalysis;
    if (typeof rawAnalysis === "string") {
      try {
        analysis = JSON.parse(rawAnalysis);
      } catch (parseError) {
        return {
          success: false,
          errors: ["Invalid analysis: must be a valid JSON object or JSON string"],
        };
      }
    }

    // Get discovered components from state
    const state = orchestrator.getState();

    const result = await orchestrator.executeStep("planning" as any, {
      analysis,
      discoveredComponents: state.discoveredComponents || [],
      discoveredAPIs: state.discoveredAPIs || [],
    });

    if (!result.success) {
      return {
        success: false,
        errors: result.errors || ["UI-Plan creation failed"],
      };
    }

    return {
      success: true,
      plan: result.data?.plan,
      message: "UI-Plan created successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Unknown error during planning"],
    };
  }
};

/**
 * 4. validate_ui_plan
 * Validate UI-Plan against schema and component registry
 */
export const validateUIPlanHandler: ToolHandler = async (params, context) => {
  const { plan: rawPlan } = params;
  const { orchestrator } = context;

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

    const result = await orchestrator.executeStep("validating" as any, {
      plan,
    });

    if (!result.success) {
      return {
        success: false,
        errors: result.errors || ["Validation failed"],
        validationResult: result.data?.validationResult,
      };
    }

    return {
      success: true,
      validationResult: result.data?.validationResult,
      message: "UI-Plan is valid",
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Unknown error during validation"],
    };
  }
};

/**
 * 5. generate_with_composition
 * Generate enriched guides for AI code generation
 */
export const generateWithCompositionHandler: ToolHandler = async (params, context) => {
  const { plan: rawPlan, cwd, bladeId, dryRun = false } = params;
  const { orchestrator } = context;

  try {
    // Parse plan if it's a JSON string
    let planFromParams = rawPlan;
    if (typeof rawPlan === "string") {
      try {
        planFromParams = JSON.parse(rawPlan);
      } catch (parseError) {
        // If parsing fails, will try to use state plan
        planFromParams = null;
      }
    }

    // Use plan from params or workflow state
    const state = orchestrator.getState();
    const effectivePlan = planFromParams || state.plan;

    if (!effectivePlan) {
      return {
        success: false,
        errors: ["No UI-Plan provided and no plan in workflow state"],
      };
    }

    const result = await orchestrator.executeStep("generating" as any, {
      plan: effectivePlan,
      cwd,
      bladeId,
    });

    if (!result.success) {
      return {
        success: false,
        errors: result.errors || ["Guide generation failed"],
      };
    }

    // Next step: AI Code Generation
    const aiResult = await orchestrator.executeStep("ai-codegen" as any, {
      guides: result.data?.generationGuides || [],
    });

    if (!aiResult.success) {
      return {
        success: false,
        errors: aiResult.errors || ["AI prompt generation failed"],
      };
    }

    return {
      success: true,
      generationGuides: result.data?.generationGuides || [],
      aiPrompts: aiResult.data?.aiPrompts || [],
      requiresAI: true,
      message: dryRun
        ? "Dry run: Generation guides created (no files written)"
        : "Generation guides ready for AI",
      instructions: "Send these AI prompts to Claude/GPT to generate code, then use submit_generated_code",
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Unknown error during generation"],
    };
  }
};

/**
 * 6. submit_generated_code
 * Submit AI-generated code for validation
 */
export const submitGeneratedCodeHandler: ToolHandler = async (params, context) => {
  const { bladeId, code, composable, apiClient, context: codeContext, retry } = params;
  const { orchestrator } = context;

  try {
    const generatedCode = [{
      bladeId,
      blade: { path: "", content: code },
      composable: composable ? { path: "", content: composable.code } : undefined,
      apiClient: apiClient ? { path: "", content: apiClient.code } : undefined,
    }];

    const result = await orchestrator.executeStep("code-validation" as any, {
      generatedCode,
      retryCount: retry?.attempt || 0,
    });

    if (!result.success) {
      // Check if retry is needed
      if (result.data?.needsRetry) {
        return {
          success: false,
          needsRetry: true,
          retryCount: result.data.retryCount,
          validationErrors: result.data.validationErrors,
          message: `Code validation failed. Retry ${result.data.retryCount}/3`,
        };
      }

      return {
        success: false,
        errors: result.errors || ["Code validation failed after max retries"],
      };
    }

    // Submit validated code
    const submitResult = await orchestrator.executeStep("submitting" as any, {
      validatedCode: result.data?.validatedCode,
    });

    if (!submitResult.success) {
      return {
        success: false,
        errors: submitResult.errors || ["Code submission failed"],
      };
    }

    return {
      success: true,
      validatedCode: result.data?.validatedCode,
      message: "Code validated and submitted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Unknown error during code submission"],
    };
  }
};

/**
 * 7. get_workflow_status
 * Get current workflow status and next required step
 */
export const getWorkflowStatusHandler: ToolHandler = async (_params, context) => {
  const { orchestrator } = context;

  try {
    const status = orchestrator.getStatus();
    const state = orchestrator.getState();

    return {
      success: true,
      status,
      state: {
        currentStep: state.currentStep,
        hasAnalysis: !!state.analysis,
        hasDiscoveredComponents: !!state.discoveredComponents,
        hasPlan: !!state.plan,
        hasValidationResult: !!state.validationResult,
        hasGenerationGuides: !!state.generationGuides,
        errors: state.errors || [],
      },
      message: "Workflow status retrieved",
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Unknown error retrieving status"],
    };
  }
};

/**
 * 8. reset_workflow
 * Reset workflow state to initial
 */
export const resetWorkflowHandler: ToolHandler = async (_params, context) => {
  const { orchestrator } = context;

  try {
    orchestrator.reset();

    return {
      success: true,
      message: "Workflow reset to initial state",
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Unknown error during reset"],
    };
  }
};

/**
 * 9. start_module_workflow
 * Execute complete workflow from prompt to generation guides
 */
export const startModuleWorkflowHandler: ToolHandler = async (params, context) => {
  const { prompt, cwd, module } = params;
  const { orchestrator } = context;

  try {
    const result = await orchestrator.executeWorkflow({
      prompt,
      cwd,
      module,
    });

    if (!result.success) {
      return {
        success: false,
        errors: result.errors || ["Workflow execution failed"],
        state: orchestrator.getState(),
      };
    }

    return {
      success: true,
      state: result.data,
      message: "Module workflow completed successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Unknown error during workflow execution"],
    };
  }
};

/**
 * Export all workflow handlers
 */
export const workflowHandlers = {
  analyze_prompt_v2: analyzePromptV2Handler,
  discover_components_and_apis: discoverComponentsAndAPIsHandler,
  create_ui_plan_from_analysis_v2: createUIPlanFromAnalysisV2Handler,
  validate_ui_plan: validateUIPlanHandler,
  generate_with_composition: generateWithCompositionHandler,
  submit_generated_code: submitGeneratedCodeHandler,
  get_workflow_status: getWorkflowStatusHandler,
  reset_workflow: resetWorkflowHandler,
  start_module_workflow: startModuleWorkflowHandler,
};
