#!/usr/bin/env bash

# Professional AI Codegen Architecture
## Knowledge-Driven, Zero-Hardcoding System

This document describes the new professional architecture for the VC-Shell AI Codegen system.

---

## 🎯 Design Principles

### 1. **Knowledge-Driven**
All framework knowledge comes from structured data files:
- `schemas/component-registry.json` - Component metadata
- `schemas/framework-api-registry.json` - Framework API metadata
- `examples/index.yaml` - Patterns and templates index
- `examples/**/*.md` - Pattern and capability examples

**NO HARDCODING** - If it's not in the data files, it doesn't exist.

### 2. **Layered Architecture**
Clear separation of concerns across 6 layers:
1. **Knowledge Layer** - Data storage and retrieval
2. **Intelligence Layer** - Smart matching and resolution
3. **Generators Layer** - Code generation
4. **Workflows Layer** - Orchestration
5. **MCP Layer** - MCP server implementation
6. **CLI Layer** - Command-line interface

### 3. **Professional Naming**
No more `ai-code-generator.ts` or `pattern-merger.ts`.
Names reflect purpose: `ComponentResolver`, `FeatureRegistry`, `SmartAnalyzer`.

### 4. **Testable**
Every layer is independently testable with clear interfaces.

---

## 📁 Directory Structure

```
src/
├── knowledge/              # Layer 1: Knowledge Base
│   ├── types.ts           # Core type definitions
│   ├── registries/        # Registry implementations
│   │   ├── base.ts        # BaseRegistry<T> abstract class
│   │   ├── components.ts  # ComponentRegistry
│   │   ├── framework.ts   # FrameworkAPIRegistry
│   │   ├── patterns.ts    # PatternRegistry
│   │   ├── templates.ts   # TemplateRegistry
│   │   └── features.ts    # FeatureRegistry (synthesized)
│   ├── knowledge-base.ts  # Master orchestrator
│   └── index.ts           # Public API
│
├── intelligence/           # Layer 2: Smart Logic
│   ├── types.ts           # Intelligence types
│   ├── matchers/          # Intent matching
│   │   ├── fuzzy.ts       # FuzzyMatcher (fuzzysort)
│   │   ├── semantic.ts    # SemanticMatcher (TODO)
│   │   └── hybrid.ts      # HybridMatcher (TODO)
│   ├── resolvers/         # Resolution logic
│   │   ├── component-resolver.ts    # ComponentResolver
│   │   ├── feature-resolver.ts      # FeatureResolver
│   │   ├── capability-resolver.ts   # CapabilityResolver (TODO)
│   │   └── template-resolver.ts     # TemplateResolver (TODO)
│   ├── validators/        # Schema validation (TODO)
│   │   ├── schema.ts      # JSON Schema validator
│   │   ├── ui-plan.ts     # UI Plan validator
│   │   └── code.ts        # Generated code validator
│   └── index.ts           # Public API
│
├── generators/             # Layer 3: Generation (TODO)
│   ├── analyzers/         # Prompt analysis
│   │   ├── prompt.ts      # SmartPromptAnalyzer
│   │   ├── intent.ts      # IntentExtractor
│   │   └── entity.ts      # EntityExtractor
│   ├── planners/          # UI planning
│   │   ├── planner.ts     # SmartUIPlanner
│   │   ├── blade.ts       # BladePlanner
│   │   └── workflow.ts    # WorkflowPlanner
│   ├── synthesizers/      # Code synthesis
│   │   ├── vue.ts         # VueSFCSynthesizer
│   │   ├── composable.ts  # ComposableSynthesizer
│   │   ├── api-client.ts  # APIClientSynthesizer
│   │   └── locale.ts      # LocaleSynthesizer
│   └── index.ts           # Public API
│
├── workflows/              # Layer 4: Orchestration (TODO)
│   ├── types.ts           # Workflow types
│   ├── state.ts           # WorkflowStateManager
│   ├── orchestrator.ts    # WorkflowOrchestrator
│   └── steps/             # Workflow steps
│       ├── analyze.ts     # Step 1: Analyze
│       ├── discover.ts    # Step 2: Discover
│       ├── plan.ts        # Step 3: Plan
│       ├── validate.ts    # Step 4: Validate
│       ├── generate.ts    # Step 5: Generate
│       └── submit.ts      # Step 6: Submit
│
├── mcp/                    # Layer 5: MCP Server (TODO - refactor)
│   ├── server.ts          # MCP server
│   ├── tools/             # MCP tools (refactored to use new arch)
│   └── resources/         # MCP resources
│
└── cli/                    # Layer 6: CLI (existing)
    └── commands/
```

---

## 🏗️ Architecture Layers

### Layer 1: Knowledge Base

**Purpose:** Load and manage all framework knowledge from data files.

**Components:**
- `BaseRegistry<T>` - Abstract base with lazy loading, caching, search
- `ComponentRegistry` - Loads component-registry.json
- `FrameworkAPIRegistry` - Loads framework-api-registry.json
- `PatternRegistry` - Loads examples/index.yaml patterns
- `TemplateRegistry` - Loads examples/index.yaml templates
- `FeatureRegistry` - Synthesizes features from all sources
- `KnowledgeBase` - Master orchestrator

**Example:**
```typescript
import { KnowledgeBase } from './knowledge';

const kb = new KnowledgeBase();
await kb.loadAll();

console.log(kb.stats);
// { components: 30, frameworkAPIs: 15, patterns: 27, templates: 9, features: 45 }

// Search components
const results = kb.components.search({ query: 'table', limit: 5 });

// Get patterns for list blades
const patterns = kb.patterns.getForBladeType('list');

// Validate features
const { valid, invalid } = kb.features.validateFeatures(['filters', 'invalid']);
```

**Key Features:**
- ✅ Zero hardcoding - all from data files
- ✅ Lazy loading - load on demand
- ✅ Caching - in-memory cache
- ✅ Search - fuzzy search with scoring
- ✅ Filtering - by category, type, features, etc.
- ✅ Validation - feature ID validation

---

### Layer 2: Intelligence

**Purpose:** Smart matching, resolution, and validation using Knowledge Layer.

**Components:**
- `FuzzyMatcher` - Fuzzy search using fuzzysort
- `ComponentResolver` - Resolve components by intent
- `FeatureResolver` - Resolve and validate features

**Example:**
```typescript
import { KnowledgeBase } from './knowledge';
import { ComponentResolver, FeatureResolver } from './intelligence';

const kb = new KnowledgeBase();
await kb.loadAll();

// Resolve component by intent
const componentResolver = new ComponentResolver(kb.components);
const match = await componentResolver.resolve({
  intent: 'data table with sorting and filters',
  context: 'list',
  features: ['filters', 'multiselect']
});

console.log(match);
// {
//   item: { component: 'VcTable', ... },
//   score: 0.95,
//   confidence: 0.92,
//   reason: 'Excellent match',
//   matches: ['table', 'sorting', 'filters']
// }

// Resolve features
const featureResolver = new FeatureResolver(kb.features);
const features = await featureResolver.resolve('filterable searchable list', 'list');

// Validate features
const validation = await featureResolver.validate(['filters', 'multiselect', 'invalid']);
// {
//   valid: [FeatureMetadata, FeatureMetadata],
//   invalid: ['invalid'],
//   warnings: []
// }

// Get required components for features
const requiredComponents = await featureResolver.getRequiredComponents(['filters', 'multiselect']);
// Set { 'VcTable', 'VcInput', 'VcSelect' }
```

**Key Features:**
- ✅ Intent-based matching - natural language queries
- ✅ Context-aware - blade type context (list/details)
- ✅ Scoring - relevance scores with confidence
- ✅ Validation - comprehensive validation
- ✅ Dependency resolution - infer required components/APIs

---

### Layer 3: Generators (TODO)

**Purpose:** Generate code using Knowledge + Intelligence layers.

**Flow:**
```
User Prompt
    ↓
SmartPromptAnalyzer (uses FeatureResolver, ComponentResolver)
    ↓
SmartUIPlanner (uses KnowledgeBase for components/features)
    ↓
VueSFCSynthesizer (uses TemplateRegistry, PatternRegistry)
    ↓
Generated Code
```

**Key Difference from Old Code:**
- ❌ OLD: Hardcoded `VcTable`, `VcForm` in code
- ✅ NEW: Resolved dynamically from registry based on intent

---

## 🔄 Migration from Old Architecture

### Old vs New Comparison

| Aspect | Old (Bad) | New (Good) |
|--------|-----------|------------|
| **Components** | Hardcoded `VcTable`, `VcForm` | Resolved from ComponentRegistry |
| **Features** | Hardcoded arrays | Synthesized from FeatureRegistry |
| **Actions** | Hardcoded `["save", "delete"]` | Inferred from patterns |
| **Validation** | Manual if-checks | Schema-based validators |
| **Search** | 3 duplicate search engines | 1 unified FuzzyMatcher |
| **Code Size** | 19,439 lines | ~10,000 lines (50% reduction) |
| **Testability** | Hard to test | Each layer independently testable |

### Migration Steps

1. **Phase 1: Knowledge Layer** ✅ DONE
   - Created all registries
   - Created KnowledgeBase orchestrator
   - All data loaded from files

2. **Phase 2: Intelligence Layer** ✅ IN PROGRESS
   - Created FuzzyMatcher ✅
   - Created ComponentResolver ✅
   - Created FeatureResolver ✅
   - TODO: SemanticMatcher, validators

3. **Phase 3: Generators** ⏳ TODO
   - Refactor prompt-analyzer-v2.ts to use Intelligence Layer
   - Refactor planner-v2.ts to use Intelligence Layer
   - Create synthesizers

4. **Phase 4: Integration** ⏳ TODO
   - Refactor MCP tools to use new architecture
   - Update workflow orchestrator
   - End-to-end testing

5. **Phase 5: Cleanup** ⏳ TODO
   - Remove old files from `/core`
   - Update documentation
   - Performance optimization

---

## 🧪 Testing Strategy

### Unit Tests
Each component is independently testable:

```typescript
// knowledge/registries/components.test.ts
describe('ComponentRegistry', () => {
  it('should load components from JSON', async () => {
    const registry = new ComponentRegistry(examplesDir);
    await registry.load();
    expect(registry.count).toBeGreaterThan(0);
  });

  it('should search components by query', () => {
    const results = registry.search({ query: 'table' });
    expect(results[0].item.component).toBe('VcTable');
  });
});

// intelligence/matchers/fuzzy.test.ts
describe('FuzzyMatcher', () => {
  it('should match items with scoring', () => {
    const matcher = new FuzzyMatcher();
    const items = [
      { item: 'VcTable', searchText: 'table data display', id: 'VcTable' },
      { item: 'VcForm', searchText: 'form input fields', id: 'VcForm' },
    ];
    const matches = matcher.match(items, 'table');
    expect(matches[0].item).toBe('VcTable');
    expect(matches[0].score).toBeGreaterThan(0.7);
  });
});
```

### Integration Tests
Test layer interactions:

```typescript
describe('ComponentResolver Integration', () => {
  it('should resolve component using KnowledgeBase', async () => {
    const kb = new KnowledgeBase();
    await kb.loadAll();

    const resolver = new ComponentResolver(kb.components);
    const match = await resolver.resolve({
      intent: 'data table',
      context: 'list',
    });

    expect(match).not.toBeNull();
    expect(match!.item.component).toBe('VcTable');
  });
});
```

---

## 📊 Performance

### Lazy Loading
Registries load data only when needed:
```typescript
const kb = new KnowledgeBase();
// Nothing loaded yet

await kb.components.ensureLoaded();
// Only components loaded

await kb.loadAll();
// Everything loaded
```

### Caching
Search results and content are cached:
```typescript
const pattern = await kb.patterns.get('workspace-blade');
const content1 = await kb.patterns.getContent('workspace-blade'); // File read
const content2 = await kb.patterns.getContent('workspace-blade'); // From cache
```

### Estimated Performance
- **Registry loading:** ~50-100ms (lazy)
- **Fuzzy search:** ~1-5ms for 100 items
- **Feature validation:** ~1ms for 10 features
- **Total overhead:** Negligible (<100ms)

---

## 🎓 Usage Examples

### Example 1: Find Component for List Blade

```typescript
import { KnowledgeBase } from './knowledge';
import { ComponentResolver } from './intelligence';

const kb = new KnowledgeBase();
await kb.loadAll();

const resolver = new ComponentResolver(kb.components);

// User says: "I need a sortable, filterable data table"
const match = await resolver.resolve({
  intent: 'sortable filterable data table',
  context: 'list',
  features: ['filters', 'sort']
});

console.log(match.item.component); // VcTable
console.log(match.score); // 0.92
console.log(match.reason); // "Excellent match"
```

### Example 2: Validate and Resolve Features

```typescript
import { KnowledgeBase } from './knowledge';
import { FeatureResolver } from './intelligence';

const kb = new KnowledgeBase();
await kb.loadAll();

const resolver = new FeatureResolver(kb.features);

// User provides features
const userFeatures = ['filters', 'multiselect', 'invalid-feature'];

// Validate
const validation = await resolver.validate(userFeatures);
console.log(validation.valid.map(f => f.id)); // ['filters', 'multiselect']
console.log(validation.invalid); // ['invalid-feature']

// Get required components
const components = await resolver.getRequiredComponents(validation.valid.map(f => f.id));
console.log(Array.from(components)); // ['VcTable', 'VcInput', 'VcSelect']

// Get required APIs
const apis = await resolver.getRequiredAPIs(validation.valid.map(f => f.id));
console.log(Array.from(apis)); // ['useApiClient']
```

### Example 3: Find Best Template

```typescript
import { KnowledgeBase } from './knowledge';

const kb = new KnowledgeBase();
await kb.loadAll();

// Find template for list blade with filters and multiselect
const template = kb.templates.findBestMatch('list', ['filters', 'multiselect']);

console.log(template?.id); // 'list-filters' or 'list-multiselect'
console.log(template?.complexity); // 'moderate'

// Load template content
const content = await kb.templates.getContent(template!.id);
console.log(content); // Full Vue SFC content
```

---

## 🚀 Next Steps

1. **Complete Intelligence Layer**
   - Add SemanticMatcher for advanced intent matching
   - Add schema validators

2. **Build Generators Layer**
   - Refactor prompt-analyzer-v2.ts
   - Refactor planner-v2.ts
   - Create synthesizers

3. **Integrate with MCP**
   - Update MCP tools to use new architecture
   - Test end-to-end workflows

4. **Add Tests**
   - Unit tests for all registries
   - Unit tests for all resolvers
   - Integration tests
   - End-to-end tests

5. **Documentation**
   - API documentation
   - Usage guides
   - Migration guide

---

## 📝 Contributing

When adding new components or features:

1. ✅ **Add to registry JSON** - Update `component-registry.json` or `framework-api-registry.json`
2. ✅ **Add examples** - Add capability examples to `examples/capabilities/`
3. ✅ **Add patterns** - Add patterns to `examples/patterns/`
4. ✅ **Update index** - Update `examples/index.yaml`
5. ❌ **DON'T hardcode** - Never hardcode component names in code

---

## ✨ Benefits

### For Developers
- **Easier to maintain** - Clear layer separation
- **Easier to test** - Each component testable
- **Easier to extend** - Just add data files
- **Better code quality** - Professional patterns

### For Users
- **More accurate** - Intent-based matching
- **More flexible** - Dynamic component resolution
- **More features** - All registry features available
- **Better validation** - Comprehensive validation

### For Project
- **50% less code** - Simpler, cleaner
- **Zero hardcoding** - Knowledge-driven
- **Professional** - Industry standards
- **Future-proof** - Easy to extend

---

**Status:** Knowledge Layer ✅ | Intelligence Layer 🔄 | Generators ⏳ | Integration ⏳
