---
name: storybook-check
description: Verify changed components render correctly in Storybook by running a targeted build check
disable-model-invocation: true
---

# Storybook Check

Verify that component changes don't break Storybook rendering.

## Steps

### 1. Identify changed component stories

Check which story files relate to recent changes:

```bash
git diff --name-only HEAD | grep -E '\.(vue|ts)$' | head -20
```

Look for corresponding `.stories.ts` files in the same directories.

### 2. Run Storybook build check

Run a production Storybook build to catch compilation errors:

```bash
yarn storybook-build 2>&1 | tail -30
```

This catches:
- TypeScript errors in story files
- Missing imports or broken component references
- Template compilation errors
- CSS/SCSS issues

### 3. If build succeeds

Report success. Optionally launch Storybook dev server for visual verification:

```bash
yarn storybook-serve
```

Then use Playwright MCP to take screenshots of the affected stories for visual confirmation.

### 4. If build fails

Analyze the error output:
- Parse the Vite/Rollup error messages
- Identify which component or story is failing
- Check for common issues:
  - Barrel file re-export docgen errors (known issue — see `.storybook/main.ts` stripInvalidDocgen plugin)
  - Missing component registrations
  - TypeScript type mismatches between story args and component props

### Known Gotchas

- **HMR loop**: vc-table stories have a known infinite HMR reload (~1s remount). This doesn't affect production builds but makes dev server screenshots unreliable for table stories.
- **Docgen errors**: The `stripInvalidDocgen` plugin in `.storybook/main.ts` handles `__docgenInfo` assignment errors from barrel re-exports. If you see `ReferenceError` about `__docgenInfo`, the plugin may need updating.
- **Framework CSS**: Storybook resolves `@vc-shell/framework/dist/index.css` to SCSS sources if no built dist exists. Run `yarn build-framework` first if you see styling issues.
