import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

/**
 * Detect useForm (vee-validate) + useBeforeUnload/useModificationTracker patterns
 * and migrate imports toward useBladeForm().
 *
 * Safe mechanical transforms:
 * 1. Remove `useForm` import from `vee-validate` (keep `Field` etc.)
 * 2. Remove `useBeforeUnload` and `useModificationTracker` from `@vc-shell/framework`
 * 3. Add `useBladeForm` to `@vc-shell/framework` import
 *
 * Diagnostic-only (reported for manual migration):
 * - toolbar disabled formula referencing modified/valid/isValid
 * - onBeforeClose logic using modified/isValid
 * - setBaseline() call placement
 * - handleSubmit / validate / resetForm usage
 */

const REMOVE_FROM_FRAMEWORK = new Set(["useBeforeUnload", "useModificationTracker"]);
const ADD_TO_FRAMEWORK = "useBladeForm";

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // --- Detect vee-validate useForm import ---
  const veeValidateImports = root.find(j.ImportDeclaration, {
    source: { value: "vee-validate" },
  });

  const hasUseForm =
    veeValidateImports
      .find(j.ImportSpecifier)
      .filter((path) => {
        const name = path.node.imported.type === "Identifier" ? path.node.imported.name : "";
        return name === "useForm";
      })
      .size() > 0;

  // --- Detect framework imports ---
  const frameworkImports = root.find(j.ImportDeclaration, {
    source: { value: "@vc-shell/framework" },
  });

  const hasBeforeUnload =
    frameworkImports
      .find(j.ImportSpecifier)
      .filter((path) => {
        const name = path.node.imported.type === "Identifier" ? path.node.imported.name : "";
        return name === "useBeforeUnload";
      })
      .size() > 0;

  const hasModificationTracker =
    frameworkImports
      .find(j.ImportSpecifier)
      .filter((path) => {
        const name = path.node.imported.type === "Identifier" ? path.node.imported.name : "";
        return name === "useModificationTracker";
      })
      .size() > 0;

  // Only process files that have the target pattern
  if (!hasUseForm && !hasBeforeUnload && !hasModificationTracker) return null;

  let modified = false;
  const diagnostics: string[] = [];

  // --- Step 1: Remove useForm from vee-validate ---
  if (hasUseForm) {
    veeValidateImports.forEach((importPath) => {
      const specifiers = importPath.node.specifiers ?? [];
      const remaining = specifiers.filter((spec) => {
        if (spec.type !== "ImportSpecifier") return true;
        const name = spec.imported.type === "Identifier" ? spec.imported.name : "";
        return name !== "useForm";
      });

      if (remaining.length === 0) {
        // Remove entire import
        j(importPath).remove();
      } else {
        importPath.node.specifiers = remaining;
      }
    });
    modified = true;
  }

  // --- Step 2: Remove useBeforeUnload/useModificationTracker from framework ---
  if (hasBeforeUnload || hasModificationTracker) {
    frameworkImports.forEach((importPath) => {
      const specifiers = importPath.node.specifiers ?? [];
      const remaining = specifiers.filter((spec) => {
        if (spec.type !== "ImportSpecifier") return true;
        const name = spec.imported.type === "Identifier" ? spec.imported.name : "";
        return !REMOVE_FROM_FRAMEWORK.has(name);
      });

      if (remaining.length === 0) {
        // Should not happen — framework import usually has more symbols
        j(importPath).remove();
      } else {
        importPath.node.specifiers = remaining;
      }
    });
    modified = true;
  }

  // --- Step 3: Add useBladeForm to framework import ---
  const hasBladeFormAlready =
    root
      .find(j.ImportDeclaration, { source: { value: "@vc-shell/framework" } })
      .find(j.ImportSpecifier)
      .filter((path) => {
        const name = path.node.imported.type === "Identifier" ? path.node.imported.name : "";
        return name === ADD_TO_FRAMEWORK;
      })
      .size() > 0;

  if (!hasBladeFormAlready) {
    const fwImports = root.find(j.ImportDeclaration, {
      source: { value: "@vc-shell/framework" },
    });

    if (fwImports.size() > 0) {
      const firstImport = fwImports.at(0);
      const specifiers = firstImport.get().node.specifiers ?? [];
      specifiers.push(j.importSpecifier(j.identifier(ADD_TO_FRAMEWORK)));
      modified = true;
    } else {
      // No framework import exists — create one
      const newImport = j.importDeclaration(
        [j.importSpecifier(j.identifier(ADD_TO_FRAMEWORK))],
        j.literal("@vc-shell/framework"),
      );
      const body = root.find(j.Program).get("body");
      body.value.unshift(newImport);
      modified = true;
    }
  }

  // --- Step 4: Diagnostics for manual migration ---
  const source = fileInfo.source;

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

  if (!modified) return null;
  return root.toSource();
}

const transform: Transform = wrapForSFC(coreTransform) as Transform;
export default transform;
export const parser = "tsx";
