# Circular Dependency Refactoring

## Status
- Plan created: 2026-03-03
- Design: `docs/plans/2026-03-03-circular-dependencies-design.md`  
- Plan: `docs/plans/2026-03-03-circular-dependencies-plan.md`
- **Execution**: COMPLETED 2026-03-03
- Baseline: 244 cycles → **0 cycles** (madge)
- 12 tasks executed via subagent-driven development
- ~140 files modified across 10 commits

## Approach
- Approach C: `import type` + direct paths
- Barrel files preserved for public API (framework/index.ts)
- Internal imports use direct module paths
- Cross-layer type imports use `import type`
- vite-plugin-circular-dependency re-enabled in production builds

## Remaining TODO
- ESLint `no-restricted-imports` rule to prevent barrel re-introduction
- Verify vendor-portal app production build with circular dependency plugin
