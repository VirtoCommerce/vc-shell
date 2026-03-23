import { describe, it, expect } from "vitest";
import jscodeshift from "jscodeshift";
import useBladeTransform from "../../src/transforms/use-blade-migration";
import notificationTransform from "../../src/transforms/notification-migration";
import bladePropsTransform from "../../src/transforms/blade-props-simplification";
import { deduplicateImportSpecifiers } from "../../src/utils/import-dedup";

/**
 * Simulates the real pipeline: run transforms sequentially on the same source,
 * applying dedup between each step (as the runner does).
 */
function runPipeline(
  source: string,
  filePath: string,
  transforms: Array<{ name: string; transform: any }>,
): { result: string; reports: string[] } {
  const j = jscodeshift.withParser("tsx");
  const reports: string[] = [];
  let current = source;

  for (const { name, transform } of transforms) {
    const api = {
      jscodeshift: j,
      j,
      stats: () => {},
      report: (msg: string) => reports.push(`[${name}] ${msg}`),
    };

    try {
      const result = transform(
        { path: filePath, source: current },
        api as any,
        { cwd: "." } as any,
      );

      if (result != null && result !== current) {
        current = deduplicateImportSpecifiers(result, j);
      }
    } catch (err) {
      reports.push(`[${name}] ERROR: ${(err as Error).message}`);
    }
  }

  return { result: current, reports };
}

describe("cascade resilience", () => {
  it("handles file with useBladeNavigation + useNotifications + blade props", () => {
    const input = `<template>
  <VcBlade
    :expanded="expanded"
    :closable="closable"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <div>content</div>
  </VcBlade>
</template>

<script setup lang="ts">
import {
  IParentCallArgs,
  useBladeNavigation,
  useNotifications,
  usePopup,
} from "@vc-shell/framework";

interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
}

interface Emits {
  (e: "parent:call", args: IParentCallArgs): void;
  (e: "close:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

const { openBlade, onBeforeClose } = useBladeNavigation();
const { notification } = useNotifications();

function save() {
  emit("parent:call", { method: "refresh" });
}

function close() {
  emit("close:blade");
}

const id = props.param;
</script>`;

    const { result, reports } = runPipeline(input, "test.vue", [
      { name: "use-blade-migration", transform: useBladeTransform },
      { name: "notification-migration", transform: notificationTransform },
      { name: "blade-props-simplification", transform: bladePropsTransform },
    ]);

    // No ERROR reports
    const errors = reports.filter((r) => r.includes("ERROR"));
    expect(errors).toHaveLength(0);

    // useBladeNavigation renamed
    expect(result).toContain("useBlade");
    expect(result).not.toContain("useBladeNavigation");

    // useNotifications renamed
    expect(result).toContain("useBladeNotifications");
    expect(result).not.toMatch(/\buseNotifications\b/);

    // No duplicate useBlade in imports
    const scriptMatch = result.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    const script = scriptMatch?.[1] ?? "";
    const importBlock = script.match(/import\s*\{([^}]+)\}/)?.[1] ?? "";
    const importUseBladeCount = (importBlock.match(/\buseBlade\b/g) || []).length;
    expect(importUseBladeCount).toBe(1);

    // Blade props removed from template
    expect(result).not.toContain(':expanded="expanded"');
    expect(result).not.toContain(':closable="closable"');
    expect(result).not.toContain('@close="$emit(\'close:blade\')"');

    // callParent and closeSelf added
    expect(result).toContain("callParent");
    expect(result).toContain("closeSelf");
    expect(result).toContain("param");
  });

  it("dedup prevents cascade errors between transforms", () => {
    const input = `import { useBlade, usePopup, useBlade } from "@vc-shell/framework";
const { openBlade } = useBlade();`;

    const j = jscodeshift.withParser("tsx");
    const deduped = deduplicateImportSpecifiers(input, j);

    expect(() => j(deduped)).not.toThrow();
    const useBladeCount = (deduped.match(/useBlade/g) || []).length;
    // One in import, one in call
    expect(useBladeCount).toBe(2);
  });
});
