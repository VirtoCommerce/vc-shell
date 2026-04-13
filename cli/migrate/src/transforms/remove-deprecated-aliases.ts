import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

const RENAME_MAP: Record<string, string> = {
  navigationViewLocation: "NavigationViewLocationKey",
  BLADE_BACK_BUTTON: "BladeBackButtonKey",
  TOOLBAR_SERVICE: "ToolbarServiceKey",
  EMBEDDED_MODE: "EmbeddedModeKey",
};

// Symbols that require manual migration (API changed, not just renamed)
const MANUAL_MIGRATION: Record<string, string> = {
  BladeInstance:
    "inject(BladeInstance) removed. Use `useBlade()` composable instead — blade context is now provided by useBlade(). See migration guide.",
};

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const frameworkImports = root.find(j.ImportDeclaration, {
    source: { value: "@vc-shell/framework" },
  });
  if (frameworkImports.size() === 0) return null;

  const renames: Array<{ old: string; new: string }> = [];
  frameworkImports.find(j.ImportSpecifier).forEach((path) => {
    const name = path.node.imported.type === "Identifier" ? path.node.imported.name : "";
    if (RENAME_MAP[name]) {
      renames.push({ old: name, new: RENAME_MAP[name] });
    }
  });
  // Check for symbols requiring manual migration
  frameworkImports.find(j.ImportSpecifier).forEach((path) => {
    const name = path.node.imported.type === "Identifier" ? path.node.imported.name : "";
    if (MANUAL_MIGRATION[name]) {
      api.report(`${fileInfo.path}: ${MANUAL_MIGRATION[name]}`);
    }
  });

  if (renames.length === 0) return null;

  for (const r of renames) {
    root.find(j.Identifier, { name: r.old }).forEach((path) => {
      path.node.name = r.new;
    });
  }

  return root.toSource();
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
