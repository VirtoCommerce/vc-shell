---
name: type-checker
description: Runs vue-tsc on generated files, filters errors to the generated set, fixes them, and re-runs up to 3 iterations.
---

## Input Contract

```json
{
  "required": {
    "projectRoot": "string — absolute path to the project root (where tsconfig.json lives)",
    "generatedFiles": ["string — absolute paths to all generated files to check"]
  }
}
```

## Knowledge Loading

No pattern files needed. This agent works with TypeScript diagnostics directly.

## Generation Rules

### Step 1: Run vue-tsc

From `projectRoot`, run:

```bash
cd {projectRoot} && npx vue-tsc --noEmit 2>&1
```

Capture all output. If `vue-tsc` is not available, fall back to:

```bash
cd {projectRoot} && npx tsc --noEmit 2>&1
```

### Step 2: Filter errors to generated files only

Parse the output for TypeScript error lines. Each error line has format:

```
{filepath}({line},{col}): error TS{code}: {message}
```

Keep only errors where `{filepath}` matches one of the absolute paths in `generatedFiles` (normalize separators before comparing).

If no errors match the generated files, report **PASS** and stop.

### Step 3: Categorize and fix errors

For each error in the generated files, attempt to fix using these patterns:

**TS2339 — Property does not exist on type:**

- If `entity.{field}` and `{field}` is not on the entity type, add `?` optional chaining: `entity.value?.{field}`
- If it's a missing property on an imported type, add a type assertion: `(entity.value as any).{field}` as a last resort

**TS2345 — Argument type mismatch:**

- If passing `string | undefined` where `string` is expected, add non-null assertion: `value!`
- If command class is missing a required field, add it from the entity with a comment

**TS2304 — Cannot find name:**

- If a composable function name is wrong, check the composable file and correct the import/destructure
- If an imported type is missing, check the api client file for the correct class name

**TS7006 — Parameter implicitly has 'any' type:**

- Add explicit type annotation from context (e.g., `(query: ISearch{Entity}Query)`)

**TS2554 — Expected N arguments but got M:**

- Check the method signature in the api client file and adjust the call

**TS1005 — Expected token:**

- Syntax error — re-read the generated file and fix malformed syntax

For each fix:

1. Read the affected generated file
2. Apply the minimal fix (Edit tool, targeted replacement)
3. Note the fix applied

### Step 4: Re-run and iterate

After applying fixes, re-run `vue-tsc --noEmit` and filter again.

Repeat up to **3 iterations total** (including the initial run).

### Step 5: Report results

After all iterations, report:

```
TYPE CHECK RESULT: PASS | FAIL

Iterations: {N}

Fixes applied:
- {file}: TS{code} at line {L} — {description of fix}
- ...

Remaining errors (if FAIL):
- {filepath}:{line}: TS{code}: {message}
- ...
```

If `FAIL` after 3 iterations, list all remaining errors so the caller can decide whether to proceed or escalate.

## Output Contract

Files modified on disk: only the generated files listed in `generatedFiles` (type fixes applied in-place).

Returns a text report with PASS/FAIL status, fixes applied, and any remaining errors.

## Self-Check

Before completing, verify:

- [ ] `vue-tsc` (or `tsc`) was run from `projectRoot`, not from a subdirectory
- [ ] Only errors in `generatedFiles` were addressed — no fixes to unrelated files
- [ ] Fixes were minimal (targeted Edit calls, not full file rewrites)
- [ ] Maximum 3 run iterations were respected
- [ ] Final report clearly states PASS or FAIL
- [ ] If FAIL, remaining errors are listed with file path, line, and message
- [ ] No framework source files or api client files were modified
