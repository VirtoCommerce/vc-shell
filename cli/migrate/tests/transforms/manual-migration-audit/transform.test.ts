import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/manual-migration-audit";
import { applyTransformWithReports } from "../../../src/utils/test-helpers";

describe("manual-migration-audit", () => {
  it("warns about useExternalWidgets", () => {
    const input = `<template><div/></template>
<script setup lang="ts">
import { useExternalWidgets } from "@vc-shell/framework";
useExternalWidgets({ bladeId });
</script>`;
    const { result, reports } = applyTransformWithReports(transform, { path: "test.vue", source: input });
    expect(result).toBeNull();
    expect(reports.some((r) => r.includes("useExternalWidgets"))).toBe(true);
  });

  it("warns about moment import", () => {
    const input = `<template><div/></template>
<script setup lang="ts">
import moment from "moment";
</script>`;
    const { reports } = applyTransformWithReports(transform, { path: "test.vue", source: input });
    expect(reports.some((r) => r.includes("moment"))).toBe(true);
  });

  it("warns about useFunctions", () => {
    const input = `<template><div/></template>
<script setup lang="ts">
import { useFunctions } from "@vc-shell/framework";
const { debounce } = useFunctions();
</script>`;
    const { reports } = applyTransformWithReports(transform, { path: "test.vue", source: input });
    expect(reports.some((r) => r.includes("useFunctions"))).toBe(true);
  });

  it("warns about closeBlade", () => {
    const input = `<template><div/></template>
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";
const { closeBlade } = useBlade();
closeBlade(1);
</script>`;
    const { reports } = applyTransformWithReports(transform, { path: "test.vue", source: input });
    expect(reports.some((r) => r.includes("closeBlade"))).toBe(true);
  });

  it("warns about multiple useBlade() calls", () => {
    const input = `<template><div/></template>
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";
const { openBlade, closeSelf } = useBlade();
const blade = useBlade();
</script>`;
    const { reports } = applyTransformWithReports(transform, { path: "test.vue", source: input });
    expect(reports.some((r) => r.includes("Multiple useBlade()"))).toBe(true);
  });

  it("does not warn on clean files", () => {
    const input = `<template><div/></template>
<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";
const { closeSelf } = useBlade();
</script>`;
    const { reports } = applyTransformWithReports(transform, { path: "test.vue", source: input });
    expect(reports).toHaveLength(0);
  });
});
