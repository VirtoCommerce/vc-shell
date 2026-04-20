import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { provideAppBarState, useAppBarState } from "./useAppBarState";

describe("useAppBarState", () => {
  it("returns fallback state when no provider exists", () => {
    let state: ReturnType<typeof useAppBarState>;
    const Comp = defineComponent({
      setup() {
        state = useAppBarState();
        return () => h("div");
      },
    });
    mount(Comp);

    expect(state!.activeWidgetId.value).toBeNull();
    expect(state!.activeMobileActionId.value).toBeNull();
  });

  it("provideAppBarState creates fresh scoped state", () => {
    let provided: ReturnType<typeof provideAppBarState>;
    let consumed: ReturnType<typeof useAppBarState>;

    const Child = defineComponent({
      setup() {
        consumed = useAppBarState();
        return () => h("div");
      },
    });
    const Parent = defineComponent({
      setup() {
        provided = provideAppBarState();
        return () => h(Child);
      },
    });
    mount(Parent);

    expect(provided!.activeWidgetId.value).toBeNull();
    expect(provided!.activeMobileActionId.value).toBeNull();
    // Should be the same refs
    provided!.activeWidgetId.value = "widget-1";
    expect(consumed!.activeWidgetId.value).toBe("widget-1");
  });

  it("different providers create independent state", () => {
    let stateA: ReturnType<typeof useAppBarState>;
    let stateB: ReturnType<typeof useAppBarState>;

    const ChildA = defineComponent({
      setup() {
        stateA = useAppBarState();
        return () => h("div");
      },
    });
    const ChildB = defineComponent({
      setup() {
        stateB = useAppBarState();
        return () => h("div");
      },
    });

    const ParentA = defineComponent({
      setup() {
        provideAppBarState();
        return () => h(ChildA);
      },
    });
    const ParentB = defineComponent({
      setup() {
        provideAppBarState();
        return () => h(ChildB);
      },
    });

    mount(ParentA);
    mount(ParentB);

    stateA!.activeWidgetId.value = "a";
    expect(stateB!.activeWidgetId.value).toBeNull();
  });
});
