import type { FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

/**
 * Diagnostic-only transform: detect useForm (vee-validate) + useBeforeUnload/useModificationTracker
 * patterns and report them for manual migration to useBladeForm().
 *
 * Does NOT modify any code — all changes require manual review.
 */

function coreTransform(fileInfo: FileInfo, _api: unknown, _options: Options): string | null {
  const source = fileInfo.source;

  // --- Detect patterns via simple text matching (diagnostic-only, no AST modification) ---
  const hasUseForm = /\bimport\s[^;]*\buseForm\b[^;]*from\s+['"]vee-validate['"]/.test(source);
  const hasBeforeUnload = /\bimport\s[^;]*\buseBeforeUnload\b[^;]*from\s+['"]@vc-shell\/framework['"]/.test(source);
  const hasModificationTracker =
    /\bimport\s[^;]*\buseModificationTracker\b[^;]*from\s+['"]@vc-shell\/framework['"]/.test(source);

  // Only process files that have the target pattern
  if (!hasUseForm && !hasBeforeUnload && !hasModificationTracker) return null;

  // --- Diagnostics only — no code modifications ---
  const diagnostics: string[] = [];

  // Detect useForm destructure patterns
  if (/useForm\s*[<(]/.test(source)) {
    diagnostics.push(
      `    → useForm() call found — replace with useBladeForm(). Destructure { form, validate, resetForm, setBaseline, modified, isValid } from useBladeForm().`,
    );
  }

  // Detect handleSubmit usage
  if (/handleSubmit/.test(source)) {
    diagnostics.push(
      `    → handleSubmit() detected — replace with validate() from useBladeForm(). validate() returns { valid, errors }.`,
    );
  }

  // Detect toolbar disabled formula referencing modified/valid
  if (/disabled\s*:\s*.*(?:modified|isValid|valid)/.test(source) || /!modified/.test(source)) {
    diagnostics.push(
      `    → Toolbar disabled formula references modified/isValid — review and update to use useBladeForm() return values.`,
    );
  }

  // Detect onBeforeClose with modified check
  if (/onBeforeClose/.test(source) && /modified/.test(source)) {
    diagnostics.push(
      `    → onBeforeClose uses modified state — useBladeForm() handles this automatically via built-in beforeUnload. Remove manual onBeforeClose guard.`,
    );
  }

  // Detect useBeforeUnload call
  if (/useBeforeUnload\s*\(/.test(source)) {
    diagnostics.push(
      `    → useBeforeUnload() call found — remove it. useBladeForm() handles before-unload automatically.`,
    );
  }

  // Detect useModificationTracker call
  if (/useModificationTracker\s*\(/.test(source)) {
    diagnostics.push(
      `    → useModificationTracker() call found — remove it. useBladeForm() tracks modification internally.`,
    );
  }

  // Detect setBaseline
  if (/setBaseline\s*\(/.test(source)) {
    diagnostics.push(
      `    → setBaseline() call found — useBladeForm() exposes setBaseline(). Verify placement after data load.`,
    );
  }

  // Detect resetForm
  if (/resetForm\s*\(/.test(source)) {
    diagnostics.push(
      `    → resetForm() call found — available from useBladeForm() return. Verify usage is compatible.`,
    );
  }

  if (diagnostics.length > 0) {
    console.log(`  ⚠️  ${fileInfo.path}: Manual migration needed for useBladeForm():`);
    for (const d of diagnostics) {
      console.log(d);
    }
    console.log(`    → See migration guide #37 for full examples.`);
  }

  // Diagnostic-only: never modify the file
  return null;
}

const transform: Transform = coreTransform as Transform;
export default transform;
export const parser = "tsx";
