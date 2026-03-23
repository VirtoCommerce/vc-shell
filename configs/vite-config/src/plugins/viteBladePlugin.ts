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

  const nameProp = argNode.properties.find(
    (p: any) => p.type === "ObjectProperty" && p.key.type === "Identifier" && p.key.name === "name",
  );
  if (!nameProp) return null;

  const nameValue = nameProp.value.type === "StringLiteral" ? nameProp.value.value : null;
  if (!nameValue) return null;

  // Build config object from all properties except 'name'

  const configProperties = argNode.properties.filter((p: any) => p !== nameProp);

  const configParts = configProperties.map((p: any) => scriptContent.slice(p.start!, p.end!));
  const configObjectText = `{ ${configParts.join(", ")} }`;

  // Build replacement: only defineOptions stays in <script setup>
  const defineOptionsLine = `defineOptions({ name: "${nameValue}" });\n`;

  // Replace defineBlade() call with just defineOptions() in <script setup>
  const newScriptContent =
    scriptContent.slice(0, defineBladeNode.start!) + defineOptionsLine + scriptContent.slice(defineBladeNode.end!);

  // Reconstruct SFC by replacing the script setup content
  const scriptSetupStart = scriptSetup.loc.start.offset;
  const scriptSetupEnd = scriptSetup.loc.end.offset;

  let newCode = code.slice(0, scriptSetupStart) + newScriptContent + code.slice(scriptSetupEnd);

  // Inject a separate <script> block for __registerBladeConfig so it runs at module evaluation time,
  // not inside the setup() function. This ensures config is available when registerBlade() is called
  // during module installation (before any component is mounted).
  const scriptBlock = `<script lang="ts">
import { __registerBladeConfig } from "@vc-shell/framework";
__registerBladeConfig("${nameValue}", ${configObjectText});
</script>
`;

  // Insert the <script> block before the <script setup> tag
  // Match both `<script setup lang="ts">` and `<script lang="ts" setup>`
  const scriptSetupTagMatch = newCode.match(/<script\s+[^>]*?\bsetup\b[^>]*>/);
  if (scriptSetupTagMatch && scriptSetupTagMatch.index != null) {
    newCode = newCode.slice(0, scriptSetupTagMatch.index) + scriptBlock + newCode.slice(scriptSetupTagMatch.index);
  }

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
