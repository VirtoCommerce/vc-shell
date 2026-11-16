import * as VcShellFramework from "@vc-shell/framework";

/**
 * Turns a story into a copy-pasteable SFC for the docs "Show code" panel.
 *
 * The Vue renderer only generates a snippet for args-only stories. A story with its own
 * `render` gets the raw CSF object (`{ render: () => ({ components, template }) }`), which
 * nobody can paste into an app. This transform calls the story's render function, takes the
 * component options it returns and prints them as `<script setup>` + `<template>`.
 *
 * Stories that set `parameters.docs.source.code` keep their hand-written snippet.
 */

const frameworkExports = new Set(Object.keys(VcShellFramework));

const VUE_APIS = [
  "ref",
  "reactive",
  "computed",
  "watch",
  "watchEffect",
  "shallowRef",
  "toRef",
  "toRefs",
  "nextTick",
  "onMounted",
  "onUnmounted",
  "onBeforeUnmount",
  "provide",
  "inject",
  "h",
  "markRaw",
];

interface RenderedOptions {
  template?: unknown;
  components?: Record<string, unknown>;
  setup?: unknown;
}

interface SnippetContext {
  args?: Record<string, unknown>;
  argTypes?: Record<string, { table?: { defaultValue?: { summary?: unknown } } } | undefined>;
  parameters?: { docs?: { source?: { code?: string } } };
  originalStoryFn?: (args: unknown, context: unknown) => unknown;
}

function dedent(text: string): string {
  const lines = text
    .replace(/^\s*\n/, "")
    .replace(/\s+$/, "")
    .split("\n");
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)![0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join("\n");
}

function indent(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((l) => (l.trim() ? pad + l : l))
    .join("\n");
}

function serializeAttr(name: string, value: unknown): string | null {
  if (value === undefined || value === null || typeof value === "function") return null;
  if (typeof value === "string") return `${name}="${value.replace(/"/g, "&quot;")}"`;
  if (typeof value === "boolean") return value ? name : `:${name}="false"`;
  if (typeof value === "number") return `:${name}="${value}"`;
  return null; // objects/arrays belong in the script block, not inline
}

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/**
 * Replaces `v-bind="args"` with the story's args, so the snippet shows real values.
 * Primitives go inline; arrays and plain objects become constants in the script block.
 */
function inlineArgs(
  template: string,
  args: Record<string, unknown> = {},
  argTypes: SnippetContext["argTypes"] = {},
): { template: string; constants: string[] } {
  const constants: string[] = [];

  // `{{ args.default }}` and `:label="args.label"` read a single arg: put the value in place.
  template = template.replace(/\{\{\s*args\.(\w+)\s*\}\}/g, (match, key: string) =>
    typeof args[key] === "string" || typeof args[key] === "number" ? String(args[key]) : match,
  );

  // Demo logging handlers (`@update:modelValue="(v) => console.log(v)"`) are not usage.
  template = template.replace(/\s+@[\w:.-]+="[^"]*console\.log[^"]*"/g, "");

  if (!/v-bind="args"/.test(template)) return { template, constants };
  const attrs: string[] = [];
  const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  for (const [key, value] of Object.entries(args)) {
    if (/^on[A-Z]/.test(key) || key === "default") continue;
    // The template binds it explicitly (v-model, :prop, prop=): the explicit binding wins.
    if (key === "modelValue" && /\sv-model=|:model-value=|:modelValue=/.test(template)) continue;
    if (new RegExp(`[\\s:](${key}|${kebab(key)})=`).test(template)) continue;
    // A value equal to the documented default only adds noise to the snippet.
    const documentedDefault = argTypes[key]?.table?.defaultValue?.summary;
    if (documentedDefault !== undefined && String(documentedDefault).replace(/^['"]|['"]$/g, "") === String(value))
      continue;
    if (value === false) continue;
    const inline = serializeAttr(key, value);
    if (inline) {
      attrs.push(inline);
    } else if (IDENTIFIER.test(key) && value && typeof value === "object") {
      try {
        constants.push(`const ${key} = ${JSON.stringify(value, null, 2)};`);
        attrs.push(`:${key}="${key}"`);
      } catch {
        // circular or exotic value: leave it out of the snippet
      }
    }
  }
  return { template: template.replace(/\s*v-bind="args"/g, attrs.length ? ` ${attrs.join(" ")}` : ""), constants };
}

/** Body of the story's setup() without the trailing `return { ... }`. Skipped for minified builds. */
function setupBody(setup: unknown, args: Record<string, unknown> = {}): string {
  if (typeof setup !== "function") return "";
  const source = setup.toString();
  // `setup: () => ({ ... })` only returns bindings; there are no statements to show.
  if (/^\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>\s*\(/.test(source)) return "";
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  if (start < 0 || end <= start) return "";
  // Tree-shaking hints the dev bundler adds (`ref(/* @__PURE__ */ new Date())`).
  let body = source.slice(start + 1, end).replace(/\/\*\s*[#@]__PURE__\s*\*\/\s*/g, "");
  if (!body.includes("\n")) return ""; // minified production bundle: names are mangled, not worth showing
  body = body.replace(/\n\s*return\s*\{[\s\S]*\}\s*;?\s*$/, "");
  body = body.replace(/\n\s*return\s+\w+\s*;?\s*$/, "");
  // `ref(args.modelValue)` -> `ref("value")`
  body = body.replace(/\bargs\.(\w+)\b/g, (match, key: string) => {
    try {
      if (!(key in args) || typeof args[key] === "function") return match;
      return JSON.stringify(args[key]) ?? "undefined";
    } catch {
      return match;
    }
  });
  body = body.replace(/^[ \t]*console\.log\([^;\n]*\);?[ \t]*\n?/gm, "");
  if (/\bargs\b/.test(body)) return ""; // still depends on Storybook args, would not compile in an app
  // Story scaffolding (mock providers, patched services) is not part of the usage example.
  body = body.replace(/^[ \t]*(?:provideMock|mock|patch|setupMock)\w*\([^;\n]*\);?[ \t]*\n?/gm, "");
  return dedent(body);
}

function buildSnippet(options: RenderedOptions, context: SnippetContext): string | null {
  if (typeof options.template !== "string" || !options.template.trim()) return null;

  const inlined = inlineArgs(options.template, context.args, context.argTypes);
  const template = dedent(inlined.template);
  const names = Object.keys(options.components ?? {});
  const local = names.filter((n) => !frameworkExports.has(n));
  const body = setupBody(options.setup, context.args);
  const used = new Set(body.match(/\b[A-Za-z_$][\w$]*\b/g) ?? []);
  const fromFramework = [
    ...names.filter((n) => frameworkExports.has(n)),
    ...[...used].filter((n) => /^use[A-Z]/.test(n) && frameworkExports.has(n)),
  ];
  const fromVue = VUE_APIS.filter((n) => used.has(n));

  const script: string[] = [];
  if (fromVue.length) script.push(`import { ${fromVue.join(", ")} } from "vue";`);
  if (fromFramework.length)
    script.push(`import { ${[...new Set(fromFramework)].join(", ")} } from "@vc-shell/framework";`);
  if (local.length) script.push(`// Demo-only components defined in the story file: ${local.join(", ")}`);
  if (inlined.constants.length) script.push("", ...inlined.constants);
  if (body) script.push("", body);

  const parts: string[] = [];
  if (script.length) parts.push(`<script setup lang="ts">\n${script.join("\n")}\n</script>`);
  parts.push(`<template>\n${indent(template, 2)}\n</template>`);
  return parts.join("\n\n");
}

export function transformSource(code: string, context: SnippetContext): string {
  const explicit = context?.parameters?.docs?.source?.code;
  if (explicit && code === explicit) return code;
  if (typeof context?.originalStoryFn !== "function") return code;

  try {
    // Storybook's default Vue render returns a render function, not a template. A template
    // string means the story wrote its own markup, which is what a developer wants to copy.
    const rendered = context.originalStoryFn(context.args, context) as RenderedOptions | null;
    if (!rendered || typeof rendered !== "object" || typeof rendered.template !== "string") return code;
    // `<Comp v-bind="args" />` alone: the renderer's own args snippet is just as good.
    if (/^\s*<[\w-]+\s+v-bind="args"\s*\/>\s*$/.test(rendered.template)) return code;
    return buildSnippet(rendered, context) ?? code;
  } catch {
    return code;
  }
}
