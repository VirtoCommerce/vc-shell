import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/blade-events-cleanup";
import { applyTransformWithReports } from "../../../src/utils/test-helpers";

describe("blade-events-cleanup", () => {
  it("removes blade events from wrapper components", () => {
    const source = `<template>
  <BaseListBlade
    ref="baseListBladeRef"
    :title="title"
    @parent:call="$emit('parent:call', $event)"
    @close:blade="$emit('close:blade')"
    @collapse:blade="$emit('collapse:blade')"
    @expand:blade="$emit('expand:blade')"
  />
</template>
<script setup lang="ts">
</script>`;

    const result = applyTransformWithReports(transform, { path: "test.vue", source });
    expect(result.result).not.toBeNull();
    expect(result.result).not.toContain("@parent:call");
    expect(result.result).not.toContain("@close:blade");
    expect(result.result).not.toContain("@collapse:blade");
    expect(result.result).not.toContain("@expand:blade");
    expect(result.result).toContain(":title");
    expect(result.reports).toHaveLength(1);
  });

  it("removes blade-only Emits interface and defineEmits", () => {
    const source = `<template>
  <div />
</template>
<script setup lang="ts">
export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}
defineEmits<Emits>();
</script>`;

    const result = applyTransformWithReports(transform, { path: "test.vue", source });
    expect(result.result).not.toBeNull();
    expect(result.result).not.toContain("interface Emits");
    expect(result.result).not.toContain("defineEmits");
  });

  it("does nothing if no blade events", () => {
    const source = `<template>
  <MyComponent @click="handle" />
</template>
<script setup lang="ts">
</script>`;

    const result = applyTransformWithReports(transform, { path: "test.vue", source });
    expect(result.result).toBeNull();
    expect(result.reports).toHaveLength(0);
  });

  it("ignores non-vue files", () => {
    const source = `emit("close:blade");`;
    const result = applyTransformWithReports(transform, { path: "test.ts", source });
    expect(result.result).toBeNull();
  });
});
