import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/blade-props-simplification";
import { applyTransform } from "../../../src/utils/test-helpers";

const BLADE_MARKER = `\ndefineOptions({ name: "TestBlade", url: "/test" });\n`;

describe("blade-props-simplification (jscodeshift)", () => {
  it("removes blade boilerplate props and emits, adds useBlade", () => {
    const input = `import { defineComponent } from "@vc-shell/framework";
import type { IParentCallArgs } from "@vc-shell/framework";

interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: Record<string, any>;
  model?: string;
}

interface Emits {
  (e: "parent:call", args: IParentCallArgs): void;
  (e: "close:blade"): void;
  (e: "expand:blade"): void;
  (e: "collapse:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();
${BLADE_MARKER}
function save() {
  emit("parent:call", { method: "refresh" });
}

function close() {
  emit("close:blade");
}

const id = props.param;
const opts = props.options;
`;
    const result = applyTransform(transform, { path: "MyBlade.ts", source: input });
    expect(result).not.toBeNull();
    expect(result).toContain("model");
    expect(result).not.toMatch(/\bexpanded\??\s*:/);
    expect(result).not.toMatch(/\bclosable\??\s*:/);
    expect(result).not.toContain("interface Emits");
    expect(result).not.toContain("defineEmits");
    expect(result).not.toContain("IParentCallArgs");
    expect(result).toContain("useBlade");
    expect(result).toContain("callParent");
    expect(result).toContain("closeSelf");
    expect(result).toContain("param.value");
    expect(result).toContain("options.value");
  });

  it("skips files without blade props/emits", () => {
    const result = applyTransform(transform, {
      path: "Regular.ts",
      source: `import { ref } from "vue";\nconst count = ref(0);`,
    });
    expect(result).toBeNull();
  });

  it("skips reusable components without defineOptions/defineBlade", () => {
    const input = `import { ref } from "@vc-shell/framework";

interface Props {
  expanded?: boolean;
  closable?: boolean;
  title: string;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

interface Emits {
  (e: "close:blade"): void;
}

const emit = defineEmits<Emits>();
`;
    const result = applyTransform(transform, { path: "BaseListBlade.ts", source: input });
    expect(result).toBeNull();
  });

  it("removes defineProps when only blade fields exist", () => {
    const input = `import { ref } from "@vc-shell/framework";
${BLADE_MARKER}
interface Props {
  expanded?: boolean;
  closable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});
`;
    const result = applyTransform(transform, { path: "SimpleBlade.ts", source: input });
    expect(result).not.toContain("defineProps");
    expect(result).not.toContain("withDefaults");
    expect(result).not.toContain("interface Props");
  });

  it("replaces emit parent:call with callParent", () => {
    const input = `import type { IParentCallArgs } from "@vc-shell/framework";
${BLADE_MARKER}
interface Emits {
  (e: "parent:call", args: IParentCallArgs): void;
  (e: "close:blade"): void;
}

const emit = defineEmits<Emits>();

function onSave() {
  emit("parent:call", { method: "refresh" });
}

function onSaveWithArgs() {
  emit("parent:call", { method: "update", args: { id: 123 } });
}
`;
    const result = applyTransform(transform, { path: "test.ts", source: input });
    expect(result).toContain('callParent("refresh")');
    expect(result).toContain('callParent("update", { id: 123 })');
    expect(result).not.toContain("parent:call");
  });

  it("handles files with only Emits boilerplate", () => {
    const input = `import type { IParentCallArgs } from "@vc-shell/framework";
${BLADE_MARKER}
interface Emits {
  (e: "parent:call", args: IParentCallArgs): void;
  (e: "close:blade"): void;
}

const emit = defineEmits<Emits>();

emit("close:blade");
`;
    const result = applyTransform(transform, { path: "EmitsOnly.ts", source: input });
    expect(result).not.toContain("interface Emits");
    expect(result).not.toContain("defineEmits");
    expect(result).toContain("closeSelf()");
  });

  it("does not duplicate useBlade import if already present", () => {
    const input = `import { useBlade } from "@vc-shell/framework";
${BLADE_MARKER}
interface Props {
  expanded?: boolean;
  closable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

interface Emits {
  (e: "close:blade"): void;
}

const emit = defineEmits<Emits>();

emit("close:blade");
`;
    const result = applyTransform(transform, { path: "Already.ts", source: input });
    const importMatches = result!.match(/import.*useBlade.*from/g);
    expect(importMatches).toHaveLength(1);
  });

  it("merges needed members into existing useBlade() call", () => {
    const input = `import { useBlade } from "@vc-shell/framework";
import type { IParentCallArgs } from "@vc-shell/framework";
${BLADE_MARKER}
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

const { openBlade, onBeforeClose } = useBlade();

emit("parent:call", { method: "refresh" });
emit("close:blade");
const id = props.param;
`;
    const result = applyTransform(transform, { path: "test.ts", source: input });
    expect(result).not.toBeNull();
    // Should NOT have a second useBlade() call
    const useBladeCallMatches = result!.match(/useBlade\(\)/g);
    expect(useBladeCallMatches).toHaveLength(1);
    // All members must appear in the SINGLE useBlade() destructuring line
    const useBladeDestructure = result!.match(/const\s*\{([^}]+)\}\s*=\s*useBlade\(\)/);
    expect(useBladeDestructure).not.toBeNull();
    const destructuredMembers = useBladeDestructure![1];
    expect(destructuredMembers).toContain("openBlade");
    expect(destructuredMembers).toContain("onBeforeClose");
    expect(destructuredMembers).toContain("param");
    expect(destructuredMembers).toContain("callParent");
    expect(destructuredMembers).toContain("closeSelf");
  });

  it("removes empty export type {} stubs after Props/Emits removal", () => {
    const input = `<template><div/></template>
<script setup lang="ts">
import { IParentCallArgs } from "@vc-shell/framework";

defineOptions({ name: "TestBlade", url: "/test" });

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: Record<string, any>;
}

export interface Emits {
  (e: "close:blade"): void;
  (e: "parent:call", args: IParentCallArgs): void;
}

const props = withDefaults(defineProps<Props>(), { expanded: true, closable: true });
const emit = defineEmits<Emits>();
</script>`;
    const result = applyTransform(transform, { path: "test.vue", source: input });
    expect(result).not.toBeNull();
    expect(result).not.toContain("export type {};");
  });
});
