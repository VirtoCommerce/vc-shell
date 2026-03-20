import { describe, it, expect } from "vitest";
import { transformDefineBlade } from "./viteBladePlugin";

describe("viteBladePlugin transform", () => {
  it("transforms defineBlade into defineOptions + __registerBladeConfig", () => {
    const input = `<script setup lang="ts">
defineBlade({
  name: "Orders",
  url: "/orders",
  isWorkspace: true,
  permissions: ["seller:orders:view"],
  menuItem: {
    title: "ORDERS.MENU.TITLE",
    icon: "lucide-shopping-cart",
    priority: 1,
  },
});

const { openBlade } = useBlade();
</script>

<template><div /></template>`;

    const result = transformDefineBlade(input, "test.vue");
    expect(result).not.toBeNull();

    const code = result!.code;
    expect(code).toContain('defineOptions({ name: "Orders" })');
    expect(code).toContain("import { __registerBladeConfig }");
    expect(code).toContain('__registerBladeConfig("Orders"');
    expect(code).toContain('"/orders"');
    expect(code).toContain("isWorkspace: true");
    expect(code).not.toContain("defineBlade(");
    expect(code).toContain("const { openBlade } = useBlade()");
  });

  it("returns null for files without defineBlade", () => {
    const input = `<script setup lang="ts">
defineOptions({ name: "Foo" });
</script>
<template><div /></template>`;

    const result = transformDefineBlade(input, "test.vue");
    expect(result).toBeNull();
  });

  it("returns null for non-vue files", () => {
    const input = `defineBlade({ name: "Test", url: "/test" });`;
    const result = transformDefineBlade(input, "test.ts");
    expect(result).toBeNull();
  });

  it("handles minimal defineBlade (name + url only)", () => {
    const input = `<script setup lang="ts">
defineBlade({
  name: "Details",
  url: "/detail",
});
</script>
<template><div /></template>`;

    const result = transformDefineBlade(input, "test.vue");
    expect(result).not.toBeNull();
    expect(result!.code).toContain('defineOptions({ name: "Details" })');
    expect(result!.code).toContain('__registerBladeConfig("Details"');
  });

  it("emits warning for legacy defineOptions with blade fields", () => {
    const warnings: string[] = [];
    const input = `<script setup lang="ts">
defineOptions({
  name: "Orders",
  url: "/orders",
  isWorkspace: true,
});
</script>
<template><div /></template>`;

    transformDefineBlade(input, "legacy.vue", (msg) => warnings.push(msg));
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain("defineOptions");
    expect(warnings[0]).toContain("defineBlade");
  });
});
