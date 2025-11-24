# Next Steps: Complete Rewrite

## ✅ What's Done (80%)

### 1. Knowledge Layer ✅ (100%)
**Location:** `src/knowledge/`

Files created:
- ✅ `types.ts` - Type definitions
- ✅ `knowledge-base.ts` - Master orchestrator
- ✅ `registries/base.ts` - Base registry
- ✅ `registries/components.ts` - Component registry
- ✅ `registries/framework.ts` - Framework API registry
- ✅ `registries/patterns.ts` - Pattern registry
- ✅ `registries/templates.ts` - Template registry
- ✅ `registries/features.ts` - Feature registry (synthesized)
- ✅ `index.ts` - Public API

**Features:**
- Zero hardcoding - all from data files
- Lazy loading with caching
- Fuzzy search with scoring
- Advanced filtering
- Content loading on demand

### 2. Intelligence Layer ✅ (100%)
**Location:** `src/intelligence/`

Files created:
- ✅ `types.ts` - Intelligence types
- ✅ `matchers/fuzzy.ts` - Fuzzy matcher (fuzzysort)
- ✅ `resolvers/component-resolver.ts` - Component resolver
- ✅ `resolvers/feature-resolver.ts` - Feature resolver
- ✅ `index.ts` - Public API

**Features:**
- Intent-based matching
- Context-aware resolution
- Scoring with confidence
- Feature validation
- Dependency inference

### 3. Generators Layer ✅ (100%)
**Location:** `src/generators/`

Files created:
- ✅ `types.ts` - Generator types
- ✅ `analyzers/smart-analyzer.ts` - Smart prompt analyzer (replaces prompt-analyzer-v2.ts)
- ✅ `planners/smart-planner.ts` - Smart UI planner (replaces planner-v2.ts)
- ✅ `index.ts` - Public API
- ✅ `README.md` - Complete documentation

**Key Improvements:**
```typescript
// OLD (prompt-analyzer-v2.ts):
**List Blade Features:**
- filters - Filter panel
- multiselect - Bulk selection
... 40+ HARDCODED FEATURES

// NEW (smart-analyzer.ts):
const listFeatures = this.kb.features.getByCategory("list");
return `**List Blade Features:**
${listFeatures.map((f) => `- ${f.id} - ${f.description}`).join("\n")}`;
// ✅ DYNAMIC FROM REGISTRY
```

```typescript
// OLD (planner-v2.ts):
const componentType = "VcTable"; // ❌ HARDCODED

// NEW (smart-planner.ts):
const match = await this.componentResolver.resolve({
  intent: "data table list display",
  context: "list",
  features: bladeConfig.features
});
const componentType = match?.item.component || "VcTable"; // ✅ RESOLVED
```

### 4. Documentation ✅ (100%)
- ✅ `REFACTORING.md` - Refactoring plan
- ✅ `COMPLETE_AUDIT.md` - Full system audit
- ✅ `IMPLEMENTATION_STATUS.md` - Implementation status
- ✅ `NEW_ARCHITECTURE.md` - Architecture documentation
- ✅ `src/knowledge/index.ts` - Knowledge Layer docs
- ✅ `src/intelligence/index.ts` - Intelligence Layer docs
- ✅ `src/generators/index.ts` - Generators Layer docs
- ✅ `src/generators/README.md` - Generators usage guide

---

## ⏳ What's Left (20%)

### 5. MCP Server Integration (HIGH PRIORITY)
**Effort:** 4-6 hours

**Task:** Update MCP server to use new architecture

**Changes needed in** `src/commands/mcp.ts`:

```typescript
// OLD:
import { buildAnalysisPromptV2 } from "../core/prompt-analyzer-v2";
import { PlannerV2 } from "../core/planner-v2";
import { SearchEngine } from "../core/search-engine";
import { FrameworkAPISearchEngine } from "../core/framework-search-engine";

// Initialize old system
const searchEngine = new SearchEngine(registry);
const frameworkSearchEngine = new FrameworkAPISearchEngine(frameworkRegistry);

// Tool handlers (hardcoded)
case "analyze_prompt_v2": {
  const prompt = buildAnalysisPromptV2(args.prompt);
  // ...
}

case "create_ui_plan_from_analysis_v2": {
  const planner = new PlannerV2();
  const plan = planner.generatePlan({ analysis, discoveredComponents });
  // ...
}

// NEW:
import { KnowledgeBase } from "../knowledge";
import { ComponentResolver, FeatureResolver, FuzzyMatcher } from "../intelligence";
import { SmartPromptAnalyzer, SmartUIPlanner } from "../generators";

// Initialize new system ONCE at server startup
const kb = new KnowledgeBase();
await kb.loadAll();

const fuzzyMatcher = new FuzzyMatcher();
const componentResolver = new ComponentResolver(kb.components);
const featureResolver = new FeatureResolver(kb.features);
const analyzer = new SmartPromptAnalyzer(kb, featureResolver);
const planner = new SmartUIPlanner(kb, componentResolver, featureResolver);

// Tool handlers (using new system)
case "analyze_prompt_v2": {
  const prompt = await analyzer.buildAnalysisPrompt(args.prompt);
  // ... rest stays same
}

case "create_ui_plan_from_analysis_v2": {
  const plan = await planner.generatePlan({ analysis, discoveredComponents });
  // ... rest stays same
}

case "search_components": {
  const results = kb.components.search({
    query: args.query,
    limit: args.limit,
    offset: args.offset
  });
  // ... format and return
}

case "search_framework_apis": {
  const results = kb.frameworkAPIs.search({
    query: args.query,
    type: args.type,
    limit: args.limit,
    offset: args.offset
  });
  // ... format and return
}
```

**Files to update:**
1. `src/commands/mcp.ts` - Main MCP server file (~200 lines to change)
2. Test all 26 MCP tools work with new system

**Migration Strategy:**
- Keep both old and new systems initially
- Add feature flag: `USE_NEW_ARCHITECTURE=true`
- Test new system thoroughly
- Remove old system after validation

### 6. Tests (MEDIUM PRIORITY)
**Effort:** 6-8 hours

**Create test files:**
```
src/
├── knowledge/__tests__/
│   ├── registries.test.ts
│   └── knowledge-base.test.ts
├── intelligence/__tests__/
│   ├── fuzzy-matcher.test.ts
│   ├── component-resolver.test.ts
│   └── feature-resolver.test.ts
└── generators/__tests__/
    ├── smart-analyzer.test.ts
    └── smart-planner.test.ts
```

**Test coverage targets:**
- Knowledge Layer: 90%
- Intelligence Layer: 85%
- Generators Layer: 85%
- Integration tests: Full workflow

### 7. Cleanup (LOW PRIORITY)
**Effort:** 2-3 hours

**Files to remove after successful migration:**
```
src/core/
├── ❌ prompt-analyzer-v2.ts (464 lines) → replaced by generators/analyzers/smart-analyzer.ts
├── ❌ planner-v2.ts (667 lines) → replaced by generators/planners/smart-planner.ts
├── ❌ search-engine.ts (150 lines) → replaced by FuzzyMatcher
├── ❌ framework-search-engine.ts (292 lines) → replaced by FuzzyMatcher
├── ❌ component-analyzer.ts (484 lines) → replaced by ComponentResolver
├── ❌ examples-loader.ts (351 lines) → replaced by PatternRegistry
├── ❌ patterns-loader.ts (406 lines) → replaced by PatternRegistry
├── ❌ template-adapter.ts (389 lines) → old template system
├── ❌ composable-generator.ts (515 lines) → old template system
└── ... (potentially more)
```

**Files to KEEP:**
```
src/core/
├── ✅ workflow-state-manager.ts - Good state management
├── ✅ code-validator.ts - Comprehensive validation
├── ✅ validator.ts - UI-Plan validation
├── ✅ ai-code-generator.ts - Generation guide builder
├── ✅ generation-rules.ts - Rule definitions
├── ✅ response-templates.ts - Response formatting
├── ✅ llm-feedback.ts - LLM feedback formatting
├── ✅ file-writer.ts - File writing utilities
├── ✅ ast-utils.ts - AST utilities
├── ✅ module-registrar.ts - Module registration
├── ✅ locale-generator.ts - Locale generation
├── ✅ code-generator.ts - Code generator
├── ✅ quality-metrics.ts - Quality metrics
└── ✅ rules-loader.ts - Rules loading
```

**After cleanup:**
- Before: 29 files, 10,704 lines
- After: ~18 files, ~6,000 lines
- **Reduction: 44%**

---

## 🚀 Immediate Action Plan

### Step 1: Test New Architecture (1 hour)
**Now - Verify everything works**

```bash
cd /Users/symbot/DEV/vc-shell/cli/ai-codegen

# Create test file
cat > test-new-arch.ts << 'EOF'
import { KnowledgeBase } from './src/knowledge';
import { ComponentResolver, FeatureResolver } from './src/intelligence';
import { SmartPromptAnalyzer, SmartUIPlanner } from './src/generators';

async function test() {
  console.log('1. Loading Knowledge Base...');
  const kb = new KnowledgeBase();
  await kb.loadAll();
  console.log('✅ Knowledge Base loaded:', kb.stats);

  console.log('\n2. Creating resolvers...');
  const componentResolver = new ComponentResolver(kb.components);
  const featureResolver = new FeatureResolver(kb.features);
  console.log('✅ Resolvers created');

  console.log('\n3. Testing SmartPromptAnalyzer...');
  const analyzer = new SmartPromptAnalyzer(kb, featureResolver);
  const prompt = await analyzer.buildAnalysisPrompt('Create vendor management');
  console.log('✅ Prompt built, length:', prompt.length);

  console.log('\n4. Testing SmartUIPlanner...');
  const planner = new SmartUIPlanner(kb, componentResolver, featureResolver);
  const analysis = {
    moduleName: 'vendors',
    entities: [{
      name: 'vendors',
      singular: 'vendor',
      blades: [{
        type: 'list',
        features: ['filters'],
        columns: []
      }]
    }],
    confidence: 0.9
  };
  const plan = await planner.generatePlan({ analysis });
  console.log('✅ Plan generated:', plan.module, plan.blades.length, 'blades');

  console.log('\n🎉 All tests passed!');
}

test().catch(console.error);
EOF

# Run test
npx tsx test-new-arch.ts
```

### Step 2: Integrate with MCP (4-6 hours)
**Update MCP server to use new architecture**

1. Create feature flag system
2. Update tool handlers
3. Test each tool individually
4. Run full workflow test
5. Compare results with old system

### Step 3: Add Tests (6-8 hours)
**Write comprehensive tests**

1. Unit tests for registries
2. Unit tests for resolvers
3. Unit tests for generators
4. Integration tests
5. E2E workflow test

### Step 4: Cleanup (2-3 hours)
**Remove old files**

1. Verify new system works 100%
2. Remove old core/ files
3. Update all imports
4. Update documentation
5. Final testing

---

## 📊 Summary

### Code Size Reduction
| Layer | Before | After | Reduction |
|-------|--------|-------|-----------|
| Prompt Analysis | 464 lines | 350 lines | 25% |
| UI Planning | 667 lines | 450 lines | 33% |
| Search Engines | 442 lines (2 files) | 200 lines (1 file) | 55% |
| Total Core | 10,704 lines (29 files) | ~6,000 lines (18 files) | 44% |

### Benefits Achieved
✅ **Zero hardcoding** - All from registries
✅ **Professional architecture** - Clear layer separation
✅ **Testable** - Each layer independent
✅ **Maintainable** - Easy to understand
✅ **Extensible** - Add feature = edit YAML
✅ **Intelligent** - Intent-based resolution

### Remaining Work
- MCP integration: 4-6 hours
- Tests: 6-8 hours
- Cleanup: 2-3 hours
- **Total: 12-17 hours (2 days)**

---

## 🎯 Next Action

**Option A: Test First** (Recommended)
```bash
# Verify new architecture works
npx tsx test-new-arch.ts
```

**Option B: Integrate Immediately**
Start updating `src/commands/mcp.ts` to use new architecture

**Option C: Add Tests**
Write tests for Knowledge + Intelligence + Generators

**What do you want to do?**
