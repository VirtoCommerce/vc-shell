/**
 * Generator Layer Types
 *
 * Professional types for code generation WITHOUT hardcoding.
 * All component/feature resolution happens via Intelligence Layer.
 */

/**
 * Prompt Analysis Result
 * Output from SmartPromptAnalyzer
 */
export interface PromptAnalysis {
  moduleName: string;
  description: string;
  entities: EntityAnalysis[];
  relationships?: RelationshipAnalysis[];
  workflows?: WorkflowAnalysis[];
}

export interface EntityAnalysis {
  name: string;
  displayName: string;
  description: string;
  properties: PropertyAnalysis[];
  blades: BladeAnalysis[];
  customRoutes?: string[];
  customActions?: string[];
  customPermissions?: string[];
}

export interface PropertyAnalysis {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
}

export interface BladeAnalysis {
  type: "list" | "details";
  route: string;
  isWorkspace?: boolean;
  features?: string[];
  customizations?: Record<string, unknown>;
  // List blade column specifications
  columns?: ColumnAnalysis[];
  // Details blade field specifications
  fields?: FieldAnalysis[];
  // Details blade section groupings
  sections?: SectionAnalysis[];
}

export interface ColumnAnalysis {
  id: string;
  title: string;
  type?: "text" | "number" | "date" | "date-ago" | "image" | "status-icon" | "link" | "badge";
  sortable?: boolean;
  width?: number;
}

export interface FieldAnalysis {
  id: string;
  label: string;
  component: string; // VcInput, VcSelect, VcSwitch, etc.
  required?: boolean;
  rules?: string;
}

export interface SectionAnalysis {
  id: string;
  title: string;
  fields: string[];
}

export interface RelationshipAnalysis {
  from: string;
  to: string;
  type: "oneToOne" | "oneToMany" | "manyToMany";
  description?: string;
}

export interface WorkflowAnalysis {
  name: string;
  steps: string[];
  description?: string;
}

/**
 * UI Plan
 * Output from SmartUIPlanner
 */
export interface UIPlan {
  $schema: string;
  module: string;
  description?: string;
  blades: BladePlan[];
  data?: {
    sources: Record<string, DataSource>;
  };
  localization?: {
    defaultLocale: string;
    keys: string[];
  };
}

export interface BladePlan {
  id: string;
  type: "list" | "details";
  title: string;
  route: string;
  icon?: string;
  isWorkspace?: boolean;
  component: ComponentPlan;
  features?: string[];
  metadata?: Record<string, unknown>;
}

export interface ComponentPlan {
  type: string; // Resolved component (e.g., "VcTable", "VcForm")
  props?: Record<string, unknown>;
  slots?: SlotPlan[];
  events?: EventPlan[];
}

export interface SlotPlan {
  name: string;
  content?: ComponentPlan;
}

export interface EventPlan {
  name: string;
  handler: string;
}

export interface DataSource {
  type: "api" | "mock" | "store";
  endpoint?: string;
  method?: string;
  schema?: Record<string, unknown>;
}

/**
 * Code Synthesis Request
 * Input to synthesizers
 */
export interface SynthesisRequest {
  blade: BladePlan;
  module: string;
  analysis: EntityAnalysis;
  dependencies: SynthesisDependencies;
}

export interface SynthesisDependencies {
  components: string[]; // ["VcTable", "VcBlade"]
  frameworkAPIs: string[]; // ["useApiClient", "useBladeNavigation"]
  composables: string[]; // ["useOffersList"]
}

/**
 * Code Synthesis Result
 * Output from synthesizers
 */
export interface SynthesisResult {
  blade: {
    path: string;
    content: string;
  };
  composable?: {
    path: string;
    content: string;
  };
  apiClient?: {
    path: string;
    content: string;
  };
  locales?: {
    path: string;
    content: string;
  }[];
}

/**
 * Analysis Schema
 * JSON Schema for PromptAnalysis validation
 */
export interface AnalysisSchema {
  type: string;
  properties: Record<string, unknown>;
  required: string[];
}
