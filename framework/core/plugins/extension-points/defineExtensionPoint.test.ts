import { describe, it, expect, beforeEach } from "vitest";
import { defineComponent } from "vue";
import { defineExtensionPoint } from "./defineExtensionPoint";
import { useExtensionPoint } from "./useExtensionPoint";
import { getRegistry } from "./store";

beforeEach(() => {
  const registry = getRegistry();
  for (const key of Object.keys(registry)) {
    delete registry[key];
  }
});

const FakeComponent = defineComponent({ template: "<div />" });

describe("defineExtensionPoint ordering", () => {
  it("sorts components by priority, lower first", () => {
    const { add } = useExtensionPoint("order-point");
    add({ id: "a", component: FakeComponent, priority: 20 });
    add({ id: "b", component: FakeComponent, priority: 10 });
    add({ id: "c", component: FakeComponent });

    const { components } = defineExtensionPoint("order-point");
    expect(components.value.map((c) => c.id)).toEqual(["c", "b", "a"]);
  });

  it("keeps registration order for equal priority", () => {
    const { add } = useExtensionPoint("tie-point");
    add({ id: "z", component: FakeComponent });
    add({ id: "a", component: FakeComponent });
    add({ id: "m", component: FakeComponent, priority: 0 });

    const { components } = defineExtensionPoint("tie-point");
    expect(components.value.map((c) => c.id)).toEqual(["z", "a", "m"]);
  });

  it("sorts negative priorities before the default", () => {
    const { add } = useExtensionPoint("negative-point");
    add({ id: "default", component: FakeComponent });
    add({ id: "early", component: FakeComponent, priority: -10 });

    const { components } = defineExtensionPoint("negative-point");
    expect(components.value.map((c) => c.id)).toEqual(["early", "default"]);
  });

  it("re-sorts when a component is replaced with a new priority", () => {
    const { add } = useExtensionPoint("replace-point");
    add({ id: "first", component: FakeComponent, priority: 10 });
    add({ id: "second", component: FakeComponent, priority: 20 });

    const { components } = defineExtensionPoint("replace-point");
    expect(components.value.map((c) => c.id)).toEqual(["first", "second"]);

    add({ id: "first", component: FakeComponent, priority: 30 });
    expect(components.value.map((c) => c.id)).toEqual(["second", "first"]);
  });
});
