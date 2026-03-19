import { describe, it, expect, beforeEach, vi } from "vitest";
import { defineComponent } from "vue";
import { useExtensionPoint } from "./useExtensionPoint";
import { getPoint, getRegistry } from "./store";
import type { ExtensionComponent } from "./types";

// Suppress dev warnings from getPoint about undeclared extension points
beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});

  // Clear registry between tests by deleting all keys
  const registry = getRegistry();
  for (const key of Object.keys(registry)) {
    delete registry[key];
  }
});

const FakeComponent = defineComponent({ template: "<div />" });

function makeEntry(id: string): ExtensionComponent {
  return { id, component: FakeComponent };
}

describe("useExtensionPoint", () => {
  describe("add", () => {
    it("adds a component to the extension point", () => {
      const { add } = useExtensionPoint("test-point");
      add(makeEntry("comp-1"));

      const state = getPoint("test-point");
      expect(state.components).toHaveLength(1);
      expect(state.components[0].id).toBe("comp-1");
    });

    it("adds multiple components", () => {
      const { add } = useExtensionPoint("test-point");
      add(makeEntry("comp-1"));
      add(makeEntry("comp-2"));

      const state = getPoint("test-point");
      expect(state.components).toHaveLength(2);
    });

    it("replaces component with same id", () => {
      const { add } = useExtensionPoint("test-point");
      add({ id: "comp-1", component: FakeComponent, props: { text: "old" } });
      add({ id: "comp-1", component: FakeComponent, props: { text: "new" } });

      const state = getPoint("test-point");
      expect(state.components).toHaveLength(1);
      expect(state.components[0].props).toEqual({ text: "new" });
    });

    it("preserves entry order when replacing", () => {
      const { add } = useExtensionPoint("test-point");
      add(makeEntry("a"));
      add(makeEntry("b"));
      add(makeEntry("c"));

      // Replace "b"
      add({ id: "b", component: FakeComponent, props: { replaced: true } });

      const state = getPoint("test-point");
      expect(state.components.map((c) => c.id)).toEqual(["a", "b", "c"]);
      expect(state.components[1].props).toEqual({ replaced: true });
    });

    it("supports props, priority, and meta", () => {
      const { add } = useExtensionPoint("test-point");
      add({
        id: "full",
        component: FakeComponent,
        props: { label: "Hello" },
        priority: 10,
        meta: { type: "action" },
      });

      const state = getPoint("test-point");
      expect(state.components[0].props).toEqual({ label: "Hello" });
      expect(state.components[0].priority).toBe(10);
      expect(state.components[0].meta).toEqual({ type: "action" });
    });
  });

  describe("remove", () => {
    it("removes a component by id", () => {
      const { add, remove } = useExtensionPoint("test-point");
      add(makeEntry("comp-1"));
      add(makeEntry("comp-2"));

      remove("comp-1");

      const state = getPoint("test-point");
      expect(state.components).toHaveLength(1);
      expect(state.components[0].id).toBe("comp-2");
    });

    it("does nothing when removing non-existent id", () => {
      const { add, remove } = useExtensionPoint("test-point");
      add(makeEntry("comp-1"));

      remove("non-existent");

      const state = getPoint("test-point");
      expect(state.components).toHaveLength(1);
    });

    it("can remove all components", () => {
      const { add, remove } = useExtensionPoint("test-point");
      add(makeEntry("a"));
      add(makeEntry("b"));

      remove("a");
      remove("b");

      const state = getPoint("test-point");
      expect(state.components).toHaveLength(0);
    });
  });

  describe("separate extension points", () => {
    it("isolates components between different extension points", () => {
      const point1 = useExtensionPoint("point-1");
      const point2 = useExtensionPoint("point-2");

      point1.add(makeEntry("comp-a"));
      point2.add(makeEntry("comp-b"));

      expect(getPoint("point-1").components).toHaveLength(1);
      expect(getPoint("point-1").components[0].id).toBe("comp-a");
      expect(getPoint("point-2").components).toHaveLength(1);
      expect(getPoint("point-2").components[0].id).toBe("comp-b");
    });
  });

  describe("shared state", () => {
    it("multiple useExtensionPoint calls for the same name share state", () => {
      const instance1 = useExtensionPoint("shared");
      const instance2 = useExtensionPoint("shared");

      instance1.add(makeEntry("from-1"));
      expect(getPoint("shared").components).toHaveLength(1);

      instance2.add(makeEntry("from-2"));
      expect(getPoint("shared").components).toHaveLength(2);

      instance1.remove("from-2");
      expect(getPoint("shared").components).toHaveLength(1);
    });
  });
});
