import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFC } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

/**
 * Diagnostic-only: detect useWidgets() usage and report manual migration needed.
 *
 * The old useWidgets() API (registerWidget, clearBladeWidgets, updateActiveWidget)
 * is completely replaced by the new declarative useBladeWidgets(widgets[]) API.
 * This cannot be mechanically migrated — it requires manual rewrite.
 */

function coreTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const frameworkImports = root.find(j.ImportDeclaration, {
    source: { value: "@vc-shell/framework" },
  });
  if (frameworkImports.size() === 0) return null;

  const hasUseWidgets =
    frameworkImports
      .find(j.ImportSpecifier)
      .filter((path) => {
        const name = path.node.imported.type === "Identifier" ? path.node.imported.name : "";
        return name === "useWidgets";
      })
      .size() > 0;

  if (!hasUseWidgets) return null;

  api.report(`${fileInfo.path}: useWidgets() → useBladeWidgets() — API completely changed. Manual rewrite required.`);
  api.report(
    `  Old: const { registerWidget, clearBladeWidgets, updateActiveWidget } = useWidgets(); registerWidget({...}, bladeId);`,
  );
  api.report(`  New: const { refreshAll } = useXxxWidgets(...); // UseXxxWidgetsReturn extends UseBladeWidgetsReturn`);
  api.report(`  Mapping: updateActiveWidget() → refreshAll() from your module widgets composable return.`);
  api.report(`  Auto-lifecycle: no onUnmounted/clearBladeWidgets needed. See migration guide #13.`);

  return null; // diagnostic-only
}

export default wrapForSFC(coreTransform) as Transform;
export const parser = "tsx";
