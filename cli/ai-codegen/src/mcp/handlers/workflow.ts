/**
 * Workflow MCP Tool Handlers
 *
 * Handlers for workflow orchestration tools using NEW architecture.
 * 10 tools total:
 * 1. analyze_prompt_v2
 * 2. discover_components_and_apis
 * 3. create_ui_plan_from_analysis_v2
 * 4. validate_ui_plan
 * 5. generate_with_composition
 * 6. generate_api_client
 * 7. submit_generated_code
 * 8. get_workflow_status
 * 9. reset_workflow
 * 10. start_module_workflow (full workflow)
 */

import type { MCPServerContext } from "../context";
import type { ToolHandler } from "./types";
import { validateCwdForGeneration } from "../../utils/app-detector";
import { validateJsonParam } from "./utils/validate-param";

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

    // Extract module name from prompt for example
    const moduleMatch = prompt.match(/(?:create|build|generate|make)\s+(?:a\s+)?(\w+)/i);
    const inferredModule = moduleMatch?.[1]?.toLowerCase() || "module";
    const inferredModuleName = inferredModule.charAt(0).toUpperCase() + inferredModule.slice(1);

    return {
      success: true,
      analysisPrompt: result.data?._analysisPrompt,
      analysisSchema: result.data?._analysisSchema,
      warnings: result.warnings || [],
      message: "Analysis instructions ready. Create your analysis JSON based on the user's prompt.",

      // CRITICAL: AI must create analysis based on prompt, not just copy example
      instructions: [
        "1. READ the analysisPrompt carefully - it contains detailed instructions",
        "2. ANALYZE the user's prompt to extract entities, features, columns, fields",
        "3. CREATE a complete analysis JSON following the analysisSchema",
        "4. SAVE the analysis to a file (RECOMMENDED to avoid truncation)",
        "5. CALL discover_components_and_apis with analysisFile parameter",
      ],

      // Recommended file-based workflow (avoids Cursor truncation issues)
      recommendedWorkflow: {
        description: "File-based approach avoids JSON truncation in some MCP clients",
        steps: [
          {
            step: 1,
            action: "Create analysis JSON based on analysisPrompt instructions",
            note: "IMPORTANT: Analyze the user's prompt thoroughly, don't just copy example",
          },
          {
            step: 2,
            action: "Save analysis to .vcshell-analysis.json file",
            tool: "Write",
            params: { file_path: ".vcshell-analysis.json", content: "<your analysis JSON>" },
          },
          {
            step: 3,
            action: "Call discover_components_and_apis with file path",
            tool: "discover_components_and_apis",
            params: { analysisFile: ".vcshell-analysis.json" },
          },
        ],
      },

      // Example structure (AI should create their own based on prompt analysis)
      exampleStructure: {
        module: inferredModule,
        moduleName: inferredModuleName,
        entities: [
          {
            name: "EntityName",
            displayName: "Entity Display Name",
            description: "Description of the entity",
            blades: [
              {
                type: "list",
                route: "/entities",
                isWorkspace: true,
                features: ["table", "pagination", "search", "toolbar", "filters", "multiselect"],
                columns: [
                  { id: "name", title: "Name", sortable: true, alwaysVisible: true },
                  { id: "status", title: "Status", type: "status-icon" },
                  { id: "createdDate", title: "Created", type: "date-ago", sortable: true },
                ],
              },
              {
                type: "details",
                route: "/entity",
                isWorkspace: false,
                features: ["form", "validation", "modifications"],
                fields: [
                  { id: "name", label: "Name", component: "VcInput", required: true },
                  { id: "description", label: "Description", component: "VcTextarea" },
                ],
              },
            ],
          },
        ],
      },

      _reminder: "You MUST analyze the user's prompt and create a complete analysis. Do NOT just copy the example structure - customize it based on what the user requested!",
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
 *
 * Supports TWO modes:
 * 1. File mode (RECOMMENDED): AI saves analysis to .vcshell-analysis.json, passes file path
 * 2. Direct mode: AI passes analysis JSON directly (may be truncated by Cursor)
 */
export const discoverComponentsAndAPIsHandler: ToolHandler = async (params, context) => {
  const { analysis: rawAnalysis, analysisFile } = params;
  const { orchestrator } = context;

  try {
    let analysis: Record<string, unknown>;

    // Mode 1: File-based analysis (RECOMMENDED - avoids truncation)
    if (analysisFile) {
      console.error(`[discover_components_and_apis] Reading analysis from file: ${analysisFile}`);
      try {
        const fs = await import("fs/promises");
        const path = await import("path");

        // Resolve path (can be relative or absolute)
        const resolvedPath = path.isAbsolute(analysisFile)
          ? analysisFile
          : path.resolve(process.cwd(), analysisFile);

        const fileContent = await fs.readFile(resolvedPath, "utf-8");
        const parsedAnalysis = JSON.parse(fileContent);

        // Validate the parsed analysis
        const validationResult = validateJsonParam(parsedAnalysis, "analysis (from file)", ["module", "entities"]);
        if (!validationResult.valid) {
          return {
            ...validationResult.error,
            hint: `File "${analysisFile}" was read but contains invalid analysis. Check the file format.`,
          };
        }
        analysis = validationResult.value;
        console.error(`[discover_components_and_apis] ✓ Analysis loaded from file: ${analysis.module}`);
      } catch (fileError: any) {
        return {
          success: false,
          errors: [`Failed to read analysis file: ${fileError.message}`],
          hint: fileError.code === "ENOENT"
            ? `File "${analysisFile}" not found. Make sure you saved the analysis JSON to this file first.`
            : `Error reading file: ${fileError.message}. Check file path and permissions.`,
          suggestedWorkflow: [
            "1. Create analysis JSON based on analyze_prompt_v2 instructions",
            "2. Save it to a file: Write('.vcshell-analysis.json', JSON.stringify(analysis, null, 2))",
            "3. Call discover_components_and_apis({ analysisFile: '.vcshell-analysis.json' })",
          ],
        };
      }
    }
    // Mode 2: Direct analysis parameter
    else if (rawAnalysis !== undefined && rawAnalysis !== null) {
      // Analysis provided - validate it
      const validationResult = validateJsonParam(rawAnalysis, "analysis", ["module", "entities"]);
      if (!validationResult.valid) {
        // If validation failed, suggest file mode as alternative
        return {
          ...validationResult.error,
          alternativeSuggestion: {
            method: "file-based",
            description: "If JSON is being truncated, save analysis to a file and pass the file path instead:",
            steps: [
              "1. Save analysis JSON to '.vcshell-analysis.json' file",
              "2. Call discover_components_and_apis({ analysisFile: '.vcshell-analysis.json' })",
            ],
          },
        };
      }
      analysis = validationResult.value;
    } else {
      // No analysis provided - try to get from state
      const state = orchestrator.getState();
      if (state.analysis) {
        console.error("[discover_components_and_apis] Using analysis from workflow state");
        analysis = state.analysis as unknown as Record<string, unknown>;
      } else {
        // No analysis anywhere - provide helpful error with exact format
        return {
          success: false,
          errors: ["Missing analysis. Provide either 'analysis' JSON or 'analysisFile' path."],
          hint: "You must first create an analysis based on analyze_prompt_v2 instructions.",
          recommendedMethod: {
            name: "file-based (avoids truncation)",
            steps: [
              "1. Call analyze_prompt_v2 with your module description",
              "2. Create analysis JSON based on returned instructions",
              "3. Save to file: Write('.vcshell-analysis.json', JSON.stringify(analysis))",
              "4. Call discover_components_and_apis({ analysisFile: '.vcshell-analysis.json' })",
            ],
          },
          exampleAnalysis: {
            module: "your-module-name",
            moduleName: "YourModuleName",
            entities: [
              {
                name: "Entity",
                blades: [
                  {
                    type: "list",
                    features: ["filters", "multiselect", "toolbar"],
                    columns: [{ id: "name", title: "Name", sortable: true }],
                  },
                  {
                    type: "details",
                    features: ["form", "validation"],
                    fields: [{ id: "name", component: "VcInput", required: true }],
                  },
                ],
              },
            ],
          },
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
 *
 * Supports TWO modes:
 * 1. File mode (RECOMMENDED): Pass analysisFile path to JSON file
 * 2. Direct mode: Pass analysis JSON directly (may be truncated by Cursor)
 */
export const createUIPlanFromAnalysisV2Handler: ToolHandler = async (params, context) => {
  const { analysis: rawAnalysis, analysisFile } = params;
  const { orchestrator } = context;

  try {
    let analysis: Record<string, unknown>;

    // Mode 1: File-based analysis (RECOMMENDED - avoids truncation)
    if (analysisFile) {
      console.error(`[create_ui_plan] Reading analysis from file: ${analysisFile}`);
      try {
        const fs = await import("fs/promises");
        const path = await import("path");

        const resolvedPath = path.isAbsolute(analysisFile)
          ? analysisFile
          : path.resolve(process.cwd(), analysisFile);

        const fileContent = await fs.readFile(resolvedPath, "utf-8");
        const parsedAnalysis = JSON.parse(fileContent);

        const validationResult = validateJsonParam(parsedAnalysis, "analysis (from file)", ["module", "entities"]);
        if (!validationResult.valid) {
          return {
            ...validationResult.error,
            hint: `File "${analysisFile}" was read but contains invalid analysis.`,
          };
        }
        analysis = validationResult.value;
        console.error(`[create_ui_plan] ✓ Analysis loaded from file: ${analysis.module}`);
      } catch (fileError: any) {
        return {
          success: false,
          errors: [`Failed to read analysis file: ${fileError.message}`],
          hint: fileError.code === "ENOENT"
            ? `File "${analysisFile}" not found. Make sure you saved the analysis JSON first.`
            : `Error reading file: ${fileError.message}`,
        };
      }
    }
    // Mode 2: Direct analysis parameter
    else if (rawAnalysis !== undefined && rawAnalysis !== null) {
      const validationResult = validateJsonParam(rawAnalysis, "analysis", ["module", "entities"]);
      if (!validationResult.valid) {
        return {
          ...validationResult.error,
          alternativeSuggestion: {
            method: "file-based",
            description: "If JSON is being truncated, use analysisFile parameter instead:",
            example: "create_ui_plan_from_analysis_v2({ analysisFile: '.vcshell-analysis.json' })",
          },
        };
      }
      analysis = validationResult.value;
    }
    // Mode 3: Try to get from workflow state
    else {
      const state = orchestrator.getState();
      if (state.analysis) {
        console.error("[create_ui_plan] Using analysis from workflow state");
        analysis = state.analysis as unknown as Record<string, unknown>;
      } else {
        return {
          success: false,
          errors: ["Missing analysis. Provide 'analysisFile' path or 'analysis' JSON."],
          hint: "Use file-based approach to avoid truncation: create_ui_plan_from_analysis_v2({ analysisFile: '.vcshell-analysis.json' })",
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
 *
 * Supports TWO modes:
 * 1. File mode (RECOMMENDED): Pass planFile path to JSON file
 * 2. Direct mode: Pass plan JSON directly (may be truncated by Cursor)
 */
export const validateUIPlanHandler: ToolHandler = async (params, context) => {
  const { plan: rawPlan, planFile } = params;
  const { orchestrator } = context;

  try {
    let plan: Record<string, unknown>;

    // Mode 1: File-based plan (RECOMMENDED - avoids truncation)
    if (planFile) {
      console.error(`[validate_ui_plan] Reading plan from file: ${planFile}`);
      try {
        const fs = await import("fs/promises");
        const path = await import("path");

        const resolvedPath = path.isAbsolute(planFile)
          ? planFile
          : path.resolve(process.cwd(), planFile);

        const fileContent = await fs.readFile(resolvedPath, "utf-8");
        const parsedPlan = JSON.parse(fileContent);

        const validationResult = validateJsonParam(parsedPlan, "plan (from file)", ["module", "blades"]);
        if (!validationResult.valid) {
          return {
            ...validationResult.error,
            hint: `File "${planFile}" was read but contains invalid plan.`,
          };
        }
        plan = validationResult.value;
        console.error(`[validate_ui_plan] ✓ Plan loaded from file: ${plan.module}`);
      } catch (fileError: any) {
        return {
          success: false,
          errors: [`Failed to read plan file: ${fileError.message}`],
          hint: fileError.code === "ENOENT"
            ? `File "${planFile}" not found. Make sure you saved the UI-Plan JSON first.`
            : `Error reading file: ${fileError.message}`,
        };
      }
    }
    // Mode 2: Direct plan parameter
    else if (rawPlan !== undefined && rawPlan !== null) {
      const validationResult = validateJsonParam(rawPlan, "plan", ["module", "blades"]);
      if (!validationResult.valid) {
        return {
          ...validationResult.error,
          alternativeSuggestion: {
            method: "file-based",
            description: "If JSON is being truncated, use planFile parameter instead:",
            example: "validate_ui_plan({ planFile: '.vcshell-ui-plan.json' })",
          },
        };
      }
      plan = validationResult.value;
    }
    // Mode 3: Try to get from workflow state
    else {
      const state = orchestrator.getState();
      if (state.plan) {
        console.error("[validate_ui_plan] Using plan from workflow state");
        plan = state.plan as unknown as Record<string, unknown>;
      } else {
        return {
          success: false,
          errors: ["Missing plan. Provide 'planFile' path or 'plan' JSON."],
          hint: "Use file-based approach to avoid truncation: validate_ui_plan({ planFile: '.vcshell-ui-plan.json' })",
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
      // Check if this is an apiClientRequired error
      if (result.data?.apiClientRequired) {
        return {
          success: false,
          apiClientRequired: true,
          module: result.data.module,
          errors: result.errors,
          message: [
            "## ⚠️ API CLIENT REQUIRED FIRST!",
            "",
            `You tried to generate ${result.data.requestedArtifact} for "${result.data.requestedBladeId}",`,
            "but the API client must be generated FIRST.",
            "",
            "## Next Step:",
            `Call generate_api_client({ cwd: "${cwd}" })`,
            "",
            "## Why?",
            "Composables import types from the API client.",
            "Without it, blade composables will have import errors.",
            "",
            "## Workflow Order:",
            "1. generate_api_client → submit API client",
            "2. generate_with_composition → submit blades",
          ].join("\n"),
          nextSteps: [{
            tool: "generate_api_client",
            params: { cwd },
            description: `Generate API client for module ${result.data.module}`,
          }],
        };
      }

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

    // Check if request was redirected to apiClient
    const wasRedirectedToApiClient =
      effectiveArtifactType !== "apiClient" &&
      guide?.artifactType === "apiClient";

    const messageLines = [
      dryRun ? "🔍 DRY RUN MODE" : "📦 GENERATION GUIDE READY",
      "",
    ];

    // Add CRITICAL warning if redirected to apiClient
    if (wasRedirectedToApiClient) {
      messageLines.push("## ⚠️ CRITICAL: API CLIENT REQUIRED FIRST!");
      messageLines.push(`You requested to generate ${effectiveArtifactType} for ${effectiveBladeId},`);
      messageLines.push("but API CLIENT must be generated FIRST because composables depend on it.");
      messageLines.push("");
      messageLines.push("**DO NOT generate a blade. Generate the API client below instead.**");
      messageLines.push("");
    }

    messageLines.push(
      `## Current Artifact: ${guide?.artifactType?.toUpperCase()} - ${guide?.bladeId}`,
      `- Module: ${guide?.module}`,
      `- Entity: ${guide?.entity}`,
      `- Type: ${guide?.artifactType === "apiClient" ? "API Client" : `${guide?.bladeType} blade`}`,
      `- Features: ${guide?.features?.join(", ") || "none"}`,
      `- Target: ${guide?.targetPath}`,
      "",
      `## Progress: ${pagination?.completed || 0}/${pagination?.total?.totalArtifacts || 0} artifacts`,
      `- Remaining: ${pagination?.remaining || 0}`,
      "",
      "## Context Level: " + (guide?.context?.level || "essential").toUpperCase(),
    );

    // Only show template/pattern hints for blades, not API client
    if (guide?.artifactType !== "apiClient") {
      messageLines.push(
        guide?.context?.template ? "✅ Template included" : "❌ Template not included (use get_best_template)",
        guide?.context?.topPatterns?.length ? `✅ ${guide.context.topPatterns.length} patterns included` : "❌ Patterns not included (use get_relevant_patterns)",
      );
    }

    messageLines.push(
      "",
      "## Instructions:",
      guide?.instructions || "Generate code following the guide above",
    );

    // Build nextSteps for easy AI navigation
    const nextSteps = paginationResponse?.nextSteps || [];

    // Build REQUIRED next action message based on artifact type
    let requiredAction: string;
    if (guide?.artifactType === "apiClient") {
      requiredAction = [
        "",
        "## ⚠️ REQUIRED NEXT STEP:",
        `You MUST generate TypeScript API CLIENT code for module "${guide?.module}" based on the guide above,`,
        "then call submit_generated_code with:",
        `  - bladeId: "${guide?.bladeId}"`,
        `  - code: "" (empty string)`,
        `  - apiClient: { name: "${guide?.module}.api.ts", code: <your generated API client code> }`,
        `  - context: { module: "${guide?.module}", layout: "details" }`,
        "",
        "DO NOT skip this step - blades and composables DEPEND on this API client!",
        "After API client is submitted, you can generate blades.",
      ].join("\n");
    } else {
      requiredAction = [
        "",
        "## ⚠️ REQUIRED NEXT STEP:",
        `You MUST generate ${guide?.artifactType === "composable" ? "TypeScript composable" : "Vue SFC"} code for "${guide?.bladeId}" based on the guide above,`,
        "then call submit_generated_code with the generated code.",
        "",
        "## 🚨 FORBIDDEN ACTIONS (WILL CAUSE FAILURES):",
        "- ❌ DO NOT use mkdir, Write, or Edit tools to create module folders/files",
        "- ❌ DO NOT use Read, Grep, or Glob tools to search for examples",
        "- ❌ DO NOT read other modules' code (vendors.vue, offers.ts, platform.ts)",
        "- ❌ DO NOT search the project filesystem for templates or patterns",
        "- ❌ DO NOT skip submit_generated_code - it creates ALL files automatically",
        "",
        "## ✅ CORRECT WORKFLOW:",
        "1. Read ONLY the guide above (already contains everything you need)",
        "2. If you need more context, use MCP tools: view_components, view_framework_apis, get_best_template",
        "3. Generate Vue SFC code as a STRING",
        "4. Call submit_generated_code({ bladeId, code, context })",
        "5. submit_generated_code will CREATE all folders and files automatically",
      ].join("\n");
    }

    // Build appropriate reminder based on artifact type
    const reminder = guide?.artifactType === "apiClient"
      ? "CRITICAL: You MUST generate the API CLIENT code first! Composables and blades depend on it. Generate TypeScript API client code and submit with apiClient parameter."
      : "IMPORTANT: Generate code and call submit_generated_code. FORBIDDEN: Read/Grep/Glob for examples, mkdir/Write/Edit for files. Use ONLY: guide above + MCP tools (view_components, get_best_template).";

    // Build nextSteps specifically for the current artifact type
    const effectiveNextSteps = guide?.artifactType === "apiClient"
      ? [{
          tool: "submit_generated_code",
          params: {
            bladeId: guide?.bladeId,
            code: "",
            apiClient: { name: `${guide?.module}.api.ts`, code: "<YOUR GENERATED API CLIENT CODE>" },
            context: { module: guide?.module, layout: "details" },
          },
          description: `Submit API client for module ${guide?.module}`,
        }]
      : nextSteps;

    return {
      success: true,
      // Guide for AI
      guide: paginationResponse?.guide,
      // Pagination info
      pagination: paginationResponse?.pagination,
      // Smart defaults info
      smartDefaults,
      // Clear next steps - use effective next steps based on artifact type
      nextSteps: effectiveNextSteps,
      // Flag to indicate if API client was forced
      apiClientRequired: wasRedirectedToApiClient,
      // Generation guide is ready - AI needs to generate code and submit
      // allComplete is NEVER true from generate_with_composition
      // It only becomes true after ALL blades are submitted via submit_generated_code
      allComplete: false,
      // Human-readable message with REQUIRED action
      message: messageLines.join("\n") + requiredAction,
      // Explicit reminder based on artifact type
      _reminder: reminder,
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
  const { bladeId, code, composable, apiClient, locale, context: codeContext, cwd: cwdParam, retry } = params;
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
    // Priority: apiClient > composable > blade
    const isApiClientSubmission = !code && apiClient && !composable;
    const isComposableSubmission = !code && composable && !apiClient;
    const artifactType = isApiClientSubmission ? "apiClient" : isComposableSubmission ? "composable" : "blade";

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
      // Pass locale for merging into en.json
      locale: locale,
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

    // Track completed artifacts based on artifact type
    // Only add to completedBlades if this is a blade submission (not composable or apiClient)
    if (artifactType === "blade" && bladeId && !completedArtifacts.blades.includes(bladeId)) {
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
 * 10. generate_api_client
 * Generate API client guide - MUST be called before generating blades
 */
export const generateApiClientHandler: ToolHandler = async (params, context) => {
  const { cwd } = params;
  const { orchestrator } = context;

  try {
    // Validate cwd
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

    // Get state - need plan and analysis
    const state = orchestrator.getState();
    if (!state.plan) {
      return {
        success: false,
        errors: ["No UI-Plan in workflow state. Run validate_ui_plan first."],
      };
    }

    // Check if API client already generated
    if (state.completedArtifacts?.apiClient) {
      return {
        success: true,
        alreadyComplete: true,
        message: "API client has already been generated and submitted. Proceed to generate blades.",
        nextSteps: [{
          tool: "generate_with_composition",
          params: { cwd: cwdValidation.cwd, bladeId: state.plan.blades[0]?.id, artifactType: "blade" },
          description: `Generate first blade: ${state.plan.blades[0]?.id}`,
        }],
      };
    }

    // Save cwd to state
    orchestrator.updateState({ cwd: cwdValidation.cwd });

    // Execute generation step with apiClient artifact type
    const result = await orchestrator.executeStep("generating" as any, {
      plan: state.plan,
      cwd: cwdValidation.cwd,
      artifactType: "apiClient",
      contextLevel: "essential",
    });

    if (!result.success) {
      return {
        success: false,
        errors: result.errors || ["API client guide generation failed"],
      };
    }

    const guide = result.data?.guide;
    const moduleName = state.plan.module;

    // Build clear message
    const messageLines = [
      "# 📦 API CLIENT GENERATION GUIDE",
      "",
      "**This is the FIRST step before generating any blades.**",
      "",
      `## Module: ${moduleName}`,
      `## Target Directory: src/api_client/`,
      `## Files to Generate:`,
      `##   - ${moduleName}.api.ts (types)`,
      `##   - ${moduleName}.mock.ts (mock data)`,
      `##   - ${moduleName}.client.ts (mock client)`,
      "",
      "## Instructions:",
      guide?.instructions || "Generate MOCK API client with 3 files (types, mock, client)",
      "",
      "## IMPORTANT: Generate 3 separate files!",
      `1. ${moduleName}.api.ts - TypeScript types (reusable)`,
      `2. ${moduleName}.mock.ts - Static mock data`,
      `3. ${moduleName}.client.ts - Mock client class`,
      "",
      "## After generating ALL 3 files, submit with:",
      "```",
      "submit_generated_code({",
      `  bladeId: "${moduleName}",`,
      `  code: "",`,
      "  apiClient: {",
      `    types: { name: "${moduleName}.api.ts", code: <TYPES_CODE> },`,
      `    mock: { name: "${moduleName}.mock.ts", code: <MOCK_DATA_CODE> },`,
      `    client: { name: "${moduleName}.client.ts", code: <CLIENT_CODE> }`,
      "  },",
      `  context: { module: "${moduleName}", layout: "details" }`,
      "});",
      "```",
    ];

    return {
      success: true,
      guide,
      module: moduleName,
      targetPath: `${cwdValidation.cwd}/src/api_client/`,
      targetFiles: [
        `${moduleName}.api.ts`,
        `${moduleName}.mock.ts`,
        `${moduleName}.client.ts`,
      ],
      entities: guide?.context?.entities || state.analysis?.entities,
      message: messageLines.join("\n"),
      nextSteps: [{
        tool: "submit_generated_code",
        params: {
          bladeId: moduleName,
          code: "",
          apiClient: {
            types: { name: `${moduleName}.api.ts`, code: "<YOUR TYPES CODE>" },
            mock: { name: `${moduleName}.mock.ts`, code: "<YOUR MOCK DATA CODE>" },
            client: { name: `${moduleName}.client.ts`, code: "<YOUR CLIENT CODE>" },
          },
          context: { module: moduleName, layout: "details" },
        },
        description: `Submit MOCK API client (3 files) for module ${moduleName}`,
      }],
      _reminder: "Generate MOCK API client with NO real HTTP calls. Backend endpoints don't exist yet!",
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || "Unknown error during API client generation"],
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
  generate_api_client: generateApiClientHandler,
  submit_generated_code: submitGeneratedCodeHandler,
  get_workflow_status: getWorkflowStatusHandler,
  reset_workflow: resetWorkflowHandler,
  start_module_workflow: startModuleWorkflowHandler,
};
