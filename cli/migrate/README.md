# @vc-shell/migrate

Automated migration tool for upgrading apps to the latest `@vc-shell/framework` version.

Detects your current framework version, selects applicable code transforms, and rewrites your source code — preserving formatting for unchanged lines.

> **Migrating from a version prior to 1.x?** This tool covers migrations from 1.x to 2.0. For older versions, upgrade to 1.x first, then use this tool.

## Quick start

```bash
npx @vc-shell/migrate
```

That's it. The CLI will:

1. Detect your current `@vc-shell/framework` version from `package.json`
2. Select transforms needed for the upgrade path (e.g., 1.x → 2.0.0)
3. Apply each transform to your `src/` files (`.ts` and `.vue`)
4. Print a summary of modified files and any manual action items

## Major changes in 2.0

Before running the migration, review the key breaking changes:

| Change | Impact | Automated? |
|--------|--------|:----------:|
| `createAppModule` → `defineAppModule` | All module entry points | Yes |
| `useBladeNavigation` → `useBlade` | All blade composable usage | Yes |
| `useNotifications` → `useBladeNotifications` | Notification composable | Yes |
| Blade Props/Emits boilerplate removal | All blade components | Yes |
| Import path splitting (ai-agent, extensions) | Imports of moved symbols | Yes |
| Deprecated injection key renames (6 symbols) | Injection key references | Yes |
| `useWidgets` → `useBladeWidgets` | Widget registration | Partial* |
| Composable return type renames (20 types) | Type annotations | Yes |
| VcBanner variant prop values | Template attributes | Yes |
| VcSwitch `tooltip` → `hint` | Template attributes | Yes |
| VcIcon `useContainer` removal | Template attributes | Yes |
| Font Awesome → Material Symbols icons | Icon class names | Diagnostic |
| SCSS `@import` → `@use` | Stylesheet imports | Diagnostic |
| Menu `group`/`groupIcon` → `groupConfig` | Menu configuration | Diagnostic |
| Manual `.d.ts` shims → `@vc-shell/framework/globals` | tsconfig.json | Yes |

\* `useWidgets` is renamed automatically, but `registerWidget`/`unregisterWidget` calls require manual migration to the declarative `useBladeWidgets([...])` API.

**Diagnostic** transforms report issues but do not modify code. Review the output and fix manually.

> If any of these changes are blockers for your project, we recommend staying on your current version until you're ready for a full upgrade.

## CLI options

```bash
npx @vc-shell/migrate [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--to <version>` | Target framework version | `2.0.0` |
| `--transform <name>` | Run only a specific transform (bypasses version filter — runs even if already on target) | all applicable |
| `--dry-run` | Preview changes without writing files | `false` |
| `--list` | List all available transforms and exit | |
| `--cwd <path>` | Working directory (your app root) | `.` |

### Examples

```bash
# Preview what would change (recommended first step)
npx @vc-shell/migrate --dry-run

# Migrate to a specific version
npx @vc-shell/migrate --to 2.0.0-alpha.10

# Run only one transform
npx @vc-shell/migrate --transform blade-props-simplification --dry-run

# List all transforms with descriptions and version ranges
npx @vc-shell/migrate --list

# Migrate a specific app in a monorepo
npx @vc-shell/migrate --cwd apps/vendor-portal
```

## Recommended workflow

1. **Commit your current work** — make sure your working tree is clean
2. **Dry run first** — `npx @vc-shell/migrate --dry-run` to preview changes
3. **Run the migration** — `npx @vc-shell/migrate`
4. **Review the diff** — `git diff` to inspect all changes
5. **Fix manual items** — address any warnings printed by diagnostic transforms
6. **Run your tests** — verify everything works
7. **Commit** — create a dedicated migration commit

## How it works

### Version-based transform selection

Each transform has an `introducedIn` version — the framework version that introduced the breaking change. The CLI selects transforms where:

- Your current version is **below** the breaking change
- The target version **includes** the breaking change

```
Current: 2.0.0-alpha.8  →  Target: 2.0.0

Skipped (already past):
  define-app-module        (introduced in alpha.5)
  use-blade-migration      (introduced in alpha.8)

Applied:
  notification-migration   (introduced in alpha.10)
  rewrite-imports          (introduced in 2.0.0)
  ... and 11 more
```

### Transform categories

| Category | Behavior |
|----------|----------|
| **Script transforms** | Modify `<script>` blocks in `.vue` files and `.ts` files using jscodeshift AST manipulation |
| **Template transforms** | Modify `<template>` blocks in `.vue` files using string-based pattern matching |
| **Script + Template** | Both (e.g., `blade-props-simplification` removes props from script AND attributes from template) |
| **Config transforms** | Modify project configuration files like `tsconfig.json` |
| **Diagnostic** | Report issues via warnings but never modify files — manual action required |

### Format preservation

The tool uses [jscodeshift](https://github.com/facebook/jscodeshift) (built on [recast](https://github.com/benjamn/recast)) for AST transforms. This means:

- **Unchanged lines are preserved exactly** — no reformatting of code you didn't touch
- Only the specific identifiers, imports, and expressions being migrated are rewritten
- Your indentation, quotes, trailing commas, and line breaks stay as they were

### Error isolation

Each file is processed independently with per-file error handling:

- If a transform fails on one file, all other files continue processing
- File writes use atomic operations (write to temp, then rename) — no corrupted files on crash
- Project-scoped transforms (SCSS scan, tsconfig update) run once per project, not per file

## Available transforms

### `define-app-module` <sup>alpha.5</sup>

Rewrites module entry points from positional arguments to named config object.

```ts
// Before
export default createAppModule(pages, locales);

// After
export default defineAppModule({ pages, locales });

// 3-arg variant (with notifications)
// Before
export default createAppModule(pages, locales, notificationTemplates);

// After
export default defineAppModule({
  blades: pages,
  locales: locales,
  notificationTemplates: notificationTemplates,
});
```

### `use-blade-migration` <sup>alpha.8</sup>

Renames `useBladeNavigation()` → `useBlade()` and inverts `onBeforeClose` return values (old: `return false` = prevent close → new: `return true` = prevent close).

```ts
// Before
const { openBlade, onBeforeClose } = useBladeNavigation();
onBeforeClose(() => {
  return false; // prevent close
});

// After
const { openBlade, onBeforeClose } = useBlade();
onBeforeClose(() => {
  return !false; // prevent close (inverted)
});
```

### `notification-migration` <sup>alpha.10</sup>

Renames `useNotifications` → `useBladeNotifications` in imports and all usages.

### `blade-props-simplification` <sup>2.0.0</sup>

Removes blade boilerplate from Vue components: `expanded`/`closable` props, `close:blade`/`expand:blade`/`collapse:blade`/`parent:call` emits, and corresponding template attributes on `<VcBlade>`. Adds `useBlade()` destructuring for `param`, `options`, `callParent`, `closeSelf`.

```ts
// Before
interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  model?: string;
}
interface Emits {
  (e: "parent:call", args: IParentCallArgs): void;
  (e: "close:blade"): void;
}
const props = withDefaults(defineProps<Props>(), { expanded: true, closable: true });
const emit = defineEmits<Emits>();
emit("parent:call", { method: "refresh" });
const id = props.param;

// After
interface Props {
  model?: string;
}
const props = defineProps<Props>();
const { callParent, param } = useBlade();
callParent("refresh");
const id = param.value;
```

### `rewrite-imports` <sup>2.0.0</sup>

Moves symbols to sub-entry points: `aiAgentPlugin`, `useAiAgent`, etc. → `@vc-shell/framework/ai-agent`; `defineExtensionPoint`, `useExtensionPoint`, etc. → `@vc-shell/framework/extensions`.

### `remove-deprecated-aliases` <sup>2.0.0</sup>

Renames 6 deprecated injection key aliases:

| Old | New |
|-----|-----|
| `navigationViewLocation` | `NavigationViewLocationKey` |
| `BladeInstance` | `BladeInstanceKey` |
| `NotificationTemplatesSymbol` | `NotificationTemplatesKey` |
| `BLADE_BACK_BUTTON` | `BladeBackButtonKey` |
| `TOOLBAR_SERVICE` | `ToolbarServiceKey` |
| `EMBEDDED_MODE` | `EmbeddedModeKey` |

### `widgets-migration` <sup>2.0.0</sup>

Renames `useWidgets()` → `useBladeWidgets()`. Emits a warning if `registerWidget`/`unregisterWidget` calls are found — these need manual migration to the declarative `useBladeWidgets([...])` API.

### `composable-return-types` <sup>2.0.0</sup>

Renames 20 composable return type interfaces (e.g., `IUsePermissions` → `UsePermissionsReturn`, `IAppUserAPI` → `UseUserReturn`).

### `banner-variants` <sup>2.0.0</sup>

Updates VcBanner variant prop values: `"light-danger"` → `"danger"`, `"info-dark"` → `"info"`, `"primary"` → `"info"`.

### `switch-tooltip-prop` <sup>2.0.0</sup>

Renames `tooltip` → `hint` prop on `<VcSwitch>` (including `:tooltip` → `:hint`).

### `icon-container-prop` <sup>2.0.0</sup>

Removes the deprecated `useContainer` / `use-container` prop from `<VcIcon>`.

### `shims-to-globals` <sup>2.0.0</sup>

Replaces manual `shims-vue.d.ts` / `vue-i18n.d.ts` files with `@vc-shell/framework/globals` in `tsconfig.json` types. Standard boilerplate shim files are automatically deleted; customized ones trigger a warning.

### `icon-audit` <sup>2.0.0</sup> <kbd>diagnostic</kbd>

Scans for Font Awesome icon class names (`fas fa-check`, etc.) and reports them with suggested Material Symbols replacements. Does not modify files.

### `scss-safe-use` <sup>2.0.0</sup> <kbd>diagnostic</kbd>

Scans `.scss` files for `@import` statements and reports candidates for `@use`/`@forward` migration. Does not modify files.

### `menu-group-config` <sup>2.0.0</sup> <kbd>diagnostic</kbd>

Detects deprecated `group`, `groupIcon`, `inGroupPriority` menu properties and reports them for migration to `groupConfig: { id, title, icon, priority, permissions }`. Does not modify files.

## Troubleshooting

If something goes wrong after migration:

1. **Check the diff** — `git diff` shows exactly what changed. The tool preserves formatting, so real changes are easy to spot.

2. **Run TypeScript check** — `npx tsc --noEmit` catches type errors introduced by renames. Most should be caught by the transforms, but edge cases exist.

3. **Re-run a single transform** — if one specific transform caused issues:
   ```bash
   git checkout -- .  # revert all changes
   npx @vc-shell/migrate --transform define-app-module  # run just that one
   ```

4. **Check warnings** — the CLI prints `⚠` warnings for patterns that need manual review. Don't ignore these.

5. **Manual fixes for partial automation:**
   - `useWidgets` → `useBladeWidgets`: The rename is automatic, but converting `registerWidget`/`unregisterWidget` to declarative `useBladeWidgets([...])` config requires manual work. See MIGRATION_GUIDE.md section "Registering Widgets in Blades".
   - `onBeforeClose` with multiple returns or non-inline callbacks: Prints a warning. Review the logic and invert return values manually.
   - Custom `.d.ts` shims: If `shims-vue.d.ts` contains custom augmentations beyond the standard boilerplate, it won't be deleted — merge your custom types with the framework globals manually.

6. **File an issue** — if a transform produces incorrect output, [open an issue](https://github.com/AnyOrg/vc-shell/issues) with the before/after code.

## Architecture

```
@vc-shell/migrate
├── src/
│   ├── cli.ts                  # CLI entry point (commander)
│   ├── runner.ts               # Orchestrator: detect → select → execute → report
│   ├── version-detector.ts     # Reads framework version from package.json
│   ├── transforms/
│   │   ├── types.ts            # Transform/VersionedTransform interfaces
│   │   ├── registry.ts         # Version-based transform registry
│   │   ├── define-app-module.ts
│   │   ├── use-blade-migration.ts
│   │   ├── ... (15 transforms total)
│   │   └── shims-to-globals.ts
│   └── utils/
│       ├── vue-sfc-wrapper.ts  # SFC handling: wrapForSFC, wrapForSFCTemplate, wrapForSFCBoth
│       ├── template-transform.ts  # String-based template attribute manipulation
│       ├── import-rewriter.ts  # Symbol → sub-entry-point mapping
│       └── test-helpers.ts     # applyTransform, applyTransformWithReports, defineFixtureTest
└── tests/                      # 90 tests across 18 test files
```

### Adding a new transform

1. Create `src/transforms/my-transform.ts` following the jscodeshift signature:
   ```ts
   import type { API, FileInfo, Options } from "jscodeshift";
   import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
   import type { Transform } from "./types.js";

   function coreTransform(fileInfo: FileInfo, api: API, options: Options): string | null {
     const j = api.jscodeshift;
     const root = j(fileInfo.source);
     // ... find and replace patterns ...
     return root.toSource(); // or null if no changes
   }

   export default wrapForSFC(coreTransform) as Transform;
   export const parser = "tsx";
   ```

2. Register in `src/transforms/registry.ts`:
   ```ts
   {
     name: "my-transform",
     description: "What it does",
     introducedIn: "2.1.0",
     transformPath: t("my-transform"),
   },
   ```

3. Add tests in `tests/transforms/my-transform/transform.test.ts`

4. Run: `npx vitest run`

### Tech stack

- **[jscodeshift](https://github.com/facebook/jscodeshift)** — AST query/manipulation (jQuery-like API for JavaScript/TypeScript ASTs)
- **[recast](https://github.com/benjamn/recast)** — Format-preserving parser/printer (transitive via jscodeshift)
- **[@vue/compiler-sfc](https://github.com/vuejs/core)** — Vue Single File Component parser
- **[write-file-atomic](https://github.com/npm/write-file-atomic)** — Crash-safe file writes
- **[jsonc-parser](https://github.com/microsoft/node-jsonc-parser)** — JSON with comments parser (for tsconfig.json)
- **[semver](https://github.com/npm/node-semver)** — Version range comparison
- **[vitest](https://vitest.dev/)** — Test runner
