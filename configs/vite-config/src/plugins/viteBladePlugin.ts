import { parse as parseSFC } from "@vue/compiler-sfc";
import * as babelParser from "@babel/parser";
import type { Plugin } from "vite";

const DEFINE_BLADE_RE = /\bdefineBlade\s*\(/;
const LEGACY_BLADE_FIELDS_RE = /\b(url|isWorkspace|permissions|menuItem)\s*:/;

interface TransformResult {
  code: string;
  map: null;
}

export function transformDefineBlade(
  code: string,
  id: string,
  onLegacyWarning?: (message: string) => void,
): TransformResult | null {
  if (!id.endsWith(".vue")) return null;

  const hasDefineBlade = DEFINE_BLADE_RE.test(code);

  // Legacy detection: defineOptions() with blade-specific fields
  if (!hasDefineBlade) {
    if (onLegacyWarning && /\bdefineOptions\s*\(/.test(code)) {
      const { descriptor } = parseSFC(code, { pad: false });
      const scriptContent = descriptor.scriptSetup?.content;
      if (scriptContent && LEGACY_BLADE_FIELDS_RE.test(scriptContent)) {
        onLegacyWarning(
          `[vc-shell:define-blade] ${id} uses defineOptions() with blade fields. Migrate to defineBlade().`,
        );
      }
    }
    return null;
  }

  // Parse SFC
  const { descriptor } = parseSFC(code, { pad: false });
  if (!descriptor.scriptSetup) return null;

  const scriptSetup = descriptor.scriptSetup;
  const scriptContent = scriptSetup.content;

  // Parse script as TS
  const ast = babelParser.parse(scriptContent, {
    sourceType: "module",
    plugins: ["typescript"],
  });

  // Find defineBlade(...) call expression statement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let defineBladeNode: any = null;
  for (const node of ast.program.body) {
    if (
      node.type === "ExpressionStatement" &&
      node.expression.type === "CallExpression" &&
      node.expression.callee.type === "Identifier" &&
      node.expression.callee.name === "defineBlade"
    ) {
      defineBladeNode = node;
      break;
    }
  }

  if (!defineBladeNode) return null;

  const callExpr = defineBladeNode.expression;
  const argNode = callExpr.arguments[0];
  if (!argNode || argNode.type !== "ObjectExpression") return null;

  // Find 'name' property
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nameProp = argNode.properties.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => p.type === "ObjectProperty" && p.key.type === "Identifier" && p.key.name === "name",
  );
  if (!nameProp) return null;

  const nameValue = nameProp.value.type === "StringLiteral" ? nameProp.value.value : null;
  if (!nameValue) return null;

  // Build config object from all properties except 'name'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const configProperties = argNode.properties.filter((p: any) => p !== nameProp);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const configParts = configProperties.map((p: any) => scriptContent.slice(p.start!, p.end!));
  const configObjectText = `{ ${configParts.join(", ")} }`;

  // Build replacement
  const importLine = `import { __registerBladeConfig } from "@vc-shell/framework";\n`;
  const defineOptionsLine = `defineOptions({ name: "${nameValue}" });\n`;
  const registerLine = `__registerBladeConfig("${nameValue}", ${configObjectText});\n`;
  const replacement = defineOptionsLine + registerLine;

  // Replace in script content
  const newScriptContent =
    scriptContent.slice(0, defineBladeNode.start!) + replacement + scriptContent.slice(defineBladeNode.end!);

  // Prepend import if not already present
  const finalScriptContent = newScriptContent.includes("import { __registerBladeConfig }")
    ? newScriptContent
    : importLine + newScriptContent;

  // Reconstruct SFC by replacing the script setup content
  const scriptSetupStart = scriptSetup.loc.start.offset;
  const scriptSetupEnd = scriptSetup.loc.end.offset;

  const newCode = code.slice(0, scriptSetupStart) + finalScriptContent + code.slice(scriptSetupEnd);

  return { code: newCode, map: null };
}

export function viteBladePlugin(): Plugin {
  return {
    name: "vc-shell:define-blade",
    enforce: "pre",

    transform(code, id) {
      return transformDefineBlade(code, id, (msg) => {
        this.warn(msg);
      });
    },
  };
}
