import type { API, FileInfo, Options } from "jscodeshift";
import { parse as parseSFC } from "@vue/compiler-sfc";
import type { Transform } from "./types.js";

/**
 * All Vc* component names exported from @vc-shell/framework/ui.
 * Used to detect usage in templates and add explicit imports.
 */
const UI_COMPONENTS = new Set([
  // Atoms
  "VcBadge",
  "VcBanner",
  "VcButton",
  "VcButtonGroup",
  "VcCard",
  "VcCol",
  "VcContainer",
  "VcHint",
  "VcIcon",
  "VcImage",
  "VcLabel",
  "VcLink",
  "VcLoading",
  "VcProgress",
  "VcRow",
  "VcScrollableContainer",
  "VcSkeleton",
  "VcStatus",
  "VcStatusIcon",
  "VcTooltip",
  "VcVideo",
  "VcWidget",
  // Molecules
  "VcLanguageSelector",
  "VcAccordion",
  "VcAccordionItem",
  "VcBreadcrumbs",
  "VcCheckbox",
  "VcCheckboxGroup",
  "VcColorInput",
  "VcDatePicker",
  "VcDropdown",
  "VcDropdownItem",
  "VcDropdownPanel",
  "VcEditor",
  "VcField",
  "VcFileUpload",
  "VcForm",
  "VcImageTile",
  "VcInput",
  "VcInputCurrency",
  "VcInputGroup",
  "VcMenu",
  "VcMenuItem",
  "VcMenuGroup",
  "VcMultivalue",
  "VcPagination",
  "VcRadioButton",
  "VcRadioGroup",
  "VcRating",
  "VcSelect",
  "VcSlider",
  "VcSwitch",
  "VcTextarea",
  "VcToast",
  // Organisms
  "VcApp",
  "VcAuthLayout",
  "VcBlade",
  "VcTable",
  "VcDataTable",
  "VcColumn",
  "VcDynamicProperty",
  "VcGallery",
  "VcImageUpload",
  "VcPopup",
  "VcSidebar",
]);

/**
 * Directives exported from @vc-shell/framework/ui.
 * Template directive name (without v-) -> script variable name.
 */
const DIRECTIVES: Record<string, string> = {
  loading: "vLoading",
  autofocus: "vAutofocus",
};

const FRAMEWORK_UI_SOURCE = "@vc-shell/framework/ui";
const FRAMEWORK_MAIN_SOURCE = "@vc-shell/framework";

/** Convert kebab-case to PascalCase: "vc-button" -> "VcButton" */
function kebabToPascal(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Scan template string for Vc* component tags and framework directives.
 */
function scanTemplate(templateContent: string): {
  components: Set<string>;
  directives: Set<string>;
} {
  const components = new Set<string>();
  const directives = new Set<string>();

  // Match <VcFoo or <vc-foo (self-closing and open tags)
  const tagRegex = /<(Vc[A-Z]\w+|vc-[\w-]+)[\s/>]/g;
  let match;
  while ((match = tagRegex.exec(templateContent)) !== null) {
    let name = match[1];
    if (name.includes("-")) {
      name = kebabToPascal(name);
    }
    if (UI_COMPONENTS.has(name)) {
      components.add(name);
    }
  }

  // Match v-loading, v-autofocus
  for (const [directiveName, varName] of Object.entries(DIRECTIVES)) {
    const re = new RegExp(`v-${directiveName}(?=[\\s=>/"'])`, "g");
    if (re.test(templateContent)) {
      directives.add(varName);
    }
  }

  return { components, directives };
}

/** Set of all names that belong in @vc-shell/framework/ui */
const UI_NAMES = new Set([...UI_COMPONENTS, ...Object.values(DIRECTIVES)]);

/**
 * Codemod: add explicit imports for globally registered Vc* components and directives.
 * Also moves component/directive imports from @vc-shell/framework to @vc-shell/framework/ui.
 */
const transform: Transform = (fileInfo: FileInfo, api: API, _options: Options): string | null => {
  if (!fileInfo.path.endsWith(".vue")) return null;

  const { descriptor } = parseSFC(fileInfo.source, { filename: fileInfo.path });
  const scriptBlock = descriptor.scriptSetup ?? descriptor.script;
  if (!scriptBlock) return null;

  const templateContent = descriptor.template?.content;
  if (!templateContent) return null;

  const { components: usedComponents, directives: usedDirectives } = scanTemplate(templateContent);
  if (usedComponents.size === 0 && usedDirectives.size === 0) return null;

  const j = api.jscodeshift;
  const root = j(scriptBlock.content);
  let changed = false;

  // Track what is already imported (from any source)
  const alreadyImported = new Set<string>();
  root.find(j.ImportDeclaration).forEach((path) => {
    for (const spec of path.node.specifiers || []) {
      if (spec.type === "ImportSpecifier" && spec.imported.type === "Identifier") {
        alreadyImported.add(spec.imported.name);
      }
    }
  });

  // Track UI names that need to be moved from @vc-shell/framework to /ui
  const movedToUi = new Set<string>();

  // Move component/directive imports from @vc-shell/framework -> /ui
  root.find(j.ImportDeclaration).forEach((path) => {
    if (path.node.source.value !== FRAMEWORK_MAIN_SOURCE) return;

    const specifiers = path.node.specifiers || [];
    const uiSpecs = specifiers.filter(
      (s) => s.type === "ImportSpecifier" && s.imported.type === "Identifier" && UI_NAMES.has(s.imported.name),
    );

    if (uiSpecs.length === 0) return;

    // Track moved specifiers — they need to go into /ui import
    for (const s of uiSpecs) {
      if (s.type === "ImportSpecifier" && s.imported.type === "Identifier") {
        movedToUi.add(s.imported.name);
      }
    }

    const nonUiSpecs = specifiers.filter(
      (s) => !(s.type === "ImportSpecifier" && s.imported.type === "Identifier" && UI_NAMES.has(s.imported.name)),
    );

    if (nonUiSpecs.length === 0) {
      // All specifiers are UI -> rewrite source
      path.node.source = j.literal(FRAMEWORK_UI_SOURCE);
    } else {
      // Split: keep non-UI in original, UI will be added to /ui import below
      path.node.specifiers = nonUiSpecs;
    }
    changed = true;
  });

  // Determine what still needs to be added to /ui
  const missingComponents = [...usedComponents].filter((c) => !alreadyImported.has(c));
  const missingDirectives = [...usedDirectives].filter((d) => !alreadyImported.has(d));
  // Include moved specifiers (split from main entry) that weren't rewritten in-place
  const splitNames = [...movedToUi].filter((name) => {
    // Only add if not already in a /ui import (rewrite-all case rewrites in-place)
    const uiImportExists = root
      .find(j.ImportDeclaration)
      .filter((p) => p.node.source.value === FRAMEWORK_UI_SOURCE)
      .some((p) =>
        (p.node.specifiers || []).some(
          (s) => s.type === "ImportSpecifier" && s.imported.type === "Identifier" && s.imported.name === name,
        ),
      );
    return !uiImportExists;
  });
  const toAdd = [...new Set([...missingComponents, ...missingDirectives, ...splitNames])].sort();

  if (toAdd.length > 0 || changed) {
    // Find or create @vc-shell/framework/ui import
    const uiImports = root
      .find(j.ImportDeclaration)
      .filter((path) => path.node.source.value === FRAMEWORK_UI_SOURCE);

    if (uiImports.length > 0) {
      // Merge into existing
      const existingSpecs = uiImports.get().node.specifiers || [];
      const existingNames = new Set(
        existingSpecs.filter((s: any) => s.type === "ImportSpecifier").map((s: any) => s.imported.name),
      );
      for (const name of toAdd) {
        if (!existingNames.has(name)) {
          existingSpecs.push(j.importSpecifier(j.identifier(name)));
        }
      }
      // Sort specifiers alphabetically
      existingSpecs.sort((a: any, b: any) => {
        const aName = a.imported?.name || "";
        const bName = b.imported?.name || "";
        return aName.localeCompare(bName);
      });
      changed = true;
    } else if (toAdd.length > 0) {
      // Create new import
      const importDecl = j.importDeclaration(
        toAdd.map((name) => j.importSpecifier(j.identifier(name))),
        j.literal(FRAMEWORK_UI_SOURCE),
      );
      const imports = root.find(j.ImportDeclaration);
      if (imports.length > 0) {
        j(imports.at(-1).get()).insertAfter(importDecl);
      } else {
        root.find(j.Program).get("body").unshift(importDecl);
      }
      changed = true;
    }
  }

  if (!changed) return null;

  // Splice script back into SFC
  const newScriptContent = root.toSource();
  if (newScriptContent === scriptBlock.content) return null;

  const scriptStart = scriptBlock.loc.start.offset;
  const scriptEnd = scriptBlock.loc.end.offset;

  return fileInfo.source.substring(0, scriptStart) + newScriptContent + fileInfo.source.substring(scriptEnd);
};

export default transform;
export const parser = "tsx";
