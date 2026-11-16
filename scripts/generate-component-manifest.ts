/**
 * Writes a machine-readable map of every component that has stories: how to import it, its
 * props, events and slots (from vue-component-meta, so it cannot drift from the source), the
 * usage guide and the Storybook stories that show it.
 *
 * Consumers are AI coding tools (the vc-app skill ships it next to the `*.docs.md` mirror) and
 * anything else that needs the component API without parsing SFCs.
 *
 *   yarn generate:component-manifest [out-file]
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { storyNameFromExport, toId } from "storybook/internal/csf";
import {
  FRAMEWORK_DIR,
  ROOT,
  createComponentChecker,
  exportsName,
  findStoryFiles,
  readStoryFile,
  type StoryFileMeta,
} from "./story-meta";

const STORYBOOK_URL = "https://vc-shell-storybook.govirto.com";
const DEFAULT_OUT = path.join(ROOT, "cli/vc-app-skill/runtime/knowledge/components.json");

interface ManifestComponent {
  name: string;
  import: string | null;
  source: string;
  docs: string | null;
  description: string;
  storybook: { title: string; docs: string; stories: string[] } | null;
  props: {
    name: string;
    type: string;
    required: boolean;
    default?: string;
    description?: string;
    deprecated?: boolean;
  }[];
  events: { name: string; signature: string; description?: string }[];
  slots: { name: string; type: string; description?: string }[];
}

const relative = (file: string) => path.relative(FRAMEWORK_DIR, file).split(path.sep).join("/");

/** Same rule as the Storybook docs page (.storybook/guide-links.ts): base name, only guide, up to two parents. */
function findGuide(storiesFile: string): string | null {
  let dir = path.dirname(storiesFile);
  const base = path.basename(storiesFile).split(".")[0];
  const exact = path.join(dir, `${base}.docs.md`);
  if (fs.existsSync(exact)) return relative(exact);
  for (let level = 0; level < 3; level++) {
    const inDir = fs.readdirSync(dir).filter((f) => f.endsWith(".docs.md"));
    if (inDir.length === 1) return relative(path.join(dir, inDir[0]));
    if (inDir.length > 1) return null;
    dir = path.dirname(dir);
  }
  return null;
}

function isPublicExport(name: string): boolean {
  return exportsName(path.join(FRAMEWORK_DIR, "index.ts"), name);
}

function guideSummary(docsPath: string | null): string {
  if (!docsPath) return "";
  const text = fs.readFileSync(path.join(FRAMEWORK_DIR, docsPath), "utf8").replace(/^---\n[\s\S]*?\n---\n/, "");
  // First paragraph after the H1.
  const paragraph = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith("#") && !p.startsWith("::") && !p.startsWith("|") && !p.startsWith("```"));
  return paragraph?.replace(/\s+/g, " ") ?? "";
}

export function generateComponentManifest(outFile: string = DEFAULT_OUT): number {
  const checker = createComponentChecker();

  // Several story files can document one component (VcDataTable is split by feature).
  const byComponent = new Map<string, StoryFileMeta[]>();
  for (const file of findStoryFiles()) {
    const meta = readStoryFile(file);
    if (!meta.component || !meta.title) continue;
    const list = byComponent.get(meta.component.file) ?? [];
    list.push(meta);
    byComponent.set(meta.component.file, list);
  }

  const components: ManifestComponent[] = [];
  for (const [componentFile, metas] of byComponent) {
    const primary = metas.find((m) => !m.tags.includes("!autodocs")) ?? metas[0];
    const name = primary.component!.localName;
    const api = checker.getComponentMeta(componentFile, "default");
    const docs = findGuide(primary.file);
    const title = primary.title!;
    const stories = metas.flatMap((m) =>
      m.stories
        .filter((s) => !s.tags.includes("deprecated"))
        .map((s) => toId(m.title!, storyNameFromExport(s.exportName))),
    );

    components.push({
      name,
      import: isPublicExport(name) ? `import { ${name} } from "@vc-shell/framework";` : null,
      source: relative(componentFile),
      docs,
      description: guideSummary(docs),
      storybook: {
        title,
        docs: `${STORYBOOK_URL}/?path=/docs/${toId(title, "docs")}`,
        stories,
      },
      props: api.props
        .filter((p) => !p.global)
        .map((p) => ({
          name: p.name,
          type: p.type,
          required: p.required,
          ...(p.default !== undefined ? { default: p.default } : {}),
          ...(p.description ? { description: p.description } : {}),
          ...(p.tags.some((t) => t.name === "deprecated") ? { deprecated: true } : {}),
        })),
      events: api.events.map((e) => ({
        name: e.name,
        signature: e.signature,
        ...(e.description ? { description: e.description } : {}),
      })),
      slots: api.slots.map((s) => ({
        name: s.name,
        type: s.type,
        ...(s.description ? { description: s.description } : {}),
      })),
    });
  }

  components.sort((a, b) => a.name.localeCompare(b.name));
  const version = JSON.parse(fs.readFileSync(path.join(FRAMEWORK_DIR, "package.json"), "utf8")).version as string;
  const manifest = {
    $comment: "Generated by scripts/generate-component-manifest.ts. Do not edit by hand.",
    framework: `@vc-shell/framework@${version}`,
    docsRoot: "Paths in `source` and `docs` are relative to the @vc-shell/framework package root.",
    components,
  };
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(manifest, null, 2)}\n`);
  // Same formatting as every other committed JSON, so `yarn format:check` stays green.
  spawnSync("yarn", ["prettier", "--write", outFile], { cwd: ROOT, stdio: "ignore" });
  return components.length;
}

if (require.main === module) {
  const out = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_OUT;
  const count = generateComponentManifest(out);
  console.log(`Wrote ${count} components to ${path.relative(ROOT, out)}`);
}
