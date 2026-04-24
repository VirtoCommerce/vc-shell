// @vitest-environment node
import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/notification-migration";
import { applyTransform } from "../../../src/utils/test-helpers";

describe("notification-migration (jscodeshift)", () => {
  it("renames useNotifications to useBladeNotifications and converts no-arg call", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { useNotifications } from "@vc-shell/framework";\nconst { notifications } = useNotifications();`,
    });
    expect(result).toContain("useBladeNotifications");
    expect(result).not.toContain("useNotifications");
    expect(result).toContain("types: []");
    expect(result).toContain("messages");
    expect(result).not.toMatch(/\bnotifications\b/);
  });

  it('converts string arg: useNotifications("Type") → useBladeNotifications({ types: ["Type"] })', () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { useNotifications } from "@vc-shell/framework";
const { moduleNotifications, markAsRead } = useNotifications("ImportPushNotification");`,
    });
    expect(result).toContain('types: ["ImportPushNotification"]');
    expect(result).toContain("messages");
    expect(result).not.toContain("moduleNotifications");
    expect(result).toContain("markAsRead");
  });

  it("renames notifications return property to messages", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { useNotifications } from "@vc-shell/framework";
const { notifications } = useNotifications();
console.log(notifications.value);`,
    });
    expect(result).toContain("messages");
    expect(result).toContain("messages.value");
    expect(result).not.toMatch(/\bnotifications\b/);
  });

  it("renames moduleNotifications to messages in downstream usage", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { useNotifications } from "@vc-shell/framework";
const { moduleNotifications, markAsRead } = useNotifications("Event");
watch(moduleNotifications, (newVal) => { console.log(newVal); });`,
    });
    expect(result).toContain("messages");
    expect(result).not.toContain("moduleNotifications");
  });

  it("skips files without @vc-shell/framework import", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { ref } from "vue";\nconst x = ref(0);`,
    });
    expect(result).toBeNull();
  });

  it("skips files without useNotifications import", () => {
    const result = applyTransform(transform, {
      path: "test.ts",
      source: `import { ref } from "@vc-shell/framework";\nconst x = ref(0);`,
    });
    expect(result).toBeNull();
  });

  it("handles Vue SFC files", () => {
    const vue = `<template><div/></template>
<script setup lang="ts">
import { useNotifications } from "@vc-shell/framework";
const { moduleNotifications, markAsRead } = useNotifications("MyEvent");
</script>`;
    const result = applyTransform(transform, { path: "test.vue", source: vue });
    expect(result).toContain("<template><div/></template>");
    expect(result).toContain("useBladeNotifications");
    expect(result).toContain('types: ["MyEvent"]');
    expect(result).toContain("messages");
    expect(result).not.toContain("moduleNotifications");
  });
});
