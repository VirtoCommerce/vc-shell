/**
 * Discover Step Executor
 *
 * Discovers relevant components and framework APIs based on analysis.
 * Uses ComponentResolver and FeatureResolver.
 */

import type { WorkflowState, WorkflowContext, StepExecutor, StepResult } from "../types";
import type { PromptAnalysis } from "../../generators/types";

/**
 * DiscoverStepExecutor
 *
 * Step 2: Discover components and framework APIs for each entity/blade.
 */
export class DiscoverStepExecutor implements StepExecutor {
  async execute(
    state: WorkflowState,
    context: WorkflowContext,
    input: { analysis: PromptAnalysis },
  ): Promise<StepResult> {
    const { analysis } = input;
    const { componentResolver, featureResolver, kb } = context;

    try {
      console.log(`[DiscoverStep] Discovering for module: ${analysis.moduleName}`);

      const discoveredComponents: any[] = [];
      const discoveredAPIs: any[] = [];

      // Discover for each entity
      for (const entity of analysis.entities || []) {
        for (const blade of entity.blades || []) {
          console.log(`[DiscoverStep] Discovering for ${entity.name} ${blade.type} blade...`);

          // Resolve component dynamically
          const intent = this.buildIntent(entity, blade);
          const componentMatch = await componentResolver.resolve({
            intent,
            context: blade.type,
            features: blade.features || [],
          });

          if (componentMatch) {
            discoveredComponents.push({
              name: componentMatch.item.component,
              bladeType: blade.type,
              entity: entity.name,
              score: componentMatch.score,
              capabilities: componentMatch.item.capabilities || [],
              props: componentMatch.item.props || [],
              slots: componentMatch.item.slots || [],
              events: componentMatch.item.events || [],
            });

            console.log(
              `[DiscoverStep] ✓ Resolved component: ${componentMatch.item.component} (score: ${componentMatch.score})`,
            );
          }

          // Get required APIs for features
          if (blade.features && blade.features.length > 0) {
            const requiredAPIs = await featureResolver.getRequiredAPIs(blade.features);

            for (const apiName of requiredAPIs) {
              const api = kb.frameworkAPIs.get(apiName);
              if (api && !discoveredAPIs.find((a) => a.name === apiName)) {
                discoveredAPIs.push({
                  name: api.name,
                  type: api.type,
                  category: api.category,
                  description: api.description,
                  capabilities: api.capabilities || [],
                  methods: api.methods || [],
                });

                console.log(`[DiscoverStep] ✓ Required API: ${apiName}`);
              }
            }
          }
        }
      }

      console.log(
        `[DiscoverStep] Discovery complete: ${discoveredComponents.length} components, ${discoveredAPIs.length} APIs`,
      );

      return {
        success: true,
        data: {
          analysis, // Save analysis to state for subsequent steps
          discoveredComponents,
          discoveredAPIs,
        },
        nextStep: "discovering" as any, // Transition to discovering state
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [`Discovery failed: ${error.message}`],
      };
    }
  }

  canExecute(state: WorkflowState): boolean {
    // Can execute from analyzing or discovering state
    // Analysis will be provided via input parameter, not state
    return (
      state.currentStep === ("analyzing" as any) || state.currentStep === ("discovering" as any)
    );
  }

  getRequiredInput(): string[] {
    return ["analysis"];
  }

  /**
   * Build intent string for component resolution
   */
  private buildIntent(entity: any, blade: any): string {
    const parts = [];

    if (blade.type === "list") {
      parts.push("data table list");
      if (blade.features?.includes("filters")) parts.push("with filters");
      if (blade.features?.includes("multiselect")) parts.push("with multiselect");
      if (blade.features?.includes("sortable")) parts.push("sortable");
    } else {
      parts.push("form details");
      if (blade.features?.includes("validation")) parts.push("with validation");
      if (blade.features?.includes("sections")) parts.push("with sections");
      if (blade.features?.includes("gallery")) parts.push("with gallery");
    }

    parts.push(`for ${entity.name}`);

    return parts.join(" ");
  }
}
