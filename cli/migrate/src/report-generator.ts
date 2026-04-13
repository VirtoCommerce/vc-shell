import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import writeFileAtomic from "write-file-atomic";
import type { TransformReport } from "./transforms/types.js";

/** Migration guides without automated transforms — for "Not Covered" section */
const UNCOVERED_GUIDES = [
  { guide: "03-moment-to-datefns", grep: "moment", description: "moment.js → date-fns migration" },
  {
    guide: "08-dynamic-views-removal",
    grep: "DynamicBladeList|DynamicBladeForm",
    description: "Remove DynamicBladeList/DynamicBladeForm",
  },
  { guide: "16-login-form", grep: "useLogin", description: "useLogin composable API changes" },
  { guide: "29-vc-table-to-data-table", grep: "VcTable\\b", description: "Old VcTable → VcDataTable migration" },
];

/**
 * Manual migration topics with structured instructions.
 * Keyed by transform name — each has a title, description, and before/after example.
 */
interface ManualTopic {
  title: string;
  description: string;
  example: string;
  guide?: string;
}

const MANUAL_TOPICS: Record<string, ManualTopic> = {
  "widgets-migration": {
    title: "Widget System Rewrite",
    description:
      "The old imperative `registerWidget()`/`unregisterWidget()` API is replaced by a declarative `useBladeWidgets()` composable. " +
      "Widget `.vue` files for standard sidebar items are no longer needed — use headless config objects instead. " +
      "Create a `useXxxWidgets.ts` composable in your module's `widgets/` directory.",
    example: `\`\`\`ts
// OLD: imperative registration in blade page
const { registerWidget, clearBladeWidgets } = useWidgets();
const blade = inject(BladeInstance);
registerWidget({ id: "MyWidget", component: MyWidgetVue, props: { item } }, blade.id);
onUnmounted(() => clearBladeWidgets(blade.id));

// NEW: declarative composable (create widgets/useMyWidgets.ts)
import { useBladeWidgets, useBlade } from "@vc-shell/framework";

export function useMyWidgets(options: { item: Ref<MyItem>; isVisible: ComputedRef<boolean> }) {
  const { openBlade } = useBlade();
  return useBladeWidgets([
    {
      id: "MyWidget",
      icon: "lucide-tag",
      title: "MY_MODULE.WIDGETS.MY_WIDGET.TITLE",
      badge: computed(() => options.item.value?.count ?? 0),
      isVisible: options.isVisible,
      onClick: () => openBlade({ name: "MyWidgetBlade" }),
      onRefresh: () => loadData(),
    },
  ]);
}

// In blade page: const { refreshAll } = useMyWidgets({ item, isVisible: computed(() => !!param.value) });
\`\`\``,
    guide: "migration/13-widgets.md",
  },

  "use-blade-form": {
    title: "Form Management with useBladeForm()",
    description:
      "`useForm()` (vee-validate) + manual `onBeforeClose()` + `modified` tracking are replaced by a single `useBladeForm()` composable. " +
      "Remove all three and replace with one call. `useBladeForm` handles close confirmation, modification tracking, and form validation automatically.",
    example: `\`\`\`ts
// OLD:
import { useForm } from "vee-validate";
const { meta } = useForm({ validateOnMount: false });
const isModified = computed(() => meta.value.dirty);
onBeforeClose(async () => {
  if (isModified.value) {
    return !(await showConfirmation(t("CLOSE_CONFIRMATION")));
  }
});

// NEW:
import { useBladeForm } from "@vc-shell/framework";
const form = useBladeForm({
  data: item,  // your reactive data ref
  closeConfirmMessage: computed(() => t("CLOSE_CONFIRMATION")),
});
// form.modified, form.isValid, form.validate(), form.resetForm(), form.setBaseline()
// onBeforeClose is handled automatically — DELETE it
\`\`\``,
    guide: "migration/37-use-blade-form.md",
  },

  "remove-deprecated-aliases": {
    title: "Injection Key Migration",
    description:
      "`inject(BladeInstance)` is removed. Blade context is now provided by `useBlade()` composable — it gives you `param`, `options`, `callParent`, `closeSelf`, etc.",
    example: `\`\`\`ts
// OLD:
const blade = inject(BladeInstance);

// NEW:
const { param, options, callParent, closeSelf } = useBlade();
\`\`\``,
    guide: "migration/21-injection-keys.md",
  },

  "nswag-class-to-interface": {
    title: "NSwag DTO Class → Interface Migration",
    description:
      "API client DTOs changed from classes (with `new DtoClass()`) to interfaces (with `{} as DtoClass`). " +
      "The migrator handles simple cases automatically. Clone-then-mutate patterns (`new X(); x.field = value;`) require manual rewrite.",
    example: `\`\`\`ts
// Clone-then-mutate (manual migration):
// OLD:
const criteria = new SearchCriteria();
criteria.take = 20;
criteria.sort = "name:ASC";

// NEW:
const criteria = { take: 20, sort: "name:ASC" } as SearchCriteria;
\`\`\``,
    guide: "migration/nswag-class-to-interface.md",
  },

  "blade-props-simplification": {
    title: "Reusable Blade Components",
    description:
      "Components with blade props (expanded/closable) but no `defineBlade()` were skipped — they are reusable components, not blade pages. " +
      "If these components pass blade props to child blades, remove the forwarding — child blades should call `useBlade()` directly.",
    example: `\`\`\`vue
<!-- OLD: wrapper forwarding blade props -->
<MyBlade :expanded="expanded" :closable="closable" :param="param"
  @close:blade="$emit('close:blade')" />

<!-- NEW: wrapper passes only domain props, child calls useBlade() -->
<MyBlade :config="config" />
\`\`\``,
    guide: "migration/11-blade-props.md",
  },

  "replace-cover-method": {
    title: "replaceWith() Semantics Change",
    description:
      "`replaceWith()` now truly destroys the old blade. If you relied on the old blade staying alive underneath, use `coverWith()` instead.",
    example: `\`\`\`ts
// If old blade should stay alive (e.g. preview):
const { coverWith } = useBlade();
await coverWith({ name: "Preview", param: id });

// If old blade should be destroyed (e.g. create → edit):
const { replaceWith } = useBlade();
await replaceWith({ name: "EditOrder", param: order.id });
\`\`\``,
    guide: "migration/12-replace-cover.md",
  },
};

/**
 * Classify api.report() messages as informational vs actionable.
 * Informational messages (stats, "modified", "Found N files") go to a separate section.
 */
function isInformational(msg: string): boolean {
  return (
    /^Registry: \d+/.test(msg) ||
    /^Found \d+ consumer files/.test(msg) ||
    /: modified$/.test(msg) ||
    /^Done\. \d+ file/.test(msg) ||
    /added .* to compilerOptions/.test(msg) ||
    /standard boilerplate — deleted/.test(msg)
  );
}

/** Extract file path from a report message if it starts with one */
function extractFilePath(msg: string, cwd: string): string | null {
  // Matches absolute paths or src/-relative paths at the start
  const absMatch = msg.match(/^(\/[^\s:]+)/);
  if (absMatch) return relative(cwd, absMatch[1]);
  const relMatch = msg.match(/^(src\/[^\s:]+)/);
  if (relMatch) return relMatch[1];
  return null;
}

export function generateMigrationReport(
  cwd: string,
  currentVersion: string,
  targetVersion: string,
  allReports: TransformReport[],
  depChanges: string[],
  sourceFiles: string[],
): void {
  const lines: string[] = [];
  const date = new Date().toISOString().split("T")[0];
  lines.push(`# Migration Report: ${currentVersion} → ${targetVersion}`);
  lines.push(`Generated: ${date}\n`);

  // --- Automated changes ---
  const modified = allReports.filter((r) => r.filesModified.length > 0);
  const totalModified = allReports.reduce((sum, r) => sum + r.filesModified.length, 0);
  lines.push(`## Automated Changes (${totalModified} files)\n`);
  if (modified.length > 0) {
    for (const r of modified) {
      lines.push(`- ✅ **${r.name}** — ${r.filesModified.length} file(s)`);
    }
  } else {
    lines.push("_No automated changes applied._");
  }

  // --- Manual migration required (structured by topic) ---
  // Group actionable messages by transform name
  const actionableByTransform = new Map<string, string[]>();
  const informational: string[] = [];

  for (const r of allReports) {
    for (const msg of r.reports) {
      if (isInformational(msg)) {
        informational.push(msg);
        continue;
      }
      if (!actionableByTransform.has(r.name)) actionableByTransform.set(r.name, []);
      actionableByTransform.get(r.name)!.push(msg);
    }
  }

  if (actionableByTransform.size > 0) {
    lines.push(`\n## Manual Migration Required\n`);

    for (const [transformName, messages] of actionableByTransform) {
      const topic = MANUAL_TOPICS[transformName];

      if (topic) {
        // Structured topic with description and example
        lines.push(`### ${topic.title}\n`);
        lines.push(topic.description + "\n");

        // List affected files
        const files = new Set<string>();
        for (const msg of messages) {
          const fp = extractFilePath(msg, cwd);
          if (fp) files.add(fp);
        }
        if (files.size > 0) {
          lines.push("**Affected files:**");
          for (const f of files) {
            lines.push(`- \`${f}\``);
          }
          lines.push("");
        }

        // Before/after example
        lines.push(topic.example + "\n");

        if (topic.guide) {
          lines.push(`> See: [${topic.guide}](${topic.guide})\n`);
        }
      } else {
        // Unknown topic — fallback to raw messages
        lines.push(`### ${transformName}\n`);
        for (const msg of messages) {
          lines.push(`- ${msg}`);
        }
        lines.push("");
      }
    }
  }

  // --- Rolled back ---
  const rolledBack = allReports.flatMap((r) => r.filesRolledBack.map((f) => ({ transform: r.name, ...f })));
  if (rolledBack.length > 0) {
    lines.push(`\n## Rolled Back (parse errors)\n`);
    for (const item of rolledBack) {
      lines.push(`- ⟲ **${item.transform}** — \`${item.path}\`: ${item.error}`);
    }
  }

  // --- Dependencies updated ---
  if (depChanges.length > 0) {
    lines.push(`## Dependencies Updated\n`);
    for (const c of depChanges) {
      lines.push(`- ${c}`);
    }
  }

  // --- Not covered by migrator ---
  const allSource = sourceFiles
    .map((f) => {
      try {
        return readFileSync(f, "utf-8");
      } catch {
        return "";
      }
    })
    .join("\n");
  const relevant = UNCOVERED_GUIDES.filter((g) => new RegExp(g.grep).test(allSource));
  if (relevant.length > 0) {
    lines.push(`\n## Not Covered by Migrator\n`);
    lines.push("_These migration guides may be relevant — check manually:_\n");
    for (const g of relevant) {
      lines.push(`- **${g.guide}** — ${g.description}`);
      lines.push(`  Check: \`grep -rn "${g.grep}" src/\``);
    }
  }

  // --- Informational log ---
  if (informational.length > 0) {
    lines.push(`\n<details>\n<summary>Transform Log (${informational.length} entries)</summary>\n`);
    for (const msg of informational) {
      lines.push(`- ${msg}`);
    }
    lines.push(`\n</details>`);
  }

  writeFileAtomic.sync(join(cwd, "MIGRATION_REPORT.md"), lines.join("\n") + "\n");
}
