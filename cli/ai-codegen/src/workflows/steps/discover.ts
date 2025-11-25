/**
 * Discover Step Executor
 *
 * Discovers relevant components and framework APIs based on analysis.
 * Uses ComponentResolver and FeatureResolver.
 *
 * Real-world patterns from vendor-portal:
 * - Toolbar: IBladeToolbar[] array passed to VcBlade, NOT separate VcButton components
 * - Filters: staged/applied pattern with VcRadioButton/VcCheckbox in #filters slot
 * - Columns: built-in types (status-icon, date-ago, image) + custom slot templates
 * - Forms: vee-validate Field wraps VcInput/VcSelect; VcField is for read-only display only
 */

import type { WorkflowState, WorkflowContext, StepExecutor, StepResult } from "../types";
import type { PromptAnalysis } from "../../generators/types";

/**
 * Feature to component mapping based on real vendor-portal usage
 * Note: Toolbars use IBladeToolbar[] array, not VcButton components
 */
const FEATURE_COMPONENTS: Record<string, string[]> = {
  // List features
  filters: ["VcRadioButton", "VcCheckbox", "VcInput", "VcSelect"],
  multiselect: ["VcTable"],
  "bulk-actions": [], // Handled via IBladeToolbar[], not components
  toolbar: [], // Handled via IBladeToolbar[], not components
  slots: ["VcStatus", "VcStatusIcon", "VcImage", "VcBadge"],
  pagination: [], // Built into VcTable
  search: [], // Built into VcTable
  table: ["VcTable"],
  // Details features
  form: ["VcInput", "VcSelect", "VcTextarea", "VcSwitch", "VcCheckbox"],
  validation: [], // Handled via vee-validate Field component
  gallery: ["VcGallery"],
  widgets: ["VcWidget"],
  modifications: [], // Handled via useModificationTracker
  beforeunload: [], // Handled via useBeforeUnload
  "dirty-tracking": [], // Handled via vee-validate meta
  save: [], // Handled via IBladeToolbar[]
  upload: ["VcGallery", "VcFileUpload"],
  images: ["VcGallery", "VcImage"],
};

/**
 * Column type to component mapping
 */
const COLUMN_TYPE_COMPONENTS: Record<string, string> = {
  image: "VcImage",
  "status-icon": "VcStatusIcon",
  status: "VcStatus",
  link: "VcLink",
  badge: "VcBadge",
};

/**
 * DiscoverStepExecutor
 *
 * Step 2: Discover components and framework APIs for each entity/blade.
 */
export class DiscoverStepExecutor implements StepExecutor {
  async execute(
    _state: WorkflowState,
    context: WorkflowContext,
    input: { analysis: PromptAnalysis },
  ): Promise<StepResult> {
    const { analysis } = input;
    const { featureResolver, kb } = context;

    try {
      console.log(`[DiscoverStep] Discovering for module: ${analysis.moduleName}`);

      const discoveredComponents: any[] = [];
      const discoveredAPIs: any[] = [];
      const seenComponents = new Set<string>();

      // Helper to add component if not seen
      // Returns LIGHTWEIGHT metadata only - AI can use view_components for full details
      const addComponent = (name: string, meta: Record<string, any>) => {
        if (seenComponents.has(name)) return;
        const component = kb.components.findByName(name);
        if (component) {
          seenComponents.add(name);
          // LIGHTWEIGHT: Only essential metadata, no full props/events/slots
          discoveredComponents.push({
            name: component.component,
            description: component.description || "",
            bladeType: meta.bladeType,
            entity: meta.entity,
            score: meta.score,
            reason: meta.reason,
            // Summary counts instead of full objects
            propsCount: Object.keys(component.props || {}).length,
            slotsCount: Object.keys(component.slots || {}).length,
            eventsCount: Object.keys(component.events || {}).length,
          });
          console.log(`[DiscoverStep] ✓ Component: ${name} (${meta.reason || "discovered"})`);
        }
      };

      // Discover for each entity
      for (const entity of analysis.entities || []) {
        for (const blade of entity.blades || []) {
          console.log(`[DiscoverStep] Discovering for ${entity.name} ${blade.type} blade...`);

          // 1. Add core blade component
          addComponent("VcBlade", {
            bladeType: blade.type,
            entity: entity.name,
            score: 1.0,
            reason: "core-blade-container",
          });

          // 2. Add main component based on blade type
          if (blade.type === "list") {
            addComponent("VcTable", {
              bladeType: blade.type,
              entity: entity.name,
              score: 1.0,
              reason: "main-list-component",
            });
          } else {
            // Details blade - NO VcForm component, use vee-validate directly
            // VcField is for read-only display only!
            addComponent("VcCard", {
              bladeType: blade.type,
              entity: entity.name,
              score: 0.9,
              reason: "form-sections-container",
            });
          }

          // 3. Discover feature-specific components
          const features = blade.features || [];
          for (const feature of features) {
            const featureComponents = FEATURE_COMPONENTS[feature] || [];
            for (const componentName of featureComponents) {
              addComponent(componentName, {
                bladeType: blade.type,
                entity: entity.name,
                score: 0.8,
                reason: `feature:${feature}`,
              });
            }
          }

          // 4. Discover components from column type specifications
          if (blade.columns) {
            for (const column of blade.columns) {
              if (column.type) {
                const columnComponent = COLUMN_TYPE_COMPONENTS[column.type];
                if (columnComponent) {
                  addComponent(columnComponent, {
                    bladeType: blade.type,
                    entity: entity.name,
                    score: 0.9,
                    reason: `column-type:${column.type}`,
                  });
                }
              }
            }
          }

          // 5. Discover components from field specifications
          if (blade.fields) {
            for (const field of blade.fields) {
              if (field.component) {
                addComponent(field.component, {
                  bladeType: blade.type,
                  entity: entity.name,
                  score: 1.0,
                  reason: `field:${field.id}`,
                });
              }
            }
          }

          // 6. Get required APIs for features
          if (features.length > 0) {
            const requiredAPIs = await featureResolver.getRequiredAPIs(features);

            for (const apiName of requiredAPIs) {
              const api = kb.frameworkAPIs.get(apiName);
              if (api && !discoveredAPIs.find((a) => a.name === apiName)) {
                // LIGHTWEIGHT: Only essential metadata, no full methods/capabilities
                discoveredAPIs.push({
                  name: api.name,
                  type: api.type,
                  category: api.category,
                  description: api.description,
                  // Summary counts instead of full objects
                  methodsCount: (api.methods || []).length,
                  capabilitiesCount: Object.keys(api.capabilities || {}).length,
                });
                console.log(`[DiscoverStep] ✓ API (feature): ${apiName}`);
              }
            }
          }
        }
      }

      // 7. Always add core APIs based on real vendor-portal patterns
      const coreAPIs = (bladeType: "list" | "details") => {
        const common = ["useBladeNavigation", "usePopup", "useFunctions"];
        if (bladeType === "list") {
          return [...common, "useTableSort", "useNotifications"];
        } else {
          return [...common, "useBeforeUnload", "useAssets"];
        }
      };

      // Add core APIs for all blade types found
      const allBladeTypes = new Set<"list" | "details">(
        analysis.entities?.flatMap(e => e.blades?.map(b => b.type) || []) || []
      );

      // Helper to add API with lightweight metadata
      const addAPI = (apiName: string, source: string) => {
        if (discoveredAPIs.find((a) => a.name === apiName)) return;
        const api = kb.frameworkAPIs.get(apiName);
        if (api) {
          // LIGHTWEIGHT: Only essential metadata
          discoveredAPIs.push({
            name: api.name,
            type: api.type,
            category: api.category,
            description: api.description,
            methodsCount: (api.methods || []).length,
            capabilitiesCount: Object.keys(api.capabilities || {}).length,
          });
          console.log(`[DiscoverStep] ✓ API (${source}): ${apiName}`);
        }
      };

      for (const bladeType of allBladeTypes) {
        for (const apiName of coreAPIs(bladeType)) {
          addAPI(apiName, "core");
        }
      }

      // Always add useApiClient
      addAPI("useApiClient", "core");

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
}
