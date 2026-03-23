---
name: module-assembler
description: Creates the module index.ts barrel, pages/index.ts, composables/index.ts (if missing), and registers the module in the app's module registry.
---

## Input Contract

```json
{
  "required": {
    "moduleName": "string — kebab-case module name (e.g., 'team', 'catalog-items')",
    "generatedFiles": ["string — absolute paths to all generated files in this module"],
    "appModulesRegistryPath": "string — absolute path to app's src/modules/index.ts",
    "mode": "string — 'create' (default) or 'append'"
  }
}
```

## Knowledge Loading

Before generating, Read:

1. `{knowledgeBase}/patterns/module-structure.md` — `defineAppModule`, barrel file format, and module registry rules

(Use `knowledgeBase` from the parent skill context, or infer from the `targetDir` if not provided: look for `skill/knowledge/patterns/module-structure.md` relative to the worktree root.)

## Generation Rules

### Append Mode

When `mode: "append"`:

1. Read the existing `{targetDir}/index.ts` — do NOT overwrite it from scratch
2. Add new blade import statements after existing imports in `pages/index.ts`
3. Add new blade to the `blades` object in `defineAppModule` — since `blades: pages` uses namespace import, the new page export in `pages/index.ts` is automatically included
4. Do NOT overwrite any existing content — only append new exports and imports
5. Use the Edit tool (not Write tool) for all file modifications in append mode

Specifically in append mode:
- `pages/index.ts` — append new `export { default as NewBlade } from "./new-blade.vue"` lines
- `composables/index.ts` — append new composable export lines
- `{targetDir}/index.ts` — no changes needed (namespace import `* as pages` picks up new pages automatically)
- `appModulesRegistryPath` — no changes needed (module is already registered)

### Step 1: Derive naming variables

From `moduleName` compute:
- `moduleClassName` = PascalCase of `moduleName` (e.g., `Team`, `CatalogItems`)
- `targetDir` = directory containing the generated files (parent of `pages/`, `composables/`, `locales/`)

To find `targetDir`: take the directory of the first file in `generatedFiles` that lives under `pages/` or `composables/` and navigate up one level.

### Step 2: Identify generated pages and composables

From `generatedFiles`, classify each file:
- Files under `*/pages/*.vue` → page components
- Files under `*/composables/**/*.ts` but NOT `*/composables/index.ts` → composable implementations

For each page file, derive its export name:
- `team-list.vue` → `TeamList`
- `team-details.vue` → `TeamDetails`
- `{moduleName}-list.vue` → PascalCase(`moduleName`) + `List`
- `{moduleName}-details.vue` → PascalCase(`moduleName`) + `Details`

For each composable directory (e.g., `useTeamMembers/`), derive its export name from the directory name.

### Step 3: Write or update pages/index.ts

Write to: `{targetDir}/pages/index.ts`

Export each page component as a named export:
```ts
export { default as TeamList } from "./team-list.vue";
export { default as TeamDetails } from "./team-details.vue";
```

If the file already exists, read it first and only add exports for pages not already present.

### Step 4: Write or update composables/index.ts

Write to: `{targetDir}/composables/index.ts`

If the file was already created by a generator agent (list-blade-generator or details-blade-generator), read it and ensure all composables have an export. Otherwise create it with all discovered composables.

Format:
```ts
export { default as useTeamMembers } from "./useTeamMembers";
export { default as useTeamMember } from "./useTeamMember";
```

### Step 5: Write module index.ts

Write to: `{targetDir}/index.ts`

Follow `module-structure.md` exactly:
```ts
import * as pages from "./pages";
import * as locales from "./locales";
import { defineAppModule } from "@vc-shell/framework";

export default defineAppModule({ blades: pages, locales });

export * from "./pages";
export * from "./composables";
```

Do NOT re-export locales. Do NOT use a default export for locales.

### Step 6: Register module in app's module registry

Read `appModulesRegistryPath` (e.g., `src/modules/index.ts`).

Parse existing exports to detect if the module is already registered:
- Check for `export { default as {moduleClassName} }` or `export * from "./{moduleName}"`

If NOT already registered, append:
```ts
export { default as {moduleClassName} } from "./{moduleName}";
```

**Critical rules for registry update:**
- Read the existing file first — NEVER overwrite it from scratch
- Append the new export at the end of the file
- Preserve all existing export lines exactly
- If the module name is already exported (any form), skip — do not add duplicate
- Add a blank line before the new export only if the file does not end with a blank line

### Step 7: Register module in main.ts (app.use)

Find the app entry point: look for `src/main.ts` relative to the project root (the parent of `src/modules/`).

Read `main.ts` and check if `{moduleClassName}` is already imported and used:
- Check for `import { ... {moduleClassName} ... } from "./modules"` (or `from "@/modules"`)
- Check for `app.use({moduleClassName})`

If NOT already registered:

1. **Update the modules import.** Find the existing `import { ... } from "./modules"` line. Add `{moduleClassName}` to its named imports. If no such import exists, add:
   ```ts
   import { {moduleClassName} } from "./modules";
   ```

2. **Add `app.use({moduleClassName})`.** Insert `app.use({moduleClassName});` in the correct position:
   - AFTER `app.use(VirtoShellFramework, ...)` (framework must be first)
   - AFTER any existing `app.use(ModuleName)` calls (group modules together)
   - BEFORE `app.use(router)` (router must come after all modules)

**Critical rules:**
- Read the file first — NEVER overwrite from scratch
- Use Edit tool for surgical changes
- Preserve all existing imports and app.use() calls
- If module is already imported AND used, skip entirely
- Module registration order: VirtoShellFramework → all modules → router → bootstrap

## Output Contract

Files written to disk:
1. `{targetDir}/pages/index.ts` (created or updated)
2. `{targetDir}/composables/index.ts` (created or updated)
3. `{targetDir}/index.ts` (created)
4. `{appModulesRegistryPath}` (appended — module export added)
5. `src/main.ts` (updated — import + app.use added)

Returns a summary of all files created/modified and confirmation of registry registration.

## Self-Check

Before completing, verify:
- [ ] `defineAppModule({ blades: pages, locales })` — both `pages` and `locales` are passed
- [ ] `export * from "./pages"` and `export * from "./composables"` are in module `index.ts`
- [ ] `locales` is NOT re-exported (no `export * from "./locales"`)
- [ ] `pages/index.ts` uses named exports with `{ default as ComponentName }` pattern
- [ ] App registry was READ before modifying — existing exports preserved
- [ ] No duplicate export for `{moduleClassName}` in registry
- [ ] Module `index.ts` uses `import * as pages` (namespace import), not named imports
- [ ] `main.ts` has `import { {moduleClassName} }` from modules
- [ ] `main.ts` has `app.use({moduleClassName})` with other module registrations
