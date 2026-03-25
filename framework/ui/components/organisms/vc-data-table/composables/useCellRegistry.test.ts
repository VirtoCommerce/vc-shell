import { describe, it, expect, beforeEach } from "vitest";
import { defineComponent } from "vue";
import { useCellRegistry } from "./useCellRegistry";

const DummyComponent = defineComponent({ template: "<span />" });
const DummyComponent2 = defineComponent({ template: "<div />" });

describe("useCellRegistry", () => {
  let registry: ReturnType<typeof useCellRegistry>;

  beforeEach(() => {
    registry = useCellRegistry();
    registry.clear();
  });

  it("register + get returns the registration", () => {
    registry.register({ type: "text", component: DummyComponent });
    const entry = registry.get("text");
    expect(entry).toBeDefined();
    expect(entry!.type).toBe("text");
    expect(entry!.component).toBe(DummyComponent);
  });

  it("has returns true for registered, false for unregistered", () => {
    expect(registry.has("money")).toBe(false);
    registry.register({ type: "money", component: DummyComponent });
    expect(registry.has("money")).toBe(true);
  });

  it("get returns undefined for unregistered type", () => {
    expect(registry.get("nonexistent")).toBeUndefined();
  });

  it("getRegisteredTypes lists all registered type names", () => {
    registry.register({ type: "text", component: DummyComponent });
    registry.register({ type: "number", component: DummyComponent });
    const types = registry.getRegisteredTypes();
    expect(types).toContain("text");
    expect(types).toContain("number");
    expect(types).toHaveLength(2);
  });

  it("unregister removes a type and returns true", () => {
    registry.register({ type: "date", component: DummyComponent });
    expect(registry.unregister("date")).toBe(true);
    expect(registry.has("date")).toBe(false);
  });

  it("unregister returns false for non-existent type", () => {
    expect(registry.unregister("nothing")).toBe(false);
  });

  it("clear removes all registrations", () => {
    registry.register({ type: "a", component: DummyComponent });
    registry.register({ type: "b", component: DummyComponent });
    registry.clear();
    expect(registry.getRegisteredTypes()).toHaveLength(0);
  });

  it("register with config stores config correctly", () => {
    registry.register({
      type: "status",
      component: DummyComponent,
      config: { editable: false, additionalProps: ["color"] },
    });
    const entry = registry.get("status");
    expect(entry!.config).toEqual({ editable: false, additionalProps: ["color"] });
  });

  it("re-registering a type overwrites the previous entry", () => {
    registry.register({ type: "text", component: DummyComponent });
    registry.register({ type: "text", component: DummyComponent2 });
    expect(registry.get("text")!.component).toBe(DummyComponent2);
  });

  it("shared registry: two useCellRegistry() calls share state", () => {
    const r1 = useCellRegistry();
    const r2 = useCellRegistry();
    r1.register({ type: "shared-test", component: DummyComponent });
    expect(r2.has("shared-test")).toBe(true);
    // Clean up
    r1.unregister("shared-test");
  });
});
