/**
 * Fails when a story documents an argType the component does not have.
 *
 * Hand-written argTypes outlive the props they describe: a removed prop keeps its row in the
 * docs table, its control in the panel and its attribute in the "Show code" snippet. This check
 * reads each story's `meta.argTypes` and compares the keys with the component's real props,
 * events and slots, as vue-component-meta extracts them from the source.
 *
 * Story-only controls that are not part of the component API opt out with
 * `table: { category: "Story" }`.
 */
import path from "node:path";
import {
  ROOT,
  STORY_ONLY_CATEGORY,
  camelize,
  createComponentChecker,
  eventHandlerName,
  findStoryFiles,
  readStoryFile,
} from "./story-meta";

const checker = createComponentChecker();
const problems: string[] = [];
let checked = 0;

for (const file of findStoryFiles()) {
  const meta = readStoryFile(file);
  if (!meta.component || !meta.argTypes.length) continue;
  const componentMeta = checker.getComponentMeta(meta.component.file, meta.component.exportName);
  // vue-component-meta found nothing: the export is not a typed component, nothing to compare.
  if (componentMeta.props.length + componentMeta.events.length + componentMeta.slots.length === 0) continue;

  const known = new Set<string>();
  for (const p of componentMeta.props) known.add(p.name).add(camelize(p.name));
  for (const e of componentMeta.events) known.add(e.name).add(eventHandlerName(e.name)).add(camelize(e.name));
  for (const s of componentMeta.slots) known.add(s.name);
  for (const x of componentMeta.exposed) known.add(x.name);

  checked++;
  const componentName = path.basename(meta.component.file);
  for (const a of meta.argTypes) {
    if (a.storyOnly || known.has(a.key) || known.has(camelize(a.key))) continue;
    problems.push(`${path.relative(ROOT, file)}: argTypes.${a.key} is not a prop, event or slot of ${componentName}`);
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(
    `\n${problems.length} stale argType(s). Remove them, or mark story-only controls with table: { category: "${STORY_ONLY_CATEGORY}" }.`,
  );
  process.exit(1);
}
console.log(`Story argTypes match component APIs (${checked} story files checked).`);
