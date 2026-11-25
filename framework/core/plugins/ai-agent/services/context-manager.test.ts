import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { createContextManager } from "./context-manager";
import type { IAiAgentBladeContext } from "@core/plugins/ai-agent/types";

function setup() {
  // Reactive like the blade stack's active blade
  const active = ref<IAiAgentBladeContext | null>({ id: "list", name: "OrdersList" });
  const manager = createContextManager({
    userGetter: () => undefined,
    bladeGetter: () => active.value,
    localeGetter: () => "en",
  });
  const activate = (blade: IAiAgentBladeContext | null) => {
    active.value = blade;
  };
  return { manager, activate };
}

describe("createContextManager", () => {
  it("shows the context of the active blade", () => {
    const { manager } = setup();
    manager.setContextData([{ id: "o1" }], "list", undefined, "list");
    expect(manager.contextItems.value).toEqual([{ id: "o1" }]);
  });

  it("keeps the parent context when a child blade closes", () => {
    const { manager, activate } = setup();
    manager.setContextData([{ id: "o1" }], "list", undefined, "list");

    // A child opens and becomes active
    activate({ id: "details", name: "OrderDetails" });
    manager.setContextData([{ id: "o1", number: "CO-1" }], "details", undefined, "details");
    // The stack drops the child first, so the parent is active when the child unmounts
    activate({ id: "list", name: "OrdersList" });
    manager.setContextData([], "list", undefined, "details");

    expect(manager.contextItems.value).toEqual([{ id: "o1" }]);
  });

  it("stores the context under the blade that set it, not under the active one", () => {
    const { manager, activate } = setup();
    activate({ id: "details", name: "OrderDetails" });

    // The parent list updates its selection while the child is active
    manager.setContextData([{ id: "o2" }], "list", undefined, "list");
    expect(manager.contextItems.value).toEqual([]);

    activate({ id: "list", name: "OrdersList" });
    expect(manager.contextItems.value).toEqual([{ id: "o2" }]);
  });

  it("falls back to the active blade when the caller has no blade", () => {
    const { manager } = setup();
    manager.setContextData([{ id: "o1" }], "list");
    expect(manager.contextItems.value).toEqual([{ id: "o1" }]);
  });
});
