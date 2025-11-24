/**
 * WorkflowPlanner
 *
 * Plans multi-step workflows for complex module generation.
 * Orchestrates analysis → discovery → planning → validation → generation.
 */

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  dependencies?: string[];
  estimatedTime?: number;
}

export interface WorkflowPlan {
  steps: WorkflowStep[];
  totalEstimatedTime: number;
  parallelizable: boolean;
}

/**
 * WorkflowPlanner
 *
 * Creates workflow execution plans.
 */
export class WorkflowPlanner {
  /**
   * Plan full module generation workflow
   */
  planModuleGeneration(): WorkflowPlan {
    const steps: WorkflowStep[] = [
      {
        id: "analyze",
        name: "Analyze Prompt",
        description: "Extract entities, intent, and requirements",
        estimatedTime: 2,
      },
      {
        id: "discover",
        name: "Discover Components",
        description: "Find matching components and framework APIs",
        dependencies: ["analyze"],
        estimatedTime: 1,
      },
      {
        id: "plan",
        name: "Create UI-Plan",
        description: "Generate complete UI-Plan structure",
        dependencies: ["discover"],
        estimatedTime: 2,
      },
      {
        id: "validate",
        name: "Validate Plan",
        description: "Validate UI-Plan against schema and business rules",
        dependencies: ["plan"],
        estimatedTime: 1,
      },
      {
        id: "generate",
        name: "Generate Code",
        description: "Generate Vue SFC, composables, and API clients",
        dependencies: ["validate"],
        estimatedTime: 5,
      },
      {
        id: "submit",
        name: "Submit & Validate",
        description: "Write files and run type checking",
        dependencies: ["generate"],
        estimatedTime: 2,
      },
    ];

    return {
      steps,
      totalEstimatedTime: steps.reduce((sum, s) => sum + (s.estimatedTime || 0), 0),
      parallelizable: false,
    };
  }

  /**
   * Plan widget generation workflow
   */
  planWidgetGeneration(): WorkflowPlan {
    const steps: WorkflowStep[] = [
      {
        id: "analyze",
        name: "Analyze Widget Requirements",
        description: "Extract widget type and data needs",
        estimatedTime: 1,
      },
      {
        id: "generate",
        name: "Generate Widget",
        description: "Create widget component",
        dependencies: ["analyze"],
        estimatedTime: 2,
      },
    ];

    return {
      steps,
      totalEstimatedTime: 3,
      parallelizable: false,
    };
  }
}
