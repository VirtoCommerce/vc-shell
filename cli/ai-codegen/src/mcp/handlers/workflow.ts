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
import { validateCwdForGeneration } from "../../utils/app-detector";

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

    // Extract component and API names for easy reference
    const componentNames = (result.data?.discoveredComponents || []).map((c: any) => c.name);
    const apiNames = (result.data?.discoveredAPIs || []).map((a: any) => a.name);

    return {
      success: true,
      analysis, // Include parsed analysis in response
      // LIGHTWEIGHT discovery results - use view_components/view_framework_apis for full details
      discoveredComponents: result.data?.discoveredComponents || [],
      discoveredAPIs: result.data?.discoveredAPIs || [],
      // Summary for quick reference
      summary: {
        componentsCount: componentNames.length,
        apisCount: apiNames.length,
        componentNames,
        apiNames,
      },
      message: "Components and APIs discovered successfully. Next: create_ui_plan_from_analysis_v2",
      hint: "Discovery returns lightweight metadata. Use view_components([...]) or view_framework_apis([...]) if you need full props/events/methods details.",
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
 * Generate enriched guides for AI code generation with pagination support
 */
export const generateWithCompositionHandler: ToolHandler = async (params, context) => {
  const {
    plan: rawPlan,
    cwd,
    bladeId,
    artifactType,
    contextLevel,
    dryRun = false,
  } = params;
  const { orchestrator } = context;

  try {
    // Validate cwd - must be a valid VC-Shell project
    const cwdValidation = validateCwdForGeneration(cwd);
    if (!cwdValidation.valid) {
      return {
        success: false,
        needsApp: true,
        errors: cwdValidation.errors,
        warnings: cwdValidation.warnings,
        appInfo: cwdValidation.appInfo,
        suggestedAction: cwdValidation.suggestedAction,
        message: cwdValidation.suggestedAction
          ? `No valid VC-Shell app found. ${cwdValidation.suggestedAction.description}`
          : "No valid VC-Shell app found at the specified path.",
      };
    }

    // Parse plan if it's a JSON string
    let planFromParams = rawPlan;
    if (typeof rawPlan === "string") {
      try {
        planFromParams = JSON.parse(rawPlan);
      } catch (parseError) {
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

    // Save validated cwd to workflow state
    orchestrator.updateState({ cwd: cwdValidation.cwd });

    // SMART DEFAULTS: Auto-optimize based on module size
    const totalBlades = effectivePlan.blades?.length || 0;
    const isLargeModule = totalBlades > 2;

    // Determine effective parameters with smart defaults
    const effectiveBladeId = bladeId || (isLargeModule ? effectivePlan.blades[0]?.id : undefined);
    const effectiveArtifactType = artifactType || (isLargeModule ? "blade" : "all");
    const effectiveContextLevel = contextLevel || "essential";

    // Build smart defaults info for response
    const smartDefaults = {
      applied: !bladeId && !artifactType,
      moduleSize: isLargeModule ? "large" : "small",
      reason: isLargeModule
        ? `Module has ${totalBlades} blades - using paginated generation`
        : `Module has ${totalBlades} blades - using single-pass generation`,
      effectiveParams: {
        bladeId: effectiveBladeId,
        artifactType: effectiveArtifactType,
        contextLevel: effectiveContextLevel,
      },
    };

    // Execute generation step with pagination params
    const result = await orchestrator.executeStep("generating" as any, {
      plan: effectivePlan,
      cwd,
      bladeId: effectiveBladeId,
      artifactType: effectiveArtifactType,
      contextLevel: effectiveContextLevel,
    });

    if (!result.success) {
      return {
        success: false,
        errors: result.errors || ["Guide generation failed"],
      };
    }

    // Check if queue is empty (all guides generated or all blades submitted)
    if (result.data?.queueEmpty) {
      // Queue empty but NOT necessarily complete - check completedBlades
      const completedBlades = state.completedBlades || [];
      const totalBlades = effectivePlan.blades?.length || 0;
      const actuallyComplete = completedBlades.length >= totalBlades;

      return {
        success: true,
        queueEmpty: true,
        allComplete: actuallyComplete,
        completedBlades,
        totalBlades,
        message: actuallyComplete
          ? "All artifacts have been generated and submitted successfully!"
          : `Generation queue is empty. ${completedBlades.length}/${totalBlades} blades submitted. Check if all blades have been generated and submitted.`,
        hint: !actuallyComplete
          ? "Some blades may not have been submitted yet. Use submit_generated_code for remaining blades."
          : undefined,
      };
    }

    // Extract pagination response
    const paginationResponse = result.data;

    // Update state with pagination info
    if (paginationResponse?.pagination) {
      orchestrator.updateState({
        pagination: {
          currentBladeId: paginationResponse.pagination.current.bladeId,
          currentArtifactType: paginationResponse.pagination.current.artifactType,
          queue: paginationResponse.guide ? [
            { bladeId: paginationResponse.pagination.current.bladeId, artifactType: paginationResponse.pagination.current.artifactType },
          ] : [],
          contextLevel: effectiveContextLevel,
        },
      });
    }

    // Build response message
    const guide = paginationResponse?.guide;
    const pagination = paginationResponse?.pagination;

    const messageLines = [
      dryRun ? "🔍 DRY RUN MODE" : "📦 GENERATION GUIDE READY",
      "",
      `## Current Artifact: ${guide?.artifactType?.toUpperCase()} - ${guide?.bladeId}`,
      `- Module: ${guide?.module}`,
      `- Entity: ${guide?.entity}`,
      `- Type: ${guide?.bladeType} blade`,
      `- Features: ${guide?.features?.join(", ") || "none"}`,
      `- Target: ${guide?.targetPath}`,
      "",
      `## Progress: ${pagination?.completed || 0}/${pagination?.total?.totalArtifacts || 0} artifacts`,
      `- Remaining: ${pagination?.remaining || 0}`,
      "",
      "## Context Level: " + (guide?.context?.level || "essential").toUpperCase(),
      guide?.context?.template ? "✅ Template included" : "❌ Template not included (use get_best_template)",
      guide?.context?.topPatterns?.length ? `✅ ${guide.context.topPatterns.length} patterns included` : "❌ Patterns not included (use get_relevant_patterns)",
      "",
      "## Instructions:",
      guide?.instructions || "Generate code following the guide above",
    ];

    // Build nextSteps for easy AI navigation
    const nextSteps = paginationResponse?.nextSteps || [];

    // Build REQUIRED next action message
    const requiredAction = [
      "",
      "## ⚠️ REQUIRED NEXT STEP:",
      `You MUST generate Vue SFC code for blade "${guide?.bladeId}" based on the guide above,`,
      "then call submit_generated_code with the generated code.",
      "",
      "DO NOT skip this step - base files from create-vc-app are just scaffolding.",
      "The generated code must implement ALL features from the UI-Plan.",
    ].join("\n");

    return {
      success: true,
      // Guide for AI
      guide: paginationResponse?.guide,
      // Pagination info
      pagination: paginationResponse?.pagination,
      // Smart defaults info
      smartDefaults,
      // Clear next steps
      nextSteps,
      // Generation guide is ready - AI needs to generate code and submit
      // allComplete is NEVER true from generate_with_composition
      // It only becomes true after ALL blades are submitted via submit_generated_code
      allComplete: false,
      // Human-readable message with REQUIRED action
      message: messageLines.join("\n") + requiredAction,
      // Explicit reminder
      _reminder: "IMPORTANT: After reading this guide, you MUST generate code and call submit_generated_code. Do NOT consider generation complete until submit_generated_code returns success for ALL blades.",
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
  const { bladeId, code, composable, apiClient, context: codeContext, cwd: cwdParam, retry } = params;
  const { orchestrator } = context;

  try {
    // Retrieve cwd from params, context, or state
    const state = orchestrator.getState();
    const rawCwd = cwdParam || codeContext?.cwd || state.cwd;

    // Validate cwd - must be a valid VC-Shell project
    const cwdValidation = validateCwdForGeneration(rawCwd);
    if (!cwdValidation.valid) {
      return {
        success: false,
        needsApp: true,
        errors: cwdValidation.errors,
        warnings: cwdValidation.warnings,
        appInfo: cwdValidation.appInfo,
        suggestedAction: cwdValidation.suggestedAction,
        message: cwdValidation.suggestedAction
          ? `No valid VC-Shell app found. ${cwdValidation.suggestedAction.description}`
          : "No valid VC-Shell app found at the specified path.",
      };
    }

    const effectiveCwd = cwdValidation.cwd;

    // Handle composable parameter - can be object {name, code} or string
    let composableData;
    if (composable) {
      if (typeof composable === 'string') {
        // Legacy format: composable as string
        composableData = { path: "", content: composable };
      } else if (typeof composable === 'object' && composable.code) {
        // Expected format: composable as {name, code}
        composableData = { path: composable.name || "", content: composable.code };
      } else {
        throw new Error('Invalid composable format: expected {name: string, code: string} or string');
      }
    }

    // Handle apiClient parameter - can be object {name, code} or string
    let apiClientData;
    if (apiClient) {
      if (typeof apiClient === 'string') {
        // Legacy format: apiClient as string
        apiClientData = { path: "", content: apiClient };
      } else if (typeof apiClient === 'object' && apiClient.code) {
        // Expected format: apiClient as {name, code}
        apiClientData = { path: apiClient.name || "", content: apiClient.code };
      } else {
        throw new Error('Invalid apiClient format: expected {name: string, code: string} or string');
      }
    }

    const generatedCode = [{
      bladeId,
      blade: { path: "", content: code },
      composable: composableData,
      apiClient: apiClientData,
    }];

    const result = await orchestrator.executeStep("code-validation" as any, {
      generatedCode,
      retryCount: retry?.attempt || 0,
      cwd: effectiveCwd,
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
    // Extract the first validated code item to get bladeId and code for SubmitStepExecutor
    const validatedCodeItem = result.data?.validatedCode?.[0];

    // Determine artifact type based on what was submitted
    // If only apiClient is provided (no code), this is an API client submission
    const isApiClientSubmission = !code && apiClient;
    const artifactType = isApiClientSubmission ? "apiClient" : "blade";

    const submitResult = await orchestrator.executeStep("submitting" as any, {
      bladeId: validatedCodeItem?.bladeId || bladeId,
      code: validatedCodeItem?.blade?.content || code,
      cwd: effectiveCwd,
      composable: validatedCodeItem?.composable
        ? { name: validatedCodeItem.composable.path, code: validatedCodeItem.composable.content }
        : composable,
      apiClient: validatedCodeItem?.apiClient
        ? { name: validatedCodeItem.apiClient.path, code: validatedCodeItem.apiClient.content }
        : apiClient,
      artifactType,
    });

    if (!submitResult.success) {
      return {
        success: false,
        errors: submitResult.errors || ["Code submission failed"],
      };
    }

    // Track completed blades and artifacts
    const updatedState = orchestrator.getState();
    const completedBlades = [...(updatedState.completedBlades || [])];
    if (bladeId && !completedBlades.includes(bladeId)) {
      completedBlades.push(bladeId);
    }

    const completedArtifacts = updatedState.completedArtifacts || {
      blades: [],
      composables: [],
      apiClient: false,
      widgets: [],
    };

    if (bladeId && !completedArtifacts.blades.includes(bladeId)) {
      completedArtifacts.blades.push(bladeId);
    }
    if (composable?.name && !completedArtifacts.composables.includes(composable.name)) {
      completedArtifacts.composables.push(composable.name);
    }
    if (apiClient) {
      completedArtifacts.apiClient = true;
    }

    orchestrator.updateState({ completedBlades, completedArtifacts });

    // Calculate progress
    // DEBUG: Log state to understand why type checking might not run
    console.log("[submit_generated_code] State check:", {
      hasPlan: !!updatedState.plan,
      totalBladesInPlan: updatedState.plan?.blades?.length,
      completedBlades,
    });

    const totalBlades = updatedState.plan?.blades?.length || 0;
    const remainingBlades = updatedState.plan?.blades
      ?.filter((b: any) => !completedBlades.includes(b.id))
      .map((b: any) => b.id) || [];

    // Warn if plan is missing - this should not happen
    if (!updatedState.plan) {
      console.warn("[submit_generated_code] ⚠️ WARNING: No plan in state! Type checking may not trigger correctly.");
    }

    // Update progress in state
    orchestrator.updateState({
      progress: {
        total: totalBlades,
        completed: completedBlades.length,
        remaining: remainingBlades,
      },
    });

    // Check if API client is needed
    const requiresApiClient = updatedState.requiredArtifacts?.apiClient?.required;
    const apiClientComplete = updatedState.completedArtifacts?.apiClient;
    const allBladesComplete = remainingBlades.length === 0;
    const allArtifactsComplete = allBladesComplete && (!requiresApiClient || apiClientComplete);

    // Run automatic type checking if all artifacts are complete
    if (allArtifactsComplete && effectiveCwd) {
      console.log("[submit_generated_code] All artifacts complete. Running automatic type checking...");

      // Import checkTypesHandler dynamically to avoid circular dependency
      const { checkTypesHandler } = await import("./utilities");
      const typeCheckResult = await checkTypesHandler({ cwd: effectiveCwd }, context);

      if (!typeCheckResult.success) {
        return {
          success: false,
          needsTypeFixing: true,
          typeErrors: typeCheckResult.errors || [],
          errorCount: typeCheckResult.errorCount || 0,
          validatedCode: result.data?.validatedCode,
          progress: {
            completed: completedBlades.length,
            total: totalBlades,
            remaining: remainingBlades,
          },
          message: `Code submitted but ${typeCheckResult.errorCount || 0} type errors found. Please fix and resubmit.`,
          instructions: "Fix the type errors above and resubmit the corrected code using submit_generated_code.",
        };
      }

      console.log("[submit_generated_code] ✓ Type checking passed");
    }

    // Determine next action
    let nextAction = "";
    if (!allBladesComplete) {
      nextAction = `Next: Generate code for blade '${remainingBlades[0]}'`;
    } else if (requiresApiClient && !apiClientComplete) {
      const entityNames = updatedState.analysis?.entities?.map((e: any) => e.name).join(", ") || "entities";
      nextAction = `Next: Generate API client with CRUD methods for: ${entityNames}`;
    } else {
      nextAction = "All artifacts complete. Type checking passed. Module generation finished!";
    }

    return {
      success: true,
      validatedCode: result.data?.validatedCode,
      message: `Code validated and submitted successfully. ${nextAction}`,
      progress: {
        completed: completedBlades.length,
        total: totalBlades,
        remaining: remainingBlades,
      },
      nextSteps: !allBladesComplete
        ? [{
            tool: "generate_with_composition",
            params: { bladeId: remainingBlades[0], artifactType: "blade" },
            description: `Generate code for next blade: ${remainingBlades[0]}`,
          }]
        : requiresApiClient && !apiClientComplete
          ? [{
              tool: "generate_with_composition",
              params: { artifactType: "apiClient" },
              description: "Generate API client with CRUD methods",
            }]
          : [],
      allComplete: allArtifactsComplete,
      typeCheckPassed: allArtifactsComplete, // Only runs if all complete
      cwd: effectiveCwd, // Include cwd in response for debugging
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
