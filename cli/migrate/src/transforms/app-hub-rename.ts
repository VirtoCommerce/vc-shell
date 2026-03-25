import type { API, FileInfo, Options } from "jscodeshift";
import { wrapForSFCBoth } from "../utils/vue-sfc-wrapper.js";
import type { Transform } from "./types.js";

/**
 * Script transform: rename useAppSwitcher → useAppHub, IUseAppSwitcher → IUseAppHub
 */
function scriptTransform(fileInfo: FileInfo, api: API, _options: Options): string | null {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let changed = false;

  // Rename import source: @shell/components/app-switcher/... → @shell/components/app-hub/...
  // Also handles @vc-shell/framework re-exports
  root.find(j.ImportDeclaration).forEach((path) => {
    const source = path.node.source.value;
    if (typeof source === "string" && source.includes("app-switcher")) {
      path.node.source.value = source.replace(/app-switcher/g, "app-hub");
      changed = true;
    }
  });

  // Rename identifiers: useAppSwitcher → useAppHub, IUseAppSwitcher → IUseAppHub
  const RENAMES: Record<string, string> = {
    useAppSwitcher: "useAppHub",
    IUseAppSwitcher: "IUseAppHub",
  };

  for (const [oldName, newName] of Object.entries(RENAMES)) {
    root.find(j.Identifier, { name: oldName }).forEach((path) => {
      path.node.name = newName;
      changed = true;
    });
  }

  return changed ? root.toSource() : null;
}

/**
 * Template transform: rename prop and slot
 */
function templateTransform(template: string, _filePath: string): { content: string; changed: boolean } {
  let modified = template;

  // Rename prop: disable-app-switcher → disable-app-hub (kebab-case in templates)
  modified = modified.replace(
    /(<(?:VcApp|vc-app|VcAppDesktopLayout|VcAppMobileLayout)\b[^>]*?)(\s:?disable-app-switcher)/gs,
    (_match, before, attr) => before + attr.replace("disable-app-switcher", "disable-app-hub"),
  );

  // Rename slot: #app-switcher → #app-hub, name="app-switcher" → name="app-hub"
  modified = modified.replace(/#app-switcher/g, "#app-hub");
  modified = modified.replace(/name="app-switcher"/g, 'name="app-hub"');

  return { content: modified, changed: modified !== template };
}

export default wrapForSFCBoth(scriptTransform as Transform, templateTransform) as Transform;
export const parser = "tsx";
