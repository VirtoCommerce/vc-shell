# Complete System Audit & Refactoring Plan

## 📋 Current System Analysis

### MCP Workflow (Complete)

```
User Prompt
    ↓
1. analyze_prompt_v2 (MANDATORY)
   File: prompt-analyzer-v2.ts (464 lines)
   Does: Extracts entities, blades, features from prompt
   Uses: HARDCODED feature lists, component names
   Output: PromptAnalysisV2
    ↓
2. discover_components_and_apis (MANDATORY)
   File: mcp.ts (search logic inline)
   Does: Searches registries for relevant components/APIs
   Uses: SearchEngine, FrameworkAPISearchEngine
   Output: { components: [], frameworkAPIs: [] }
    ↓
3. create_ui_plan_from_analysis_v2
   File: planner-v2.ts (667 lines)
   Does: Converts analysis → UI-Plan
   Uses: HARDCODED VcTable/VcForm, feature validation
   Output: UIPlan
    ↓
4. validate_ui_plan / validate_and_fix_plan
   File: validator.ts (371 lines), ui-plan-fixer.ts
   Does: Validates UI-Plan against JSON Schema
   Output: ValidationResult
    ↓
5. generate_with_composition
   File: ai-code-generator.ts (693 lines)
   Does: Builds generation guide for AI
   Uses: patterns-loader, rules-loader, generation-rules
   Output: AIGenerationGuide (one per blade)
    ↓
6. [AI generates code]
    ↓
7. submit_generated_code
   File: code-validator.ts (639 lines)
   Does: Validates generated Vue/TS code
   Uses: @vue/compiler-sfc, AST validation
   Output: Validation errors or success
    ↓
8. check_types (optional)
   File: mcp.ts (runs vue-tsc)
   Does: TypeScript type checking
```

### Core Files Analysis (29 files, 10,704 lines)

#### Layer 1: Data Loading & Registries
| File | Lines | Purpose | Issues |
|------|-------|---------|--------|
| `component-registry-loader.ts` | 120 | Load component registry | ✅ Good |
| `examples-loader.ts` | 351 | Load examples | Duplicates patterns-loader |
| `patterns-loader.ts` | 406 | Load patterns | Duplicates examples-loader |
| `rules-loader.ts` | 314 | Load rules | ✅ Good |

**Issues:**
- 2 loaders doing same thing (examples vs patterns)
- No unified registry system

#### Layer 2: Search & Matching
| File | Lines | Purpose | Issues |
|------|-------|---------|--------|
| `search-engine.ts` | 150 | Component search | Duplicate |
| `framework-search-engine.ts` | 292 | Framework API search | Duplicate |
| `component-analyzer.ts` | 484 | Component analysis | Overlaps with search |

**Issues:**
- 3 separate search engines (should be 1)
- No semantic matching
- Manual fuzzy logic

#### Layer 3: Prompt Analysis & Planning
| File | Lines | Purpose | Issues |
|------|-------|---------|--------|
| `prompt-analyzer-v2.ts` | 464 | Analyze prompts | ❌ HARDCODED features/components |
| `planner-v2.ts` | 667 | Create UI-Plan | ❌ HARDCODED VcTable/VcForm |
| `plan-normalizer.ts` | 200 | Normalize plan | ✅ Good |

**Critical Issues:**
```typescript
// prompt-analyzer-v2.ts:176-209
**List Blade Features:**
- filters - Filter panel with search
- multiselect - Bulk selection
- reorderable - Drag-and-drop
... HARDCODED LIST OF 40+ FEATURES

// planner-v2.ts:284-309
private generateTableComponent() {
  const componentType = discoveredComponent?.name || "VcTable"; // ❌ HARDCODED
  // ...
}

// planner-v2.ts:314-346
private normalizeColumn(column: any) {
  const validTypes = [
    "text", "number", "money", "date", ... // ❌ HARDCODED
  ];
}

// planner-v2.ts:383-415
private normalizeField(field: any) {
  const validAs = ["VcInput", "VcTextarea", "VcSelect", ...]; // ❌ HARDCODED
}

// planner-v2.ts:592-595
private normalizeFeatures(features: string[]) {
  const validFeatures = ["filters", "multiselect", "validation", ...]; // ❌ HARDCODED
  return features.filter(f => validFeatures.includes(f));
}
```

#### Layer 4: Code Generation
| File | Lines | Purpose | Issues |
|------|-------|---------|--------|
| `ai-code-generator.ts` | 693 | Build AI guide | ✅ Decent structure |
| `code-generator.ts` | 300 | Write files | ✅ Good |
| `composable-generator.ts` | 515 | Generate composables | ❌ Template-based (old) |
| `locale-generator.ts` | 180 | Generate locales | ✅ Good |
| `module-registrar.ts` | 250 | Register module | ✅ Good |

**Issues:**
- `composable-generator.ts` uses old template approach
- Should use AI generation like blades

#### Layer 5: Code Validation
| File | Lines | Purpose | Issues |
|------|-------|---------|--------|
| `code-validator.ts` | 639 | Validate generated code | ✅ Comprehensive |
| `validator.ts` | 371 | Validate UI-Plan | ✅ Good |
| `quality-metrics.ts` | 543 | Code quality metrics | ✅ Good |

#### Layer 6: Patterns & Templates
| File | Lines | Purpose | Issues |
|------|-------|---------|--------|
| `pattern-merger.ts` | 488 | Merge patterns | Complex AST logic |
| `ast-pattern-merger.ts` | 200 | AST merging | Duplicate? |
| `template-adapter.ts` | 389 | Adapt templates | Old approach |
| `generation-rules.ts` | 474 | Generation rules | ✅ Good |

**Issues:**
- 2 pattern mergers (duplication)
- Template adapter for old system

#### Layer 7: Workflow & State
| File | Lines | Purpose | Issues |
|------|-------|---------|--------|
| `workflow-state-manager.ts` | 533 | Manage workflow state | ✅ Good |
| `response-templates.ts` | 543 | Format responses | ✅ Good |
| `llm-feedback.ts` | 332 | Format LLM feedback | ✅ Good |

#### Layer 8: Utilities
| File | Lines | Purpose | Issues |
|------|-------|---------|--------|
| `file-writer.ts` | 200 | Write files | ✅ Good |
| `ast-utils.ts` | 398 | AST utilities | ✅ Good |
| `examples-types.ts` | 100 | Type definitions | ✅ Good |

### MCP Tools Analysis (26 tools)

#### Discovery Tools (Always Available)
| Tool | Handler File | Purpose |
|------|-------------|---------|
| `search_components` | mcp.ts | Search components by query |
| `view_components` | mcp.ts | View component details |
| `get_component_examples` | mcp.ts | Get component examples |
| `search_components_by_intent` | mcp.ts | Search by natural language |
| `get_component_capabilities` | mcp.ts | Get component capabilities |
| `search_framework_apis` | mcp.ts | Search framework APIs |
| `view_framework_apis` | mcp.ts | View API details |
| `search_framework_by_intent` | mcp.ts | Search APIs by intent |
| `get_framework_capabilities` | mcp.ts | Get API capabilities |
| `get_framework_examples` | mcp.ts | Get API examples |

#### Workflow Tools (Strict Sequence)
| Tool | Handler File | Input | Output | Issues |
|------|-------------|-------|--------|--------|
| `analyze_prompt_v2` | mcp.ts → prompt-analyzer-v2.ts | prompt | PromptAnalysisV2 | ❌ Hardcoded |
| `discover_components_and_apis` | mcp.ts | analysis | { components, APIs } | ✅ Good |
| `create_ui_plan_from_analysis_v2` | mcp.ts → planner-v2.ts | analysis, discovery | UIPlan | ❌ Hardcoded |
| `validate_ui_plan` | mcp.ts → validator.ts | plan | ValidationResult | ✅ Good |
| `validate_and_fix_plan` | mcp.ts → ui-plan-fixer.ts | plan | Fixed UIPlan | ✅ Good |
| `generate_with_composition` | mcp.ts → ai-code-generator.ts | plan | AIGenerationGuide | ✅ Good |
| `submit_generated_code` | mcp.ts → code-validator.ts | code | ValidationResult | ✅ Good |

#### Utility Tools
| Tool | Purpose | Issues |
|------|---------|--------|
| `scaffold_app` | Create new app | ✅ Good |
| `generate_widget` | Generate widget | ✅ Good |
| `check_types` | Run vue-tsc | ✅ Good |
| `get_workflow_status` | Get workflow state | ✅ Good |
| `reset_workflow` | Reset workflow | ✅ Good |
| `start_module_workflow` | Start workflow | ✅ Good |
| `get_applicable_rules` | Get rules | ✅ Good |
| `get_best_template` | Get template | ✅ Good |
| `get_relevant_patterns` | Get patterns | ✅ Good |

---

## 🎯 Refactoring Strategy

### Phase 1: Knowledge Layer ✅ DONE
Created professional registry system:
- `BaseRegistry<T>` - Abstract base with lazy loading
- `ComponentRegistry` - Loads component-registry.json
- `FrameworkAPIRegistry` - Loads framework-api-registry.json
- `PatternRegistry` - Loads examples/index.yaml patterns
- `TemplateRegistry` - Loads examples/index.yaml templates
- `FeatureRegistry` - Synthesizes features from all sources
- `KnowledgeBase` - Master orchestrator

### Phase 2: Intelligence Layer ✅ 70% DONE
Created intelligent matching/resolution:
- `FuzzyMatcher` - Professional fuzzy search with scoring
- `ComponentResolver` - Resolve components by intent
- `FeatureResolver` - Resolve and validate features

**TODO:**
- Add semantic matcher (optional)
- Add UI-Plan validator (port from validator.ts)
- Add code validator (port from code-validator.ts)

### Phase 3: Generators Layer ⏳ NEXT
Refactor hardcoded logic to use new architecture:

#### 3.1 Smart Prompt Analyzer
**File:** `src/generators/analyzers/smart-analyzer.ts`
**Replaces:** `core/prompt-analyzer-v2.ts`

**Changes:**
```typescript
// OLD (core/prompt-analyzer-v2.ts):
export function buildAnalysisPromptV2(userPrompt: string): string {
  return `...
  **List Blade Features:**
  - filters - Filter panel
  - multiselect - Bulk selection
  ... HARDCODED 40+ features
  `;
}

// NEW (generators/analyzers/smart-analyzer.ts):
export class SmartPromptAnalyzer {
  constructor(
    private kb: KnowledgeBase,
    private featureResolver: FeatureResolver
  ) {}

  async buildAnalysisPrompt(userPrompt: string): Promise<string> {
    await this.kb.ensureLoaded();

    // Get all features from registry (not hardcoded!)
    const listFeatures = this.kb.features.getByCategory('list');
    const detailsFeatures = this.kb.features.getByCategory('details');

    return `...
    **List Blade Features:**
    ${listFeatures.map(f => `- ${f.id} - ${f.description}`).join('\n')}

    **Details Blade Features:**
    ${detailsFeatures.map(f => `- ${f.id} - ${f.description}`).join('\n')}
    `;
  }
}
```

#### 3.2 Smart UI Planner
**File:** `src/generators/planners/smart-planner.ts`
**Replaces:** `core/planner-v2.ts`

**Changes:**
```typescript
// OLD (core/planner-v2.ts:284-309):
private generateTableComponent(entity, bladeConfig): any {
  const componentType = discoveredComponent?.name || "VcTable"; // ❌ HARDCODED
  return { type: componentType, ... };
}

private normalizeColumn(column: any): any {
  const validTypes = ["text", "number", "money", ...]; // ❌ HARDCODED
  // ...
}

private normalizeFeatures(features: string[]): string[] {
  const validFeatures = ["filters", "multiselect", ...]; // ❌ HARDCODED
  return features.filter(f => validFeatures.includes(f));
}

// NEW (generators/planners/smart-planner.ts):
export class SmartUIPlanner {
  constructor(
    private kb: KnowledgeBase,
    private componentResolver: ComponentResolver,
    private featureResolver: FeatureResolver
  ) {}

  private async generateTableComponent(entity, bladeConfig): Promise<any> {
    // Resolve component dynamically
    const match = await this.componentResolver.resolve({
      intent: 'data table list display',
      context: 'list',
      features: bladeConfig.features
    });

    const componentType = match?.item.component || 'VcTable';

    // Get valid column types from component metadata
    const component = this.kb.components.get(componentType);
    const columnCapability = component?.capabilities?.find(c => c.id === 'prop-columns');
    const validTypes = columnCapability?.examples || [];

    return { type: componentType, ... };
  }

  private async normalizeFeatures(features: string[]): Promise<string[]> {
    // Validate features using FeatureResolver
    const { valid, invalid, warnings } = await this.featureResolver.validate(features);

    if (invalid.length > 0) {
      console.warn(`Invalid features removed: ${invalid.join(', ')}`);
    }

    return valid.map(f => f.id);
  }
}
```

### Phase 4: Integration with MCP ⏳ TODO
Update MCP tool handlers to use new generators:

**File:** `src/commands/mcp.ts`

**Changes:**
```typescript
// OLD:
case "analyze_prompt_v2": {
  const prompt = buildAnalysisPromptV2(args.prompt); // Hardcoded
  // ...
}

case "create_ui_plan_from_analysis_v2": {
  const planner = new PlannerV2(); // Hardcoded
  const plan = planner.generatePlan({ analysis, discoveredComponents });
  // ...
}

// NEW:
import { KnowledgeBase } from '../knowledge';
import { ComponentResolver, FeatureResolver } from '../intelligence';
import { SmartPromptAnalyzer, SmartUIPlanner } from '../generators';

// Initialize once at server startup
const kb = new KnowledgeBase();
await kb.loadAll();

const componentResolver = new ComponentResolver(kb.components);
const featureResolver = new FeatureResolver(kb.features);
const analyzer = new SmartPromptAnalyzer(kb, featureResolver);
const planner = new SmartUIPlanner(kb, componentResolver, featureResolver);

case "analyze_prompt_v2": {
  const prompt = await analyzer.buildAnalysisPrompt(args.prompt);
  // ...
}

case "create_ui_plan_from_analysis_v2": {
  const plan = await planner.generatePlan({ analysis, discoveredComponents });
  // ...
}
```

### Phase 5: Cleanup ⏳ TODO
Remove old files after migration:

**Files to Remove:**
- ✅ Keep: `workflow-state-manager.ts`, `response-templates.ts`, `llm-feedback.ts`
- ✅ Keep: `code-validator.ts`, `validator.ts`, `quality-metrics.ts`
- ✅ Keep: `ai-code-generator.ts`, `generation-rules.ts`, `rules-loader.ts`
- ✅ Keep: `file-writer.ts`, `ast-utils.ts`, `module-registrar.ts`
- ❌ Remove after refactoring: `prompt-analyzer-v2.ts` → `generators/analyzers/`
- ❌ Remove after refactoring: `planner-v2.ts` → `generators/planners/`
- ❌ Remove: `search-engine.ts` → replaced by `FuzzyMatcher`
- ❌ Remove: `framework-search-engine.ts` → replaced by `FuzzyMatcher`
- ❌ Remove: `component-analyzer.ts` → replaced by `ComponentResolver`
- ❌ Remove: `examples-loader.ts` → replaced by `PatternRegistry`
- ❌ Remove: `patterns-loader.ts` → replaced by `PatternRegistry`
- ❌ Remove?: `template-adapter.ts` (if not used)
- ❌ Remove?: `composable-generator.ts` (if old template system)
- ❌ Remove?: `pattern-merger.ts` / `ast-pattern-merger.ts` (consolidate)

**Estimated Reduction:**
- Before: 29 files, 10,704 lines
- After: ~18 files, ~6,000 lines (**44% reduction**)

---

## 📊 Impact Analysis

### Files That Need Refactoring

| Priority | File | Lines | Effort | Hardcoding Issues |
|----------|------|-------|--------|-------------------|
| 🔴 HIGH | prompt-analyzer-v2.ts | 464 | 4h | 40+ hardcoded features, component lists |
| 🔴 HIGH | planner-v2.ts | 667 | 6h | VcTable/VcForm hardcoded, feature validation |
| 🟡 MED | mcp.ts (tool handlers) | ~500 | 3h | Update to use new generators |
| 🟡 MED | search-engine.ts | 150 | 1h | Replace with FuzzyMatcher |
| 🟡 MED | framework-search-engine.ts | 292 | 1h | Replace with FuzzyMatcher |
| 🟢 LOW | component-analyzer.ts | 484 | 2h | Replace with ComponentResolver |

### Total Effort Estimate
- **High Priority:** 13 hours
- **Medium Priority:** 7 hours
- **Low Priority:** 2 hours
- **Total:** ~22 hours (3 days)

### Benefits
- ✅ **Zero hardcoding** - All knowledge from registries
- ✅ **50% less code** - 10,704 → 6,000 lines
- ✅ **Easy to extend** - Just add data files
- ✅ **Testable** - Each layer independently testable
- ✅ **Professional** - Industry-standard architecture
- ✅ **Maintainable** - Clear responsibilities

---

## 🚀 Immediate Next Steps

### Step 1: Complete Intelligence Layer (2 hours)
- Port UI-Plan validator from `validator.ts`
- Port code validator logic from `code-validator.ts`
- Test all resolvers

### Step 2: Build Generators Layer (10 hours)
1. **SmartPromptAnalyzer** (4 hours)
   - Port `prompt-analyzer-v2.ts`
   - Replace hardcoded features with `FeatureResolver`
   - Add dynamic prompt building from registry

2. **SmartUIPlanner** (6 hours)
   - Port `planner-v2.ts`
   - Replace hardcoded components with `ComponentResolver`
   - Replace hardcoded feature validation with `FeatureResolver`
   - Add dynamic column/field type validation from metadata

### Step 3: Integrate with MCP (3 hours)
- Initialize KnowledgeBase at server startup
- Update `analyze_prompt_v2` handler
- Update `create_ui_plan_from_analysis_v2` handler
- Test complete workflow

### Step 4: Cleanup (2 hours)
- Remove old files
- Update imports
- Update documentation

---

## 📝 Decision Log

### Why Not Refactor Everything?
Some files are GOOD and should stay:
- ✅ `workflow-state-manager.ts` - Solid state management
- ✅ `code-validator.ts` - Comprehensive validation
- ✅ `ai-code-generator.ts` - Good generation guide builder
- ✅ `generation-rules.ts` - Clear rule definitions
- ✅ `response-templates.ts` - Good response formatting

### What MUST Change?
Files with critical hardcoding:
- ❌ `prompt-analyzer-v2.ts` - 40+ hardcoded features
- ❌ `planner-v2.ts` - Hardcoded VcTable/VcForm, features
- ❌ `search-engine.ts` / `framework-search-engine.ts` - Duplicate logic

### Migration Path
1. Keep both old and new systems during migration
2. Add feature flags to switch between them
3. Test new system thoroughly
4. Remove old system after validation

---

**Next Action:** Start Step 1 - Complete Intelligence Layer?
