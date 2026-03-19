import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import { runBladePropsSimplification } from "../../../src/transforms/blade-props-simplification";

describe("blade-props-simplification transform", () => {
  // Test 1: Standard blade with full boilerplate
  it("removes blade boilerplate props and emits, adds useBlade", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "MyBlade.ts",
      `import { defineComponent } from "@vc-shell/framework";
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

function save() {
  emit("parent:call", { method: "refresh" });
}

function close() {
  emit("close:blade");
}

const id = props.param;
const opts = props.options;
`,
    );

    const result = runBladePropsSimplification(project, {
      dryRun: false,
      cwd: ".",
    });

    const text = source.getFullText();

    // Props should keep only non-blade fields
    expect(text).toContain("model");
    expect(text).not.toMatch(/\bexpanded\??\s*:/);
    expect(text).not.toMatch(/\bclosable\??\s*:/);

    // Emits interface should be removed
    expect(text).not.toContain("interface Emits");
    expect(text).not.toContain("defineEmits");

    // IParentCallArgs import should be removed
    expect(text).not.toContain("IParentCallArgs");

    // useBlade should be added
    expect(text).toContain("useBlade");

    // emit calls should be replaced
    expect(text).toContain("callParent");
    expect(text).toContain("closeSelf");

    // props.param → param.value
    expect(text).toContain("param.value");
    expect(text).toContain("options.value");

    expect(result.filesModified).toHaveLength(1);
  });

  // Test 2: Skip files without blade boilerplate
  it("skips files without blade props/emits", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile(
      "Regular.ts",
      `import { ref } from "vue";
const count = ref(0);`,
    );

    const result = runBladePropsSimplification(project, {
      dryRun: false,
      cwd: ".",
    });
    expect(result.filesModified).toHaveLength(0);
  });

  // Test 3: Props with only blade fields → remove defineProps entirely
  it("removes defineProps when only blade fields exist", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "SimpleBlade.ts",
      `import { ref } from "@vc-shell/framework";

interface Props {
  expanded?: boolean;
  closable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});
`,
    );

    runBladePropsSimplification(project, { dryRun: false, cwd: "." });

    const text = source.getFullText();
    expect(text).not.toContain("defineProps");
    expect(text).not.toContain("withDefaults");
    expect(text).not.toContain("interface Props");
  });

  // Test 4: emit("parent:call") with args
  it("replaces emit parent:call with callParent", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "test.ts",
      `import type { IParentCallArgs } from "@vc-shell/framework";

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
`,
    );

    runBladePropsSimplification(project, { dryRun: false, cwd: "." });

    const text = source.getFullText();
    expect(text).toContain('callParent("refresh")');
    expect(text).toContain('callParent("update", { id: 123 })');
    expect(text).not.toContain("parent:call");
  });

  // Test 5: Only emits, no Props interface
  it("handles files with only Emits boilerplate", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "EmitsOnly.ts",
      `import type { IParentCallArgs } from "@vc-shell/framework";

interface Emits {
  (e: "parent:call", args: IParentCallArgs): void;
  (e: "close:blade"): void;
}

const emit = defineEmits<Emits>();

emit("close:blade");
`,
    );

    const result = runBladePropsSimplification(project, {
      dryRun: false,
      cwd: ".",
    });

    const text = source.getFullText();
    expect(text).not.toContain("interface Emits");
    expect(text).not.toContain("defineEmits");
    expect(text).toContain("closeSelf()");
    expect(result.filesModified).toHaveLength(1);
  });

  // Test 6: useBlade already imported — should not duplicate
  it("does not duplicate useBlade import if already present", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile(
      "Already.ts",
      `import { useBlade } from "@vc-shell/framework";

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
`,
    );

    runBladePropsSimplification(project, { dryRun: false, cwd: "." });

    const text = source.getFullText();
    // Count occurrences of useBlade in imports
    const matches = text.match(/useBlade/g);
    // useBlade appears in import + destructuring + call = at least 2-3, but import should be single
    const importMatches = text.match(/import.*useBlade.*from/g);
    expect(importMatches).toHaveLength(1);
  });
});
