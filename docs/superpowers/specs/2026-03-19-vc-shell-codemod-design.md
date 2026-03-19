# @vc-shell/codemod — Design Spec

**Date:** 2026-03-19
**Status:** Draft
**Package:** `@vc-shell/codemod` (new workspace package in `cli/codemod/`)

## Problem

The framework has accumulated 12+ migration tasks in MIGRATION_GUIDE.md. External module developers must apply these manually. Each framework version may introduce new transforms.

## Solution

A single-command migration tool inspired by [Storybook's migration approach](https://storybook.js.org/docs/releases/migration-guide). One command upgrades everything:

```bash
npx @vc-shell/codemod
```

## What the command does

1. Detects current `@vc-shell/framework` version in package.json (with `workspace:*` resolution fallback)
2. Detects target version (latest from npm registry, or `--to 2.0.0`)
3. Runs **all** transforms needed for that version range (in correct order)
4. Optionally updates dependency versions in package.json (`--update-deps`)
5. Prints summary + link to MIGRATION_GUIDE.md

## CLI Interface

```bash
# Full migration to latest
npx @vc-shell/codemod

# Migration to specific version
npx @vc-shell/codemod --to 2.0.0

# Preview without writing
npx @vc-shell/codemod --dry-run

# Run only a specific transform
npx @vc-shell/codemod --transform rewrite-imports

# List available transforms
npx @vc-shell/codemod --list

# Specify working directory (for monorepo consumers)
npx @vc-shell/codemod --cwd packages/my-module

# Also update dependency versions in package.json
npx @vc-shell/codemod --update-deps
```

## Pre-Flight Checks

Before running any transforms, the CLI performs:

1. **Dirty working tree check**: If `git status` shows uncommitted changes, print a warning: "You have uncommitted changes. We recommend committing or stashing before running migrations. Continue? (y/N)". Not a hard error — the user may choose to proceed.
2. **Version detection**: Resolve `@vc-shell/framework` version from package.json. If the value is `workspace:*`, fall back to `node_modules/@vc-shell/framework/package.json` or `yarn.lock`.
3. **Target version resolution**: If no `--to` flag, query npm registry for latest version. Print resolved `from → to` before proceeding.

## Version-Based Transform Registry

Each transform is tagged with a **version boundary** — it applies when the consumer's current version is below this boundary:

```ts
interface VersionedTransform {
  name: string;
  description: string;
  /**
   * The version that introduced the breaking change this transform fixes.
   * Transform runs when: semver.lt(currentVersion, introducedIn)
   *
   * Example: introducedIn "2.0.0-alpha.5" means this transform runs
   * for projects on 2.0.0-alpha.4 or below, but NOT for 2.0.0-alpha.5+
   */
  introducedIn: string;
  /** Migration guide section reference */
  migrationGuideSection?: string;
  run(project: Project, options: TransformOptions): TransformResult;
}

const transforms: VersionedTransform[] = [
  { name: "define-app-module",           introducedIn: "2.0.0-alpha.5" },
  { name: "use-blade-migration",         introducedIn: "2.0.0-alpha.8" },
  { name: "notification-migration",      introducedIn: "2.0.0-alpha.10" },
  { name: "rewrite-imports",             introducedIn: "2.0.0" },
  { name: "remove-deprecated-aliases",   introducedIn: "2.0.0" },
  { name: "blade-props-simplification",  introducedIn: "2.0.0" },
  { name: "icon-audit",                  introducedIn: "2.0.0" },
  { name: "scss-safe-use",              introducedIn: "2.0.0" },
];
```

**Selection logic**: A transform runs when `semver.lt(currentVersion, transform.introducedIn)`.

**Worked examples:**
- Migrating `1.x` → `2.0.0`: all 8 transforms run (all `introducedIn` values are > 1.x)
- Migrating `2.0.0-alpha.4` → `2.0.0`: all 8 run (alpha.4 < alpha.5 < alpha.8 < ... < 2.0.0)
- Migrating `2.0.0-alpha.8` → `2.0.0`: 5 run (skip `define-app-module` and `use-blade-migration` since alpha.8 >= their `introducedIn`)
- Migrating `2.0.0-alpha.10` → `2.0.0`: 4 run (skip first 3)

## Architecture

```
cli/codemod/
├── src/
│   ├── cli.ts                   # CLI entry (commander)
│   ├── runner.ts                # Detect version, select transforms, execute
│   ├── version-detector.ts      # Read current version (package.json → lockfile → node_modules fallback)
│   ├── dependency-updater.ts    # Update @vc-shell/* versions (opt-in via --update-deps)
│   ├── transforms/
│   │   ├── registry.ts          # Versioned transform registry + selection logic
│   │   ├── rewrite-imports.ts
│   │   ├── remove-deprecated-aliases.ts
│   │   ├── blade-props-simplification.ts
│   │   ├── use-blade-migration.ts
│   │   ├── define-app-module.ts
│   │   ├── notification-migration.ts
│   │   ├── icon-audit.ts        # Diagnostic-only (renamed from icon-migration)
│   │   └── scss-safe-use.ts     # Safe mechanical subset (renamed from scss-import-to-use)
│   └── utils/
│       ├── vue-sfc.ts           # Vue SFC handling (see "Vue SFC Processing" section)
│       └── import-rewriter.ts   # Common import manipulation
├── tests/
│   ├── transforms/              # Before/after fixture tests per transform
│   └── runner/                  # Version selection logic unit tests
├── package.json
└── tsconfig.json
```

## Tool Stack

- **ts-morph** — TypeScript-aware AST for `<script>` / `<script setup>` blocks and `.ts` files
- **@vue/compiler-dom** — Vue template AST for template-level transforms (icon audit, blade props)
- **semver** — Version comparison and range matching

## Vue SFC Processing

The `utils/vue-sfc.ts` module handles Vue Single File Component parsing:

### Script blocks
- Extract `<script setup lang="ts">` and/or `<script lang="ts">` blocks
- Transform each with ts-morph as standalone TS
- Write back to the original SFC, preserving template/style blocks and whitespace

### Template blocks
- For transforms that need template access (icon-audit, blade-props-simplification): parse with `@vue/compiler-dom`
- Transform the AST, then serialize back to template string

### Edge cases
| Case | Handling |
|---|---|
| `<script>` (no setup) | Process normally — Options API legacy code needs transforms too |
| Both `<script>` + `<script setup>` | Process both blocks independently |
| `lang="js"` or no lang attr | Skip with warning: "Skipping {file}: JavaScript script blocks not supported, manual migration needed" |
| No `<script>` block | Skip (style-only or template-only SFC) |

### Diagnostics
ts-morph line numbers are relative to the extracted script block. Diagnostic output maps them back to original `.vue` file line numbers for accurate error reporting.

## Transforms Catalog

### Automated transforms (modify code)

| Transform | Description | MIGRATION_GUIDE ref |
|---|---|---|
| `rewrite-imports` | Remap imports for symbols moved to `/ai-agent`, `/extensions` | New section |
| `remove-deprecated-aliases` | `BladeInstance` → `BladeInstanceKey`, etc. | New section |
| `use-blade-migration` | `useBladeNavigation()` → `useBlade()` + `onBeforeClose` boolean inversion (see below) | Section 10 |
| `define-app-module` | `createAppModule(pages, locales)` → `defineAppModule({...})` | "Migrating to defineAppModule" |
| `notification-migration` | `useNotifications` → `useBladeNotifications` | "Notifications System Redesign" |
| `blade-props-simplification` | Remove boilerplate `expanded/closable/param/options` props and `parent:call/close:blade/collapse:blade/expand:blade` emits from blade components. These are now handled internally by VcBlade via blade context injection. Ref: VcBlade props simplification spec (linked from MIGRATION_GUIDE). | New section |

### Diagnostic-only transforms (report, don't modify)

| Transform | Description | MIGRATION_GUIDE ref |
|---|---|---|
| `icon-audit` | Detect all `fas fa-*` / `far fa-*` / `fa-*` icon strings in templates and props. Output a report of unique icons found with suggested Material Symbols/Lucide replacements for the ~30 most common icons. **Does NOT auto-replace** — icon mapping is semantic, not mechanical. | Section 2 |
| `scss-safe-use` | Convert `@import 'tailwind'` → `@use 'tailwind'` and similar safe mechanical cases. **Does NOT** handle file deletion, content merging, or `@use` namespace prefixes (which change `$var` → `namespace.$var`). Prints a checklist for manual steps: remove old `base.scss`/`colors.scss`, move custom styles. | Section 3.2 |

### `use-blade-migration`: `onBeforeClose` boolean inversion

The `onBeforeClose` callback has **inverted boolean semantics** between the old and new API:
- **Legacy** (`useBladeNavigation`): `return false` → prevent close
- **New** (`useBlade`): `return true` → prevent close (= "yes, has unsaved changes")

The transform:
1. Renames `useBladeNavigation()` → `useBlade()`
2. Detects `onBeforeClose` callback assignments
3. For each callback: wraps the return expression with logical NOT (`!`)
4. Emits a warning for complex callbacks (multiple returns, conditional logic) that need manual review

### `blade-props-simplification`: Remove blade boilerplate props/emits

This transform removes the ~20 lines of boilerplate that every blade page declares to forward props/events between VcBladeSlot and VcBlade. After this transform, blade pages use `useBlade()` directly.

#### What it removes

**From `<template>`:**
- `:expanded="expanded"` from `<VcBlade>`
- `:closable="closable"` from `<VcBlade>`
- `@close="$emit('close:blade')"` from `<VcBlade>`
- `@expand="$emit('expand:blade')"` from `<VcBlade>`
- `@collapse="$emit('collapse:blade')"` from `<VcBlade>`

**From `<script setup>`:**
- `expanded` and `closable` from the Props interface/type
- `param` and `options` from the Props interface/type (if present)
- The entire Emits interface containing `close:blade`, `expand:blade`, `collapse:blade`, `parent:call`
- `defineEmits<Emits>()` call
- `withDefaults(defineProps<Props>(), { expanded: true, closable: true })` — replaced with plain `defineProps<Props>()` if Props still has other fields, or removed entirely if Props is empty
- `IParentCallArgs` from import declarations

#### What it adds/replaces

**In `<script setup>`:**
- Adds `useBlade` to the import from `@vc-shell/framework` (if not already present)
- Adds destructuring: `const { param, options, closeSelf, callParent } = useBlade();` (only methods that are actually used in the file)
- Replaces `emit("parent:call", { method: "X" })` → `callParent("X")`
- Replaces `emit("parent:call", { method: "X", args: Y })` → `callParent("X", Y)`
- Replaces `emit("close:blade")` → `closeSelf()`
- Replaces `props.param` → `param.value`
- Replaces `props.options` → `options.value`

#### Detection heuristics (ts-morph)

1. **Find Props interface/type** with `expanded?: boolean` or `closable?: boolean` fields — this is the blade boilerplate marker
2. **Find Emits interface** with `"close:blade"` or `"parent:call"` signatures
3. If neither is found, skip the file (not a blade page)

#### Template transforms (@vue/compiler-dom)

1. Find `<VcBlade>` element in the template AST
2. Remove attributes: `:expanded`, `:closable`, `@close` (only if value matches `$emit('close:blade')` pattern)
3. Remove `@expand` and `@collapse` (only if value matches `$emit('expand:blade')` / `$emit('collapse:blade')` pattern)
4. **Do NOT remove** `@expand`/`@collapse` if bound to custom handlers (e.g., `@expand="onExpand"`)

#### Edge cases

| Case | Handling |
|---|---|
| Custom `@close` handler (e.g., `@close="onClose"`) | Keep as-is + emit warning: "Custom @close handler detected, manual migration needed" |
| Props interface has non-blade fields (e.g., `model`) | Remove only blade fields, keep the rest |
| `emit("parent:call", { method, args, callback })` with callback | Warning: "parent:call with callback detected, manual migration needed" |
| File already uses `useBlade()` | Merge destructuring — add missing methods to existing destructuring |
| Multiple `useBlade()` calls | Warning: "Multiple useBlade() calls detected, manual consolidation recommended" |
| `options` used with specific type (e.g., `props.options as MyType`) | Replace with `useBlade<MyType>()` generic — extract type from cast expression |

#### Fixture test cases

```
tests/transforms/blade-props-simplification/
├── standard-list/           # List blade with full boilerplate → clean useBlade
├── standard-details/        # Details blade with parent:call + close:blade → callParent + closeSelf
├── custom-close-handler/    # @close="onClose" → kept + warning
├── partial-props/           # Props has non-blade fields (model) → only blade fields removed
├── already-uses-useblade/   # File already destructures useBlade → merge
├── options-with-type-cast/  # props.options as MyType → useBlade<MyType>()
└── no-blade-boilerplate/    # File without blade props → skipped
```

### Future transforms (planned, not in initial release)

| Transform | MIGRATION_GUIDE section | Status |
|---|---|---|
| `dynamic-views-removal` | §9 (Dynamic Views) | Detection-only: error on `createDynamicAppModule` usage |
| `app-bar-widgets` | §6 (App Bar Widgets) | Slot removal, useAppBarWidget introduction |
| `settings-menu` | §7 (Settings Menu) | useSettingsMenu migration |
| `dashboard-migration` | §8 (Dashboard) | Dashboard API changes |
| `widget-registration` | §11 (Widget Registration) | Widget registration redesign |
| `shims-vue-update` | §4 (shims-vue.d.ts) | File content replacement |
| `vue-generic-components` | §5 (Generic Components) | `@vue-generic` migration |

## MIGRATION_GUIDE.md Integration

Each section adds:

```markdown
### Automated Migration
\`\`\`bash
npx @vc-shell/codemod
\`\`\`
Or run only this transform: `npx @vc-shell/codemod --transform <name>`
```

## Package Setup

```jsonc
{
  "name": "@vc-shell/codemod",
  "version": "1.0.0",
  "type": "module",
  "bin": "./dist/cli.js",
  "dependencies": {
    "ts-morph": "^24.0.0",
    "@vue/compiler-dom": "^3.5.0",
    "semver": "^7.7.0",
    "commander": "^12.0.0",
    "chalk": "^5.0.0"
  }
}
```

## Testing

### Per-transform fixture tests
Each transform has `input.*` / `expected.*` fixture files covering:
- `.ts` files
- `.vue` files with `<script setup lang="ts">`
- `.vue` files with `<script lang="ts">` (Options API)
- Edge cases specific to the transform

### Version selection unit tests
`tests/runner/` tests the transform selector:

```ts
// Given (fromVersion, toVersion) → assert selected transform names and order
expect(selectTransforms("1.0.0", "2.0.0")).toEqual([all 8 names]);
expect(selectTransforms("2.0.0-alpha.8", "2.0.0")).toEqual([last 5 names]);
expect(selectTransforms("2.0.0-alpha.10", "2.0.0")).toEqual([last 4 names]);
expect(selectTransforms("2.0.0", "2.1.0")).toEqual([]);  // no transforms needed
```

### Integration test
Full migration from 1.x fixtures to 2.0.0 — runs all transforms in sequence, verifies final output matches expected.
