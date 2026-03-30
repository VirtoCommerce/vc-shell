import type { API, FileInfo, Options } from "jscodeshift";
import { parse as parseSFC } from "@vue/compiler-sfc";
import type { Transform } from "./types.js";

/**
 * Map of global template properties → local composable names.
 * e.g. "$isMobile" → "isMobile"
 */
const BREAKPOINT_GLOBAL_PROPS: Record<string, string> = {
  $isMobile: "isMobile",
  $isDesktop: "isDesktop",
  $isPhone: "isPhone",
  $isTablet: "isTablet",
  $isTouch: "isTouch",
};

/**
 * Map of injection key symbol names → local composable names.
 * e.g. "IsMobileKey" → "isMobile"
 */
const INJECTION_KEY_MAP: Record<string, string> = {
  IsMobileKey: "isMobile",
  IsDesktopKey: "isDesktop",
  IsPhoneKey: "isPhone",
  IsTabletKey: "isTablet",
  IsTouchKey: "isTouch",
};

/**
 * Map of string injection keys → local composable names.
 * e.g. "isMobile" → "isMobile"
 */
const STRING_KEY_MAP: Record<string, string> = {
  isMobile: "isMobile",
  isDesktop: "isDesktop",
  isPhone: "isPhone",
  isTablet: "isTablet",
  isTouch: "isTouch",
};

/**
 * Codemod: migrate $isMobile/$isDesktop globals and inject(IsMobileKey) patterns
 * to `const { ... } = useResponsive()` from @vc-shell/framework.
 */
const transform: Transform = (fileInfo: FileInfo, api: API, _options: Options): string | null => {
  if (!fileInfo.path.endsWith(".vue")) return null;

  const { descriptor } = parseSFC(fileInfo.source, { filename: fileInfo.path });
  const scriptBlock = descriptor.scriptSetup ?? descriptor.script;

  // 1. Scan template for $isMobile.value patterns
  const templateNeeds = new Set<string>();
  let newTemplateContent: string | undefined;

  if (descriptor.template) {
    let content = descriptor.template.content;
    for (const [globalProp, localName] of Object.entries(BREAKPOINT_GLOBAL_PROPS)) {
      const escaped = globalProp.replace("$", "\\$");
      const re = new RegExp(`${escaped}\\.value`, "g");
      if (re.test(content)) {
        templateNeeds.add(localName);
        content = content.replace(new RegExp(`${escaped}\\.value`, "g"), localName);
      }
    }
    if (content !== descriptor.template.content) {
      newTemplateContent = content;
    }
  }

  // 2. Transform script: find inject() calls for responsive keys
  const scriptNeeds = new Set<string>();
  let newScriptContent: string | undefined;
  const removedKeyImports = new Set<string>(); // injection key names to remove from imports

  if (scriptBlock) {
    const j = api.jscodeshift;
    const root = j(scriptBlock.content);
    let scriptChanged = false;

    // Find inject() calls that match our patterns
    // Pattern 1: inject(IsMobileKey, ref(false))  — symbol key
    // Pattern 2: inject("isMobile", ref(false))   — string key
    root.find(j.VariableDeclarator).forEach((path) => {
      const init = path.node.init;
      if (
        !init ||
        init.type !== "CallExpression" ||
        init.callee.type !== "Identifier" ||
        init.callee.name !== "inject"
      ) {
        return;
      }

      const firstArg = init.arguments[0];
      if (!firstArg) return;

      let localName: string | undefined;

      // Symbol key: inject(IsMobileKey, ...)
      if (firstArg.type === "Identifier" && firstArg.name in INJECTION_KEY_MAP) {
        localName = INJECTION_KEY_MAP[firstArg.name];
        removedKeyImports.add(firstArg.name);
      }
      // String key: inject("isMobile", ...)
      else if (firstArg.type === "StringLiteral" && firstArg.value in STRING_KEY_MAP) {
        localName = STRING_KEY_MAP[firstArg.value];
      }

      if (localName) {
        scriptNeeds.add(localName);
        // Remove the entire variable declaration statement
        const parent = path.parent;
        if (parent.node.type === "VariableDeclaration" && parent.node.declarations.length === 1) {
          j(parent).remove();
        } else {
          j(path).remove();
        }
        scriptChanged = true;
      }
    });

    // Combine all needs
    const allNeeds = new Set([...templateNeeds, ...scriptNeeds]);

    if (allNeeds.size > 0) {
      // Add useResponsive destructure statement
      const destructureNames = Array.from(allNeeds).sort();
      const destructureStr = `const { ${destructureNames.join(", ")} } = useResponsive();`;

      // Add useResponsive to @vc-shell/framework import
      let hasFrameworkImport = false;
      let hasUseResponsiveImport = false;

      root.find(j.ImportDeclaration).forEach((path) => {
        const source = path.node.source.value;
        if (source === "@vc-shell/framework") {
          hasFrameworkImport = true;
          const specifiers = path.node.specifiers || [];
          // Check if useResponsive already imported
          for (const spec of specifiers) {
            if (
              spec.type === "ImportSpecifier" &&
              spec.imported.type === "Identifier" &&
              spec.imported.name === "useResponsive"
            ) {
              hasUseResponsiveImport = true;
            }
          }
          if (!hasUseResponsiveImport) {
            specifiers.push(j.importSpecifier(j.identifier("useResponsive")));
            scriptChanged = true;
          }

          // Remove injection key imports that are no longer used
          if (removedKeyImports.size > 0) {
            path.node.specifiers = specifiers.filter((spec) => {
              if (spec.type === "ImportSpecifier" && spec.imported.type === "Identifier") {
                return !removedKeyImports.has(spec.imported.name);
              }
              return true;
            });
          }
        }
      });

      if (!hasFrameworkImport) {
        // Add new import for useResponsive
        const importDecl = j.importDeclaration(
          [j.importSpecifier(j.identifier("useResponsive"))],
          j.literal("@vc-shell/framework"),
        );
        const body = root.find(j.Program).get("body");
        const imports = root.find(j.ImportDeclaration);
        if (imports.length > 0) {
          // Insert after last import
          j(imports.at(-1).get()).insertAfter(importDecl);
        } else {
          body.unshift(importDecl);
        }
        scriptChanged = true;
      }

      // Remove unused `inject` import from "vue" if no other inject() calls remain
      const remainingInjectCalls = root.find(j.CallExpression, {
        callee: { type: "Identifier", name: "inject" },
      });

      if (remainingInjectCalls.length === 0) {
        root.find(j.ImportDeclaration).forEach((path) => {
          if (path.node.source.value === "vue") {
            path.node.specifiers = (path.node.specifiers || []).filter((spec) => {
              if (spec.type === "ImportSpecifier" && spec.imported.type === "Identifier") {
                return spec.imported.name !== "inject";
              }
              return true;
            });
            // Also remove `ref` if it was only used as default value in inject()
            // Check if ref is still used elsewhere
            const refUsages = root.find(j.Identifier, { name: "ref" }).filter((refPath) => {
              // Skip the import specifier itself
              return refPath.parent.node.type !== "ImportSpecifier";
            });
            if (refUsages.length === 0) {
              path.node.specifiers = (path.node.specifiers || []).filter((spec) => {
                if (spec.type === "ImportSpecifier" && spec.imported.type === "Identifier") {
                  return spec.imported.name !== "ref";
                }
                return true;
              });
            }
            // Remove the entire import if no specifiers remain
            if ((path.node.specifiers || []).length === 0) {
              j(path).remove();
            }
            scriptChanged = true;
          }
        });
      }

      // Remove unused `ref` from "vue" import when ref is no longer used in remaining code
      // (already handled above when inject is removed)

      // Insert the destructure statement after imports
      const sourceCode = root.toSource();
      // Find position after last import to insert destructure
      const lines = sourceCode.split("\n");
      let lastImportLine = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trimStart().startsWith("import ")) {
          lastImportLine = i;
        }
      }
      if (lastImportLine >= 0) {
        lines.splice(lastImportLine + 1, 0, "", destructureStr);
      } else {
        lines.unshift(destructureStr);
      }
      newScriptContent = lines.join("\n");
      scriptChanged = true;
    }

    if (scriptChanged && !newScriptContent) {
      newScriptContent = root.toSource();
    }
  } else if (templateNeeds.size > 0) {
    // No script block but template needs useResponsive — edge case, skip
    return null;
  }

  // 3. Nothing changed
  if (!newTemplateContent && !newScriptContent) return null;

  // 4. Splice back into SFC — splice from end of file backward to preserve offsets
  let result = fileInfo.source;

  // Determine order: which block comes later in the file
  const templateStart = descriptor.template?.loc.start.offset;
  const templateEnd = descriptor.template?.loc.end.offset;
  const scriptStart = scriptBlock?.loc.start.offset;
  const scriptEnd = scriptBlock?.loc.end.offset;

  interface Splice {
    start: number;
    end: number;
    content: string;
  }

  const splices: Splice[] = [];
  if (newTemplateContent && templateStart != null && templateEnd != null) {
    splices.push({ start: templateStart, end: templateEnd, content: newTemplateContent });
  }
  if (newScriptContent && scriptStart != null && scriptEnd != null) {
    splices.push({ start: scriptStart, end: scriptEnd, content: newScriptContent });
  }

  // Sort descending by start offset so we splice from end first
  splices.sort((a, b) => b.start - a.start);

  for (const splice of splices) {
    result = result.substring(0, splice.start) + splice.content + result.substring(splice.end);
  }

  return result;
};

export default transform;
export const parser = "tsx";
