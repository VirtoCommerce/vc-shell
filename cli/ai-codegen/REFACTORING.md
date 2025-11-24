# AI Codegen Refactoring Plan

## Current Issues (Audit)

### 1. Architecture Problems
- **29 files in `/core`** - monolithic, unclear responsibilities
- **No layer separation** - knowledge, logic, and generation mixed
- **Heavy duplication** - 3 search engines doing same thing
  - `search-engine.ts` (components)
  - `framework-search-engine.ts` (APIs)
  - `component-analyzer.ts` (capabilities)
- **19,439 lines of code** - excessive for this functionality

### 2. Hardcoding Issues
- **40+ hardcoded mentions** of `VcTable`, `VcForm` across core
- **Feature lists hardcoded** in validators and planners
- **Action lists hardcoded** - no schema-based validation
- **Column types hardcoded** - disconnected from registry

### 3. Data Structure Issues
- Rich knowledge base in `/examples` (346 files)
- Structured registries in `/schemas`
- **BUT**: Code doesn't use them! Knowledge is ignored.

### 4. Code Quality Issues
- **Amateurish naming**: `ai-code-generator.ts`, `pattern-merger.ts`
- **God objects**: Files with 600+ lines
- **No tests**: 19K lines without test coverage
- **Copy-paste**: Same validation logic repeated 5+ times

## New Architecture (Professional)

```
src/
├── knowledge/              # Layer 1: Data & Knowledge
│   ├── types.ts           # Core type definitions
│   ├── registries/        # Registry implementations
│   │   ├── base.ts        # BaseRegistry<T> with lazy loading
│   │   ├── components.ts  # ComponentRegistry
│   │   ├── framework.ts   # FrameworkAPIRegistry
│   │   ├── patterns.ts    # PatternRegistry
│   │   ├── templates.ts   # TemplateRegistry
│   │   └── features.ts    # FeatureRegistry (synthesized)
│   ├── loaders/           # Data loading
│   │   ├── json.ts        # JSON loader
│   │   ├── yaml.ts        # YAML loader
│   │   └── markdown.ts    # Markdown loader
│   ├── indexes/           # Search indexes
│   │   ├── fuzzy.ts       # Fuzzy search index
│   │   └── semantic.ts    # Semantic search index
│   └── knowledge-base.ts  # Master KnowledgeBase orchestrator

├── intelligence/           # Layer 2: Smart Logic
│   ├── matchers/          # Intent matching
│   │   ├── fuzzy.ts       # Fuzzy matcher (fuzzysort)
│   │   ├── semantic.ts    # Semantic matcher
│   │   └── hybrid.ts      # Hybrid matcher (fuzzy + semantic)
│   ├── resolvers/         # Resolution logic
│   │   ├── components.ts  # Component resolver
│   │   ├── capabilities.ts # Capability resolver
│   │   ├── features.ts    # Feature resolver
│   │   └── templates.ts   # Template resolver
│   └── validators/        # Schema validation
│       ├── schema.ts      # JSON Schema validator
│       ├── ui-plan.ts     # UI Plan validator
│       └── code.ts        # Generated code validator

├── generators/             # Layer 3: Generation
│   ├── analyzers/         # Prompt analysis
│   │   ├── prompt.ts      # Smart prompt analyzer
│   │   ├── intent.ts      # Intent extractor
│   │   └── entity.ts      # Entity extractor
│   ├── planners/          # UI planning
│   │   ├── planner.ts     # Smart UI planner
│   │   ├── blade.ts       # Blade planner
│   │   └── workflow.ts    # Workflow planner
│   ├── synthesizers/      # Code synthesis
│   │   ├── vue.ts         # Vue SFC synthesizer
│   │   ├── composable.ts  # Composable synthesizer
│   │   ├── api-client.ts  # API client synthesizer
│   │   └── locale.ts      # Locale synthesizer
│   └── formatters/        # Code formatting
│       ├── prettier.ts    # Prettier formatter
│       └── eslint.ts      # ESLint formatter

├── workflows/              # Layer 4: Orchestration
│   ├── types.ts           # Workflow types
│   ├── state.ts           # State manager
│   ├── orchestrator.ts    # Workflow orchestrator
│   └── steps/             # Workflow steps
│       ├── analyze.ts     # Step 1: Analyze
│       ├── discover.ts    # Step 2: Discover
│       ├── plan.ts        # Step 3: Plan
│       ├── validate.ts    # Step 4: Validate
│       ├── generate.ts    # Step 5: Generate
│       └── submit.ts      # Step 6: Submit

├── mcp/                    # Layer 5: MCP Server
│   ├── server.ts          # MCP server
│   ├── types.ts           # MCP types
│   ├── tools/             # MCP tools
│   │   ├── analyze.ts     # analyze_prompt_v2
│   │   ├── discover.ts    # discover_components_and_apis
│   │   ├── plan.ts        # create_ui_plan_from_analysis_v2
│   │   ├── validate.ts    # validate_ui_plan, validate_and_fix_plan
│   │   ├── generate.ts    # generate_with_composition
│   │   ├── submit.ts      # submit_generated_code
│   │   ├── search.ts      # search_components, search_framework_apis
│   │   ├── view.ts        # view_components, view_framework_apis
│   │   └── workflow.ts    # start_module_workflow, get_workflow_status
│   └── resources/         # MCP resources
│       ├── ui-plan.ts     # vcshell://ui-plan-example-complete
│       ├── patterns.ts    # vcshell://pattern/*
│       └── templates.ts   # vcshell://template/*

└── cli/                    # Layer 6: CLI
    ├── index.ts           # CLI entry
    └── commands/          # CLI commands
        └── mcp.ts         # MCP command

## Migration Strategy

### Phase 1: Foundation (Week 1)
1. ✅ Create knowledge layer types
2. ✅ Implement registries with lazy loading
3. ✅ Create KnowledgeBase orchestrator
4. Add tests for registries

### Phase 2: Intelligence (Week 1)
1. Implement fuzzy matcher
2. Implement semantic matcher
3. Implement resolvers
4. Add tests for intelligence layer

### Phase 3: Generators (Week 2)
1. Refactor prompt analyzer
2. Refactor UI planner
3. Create synthesizers
4. Add tests for generators

### Phase 4: Integration (Week 2)
1. Refactor MCP tools to use new architecture
2. Update workflow orchestrator
3. Migrate existing functionality
4. End-to-end tests

### Phase 5: Cleanup (Week 3)
1. Remove old files from `/core`
2. Update documentation
3. Performance optimization
4. Final testing

## Benefits

1. **Zero hardcoding** - All knowledge from data files
2. **Testable** - Clear layer separation enables testing
3. **Maintainable** - 50% reduction in code size
4. **Extensible** - Easy to add new components/features
5. **Professional** - Industry-standard architecture
6. **Performant** - Lazy loading, caching, indexes

## Code Size Reduction

- **Before**: 19,439 lines, 29 core files
- **After** (estimated): ~10,000 lines, organized in layers
- **Reduction**: ~50%

## Breaking Changes

None. Public API (MCP tools) remains the same.
Internal implementation completely rewritten.
