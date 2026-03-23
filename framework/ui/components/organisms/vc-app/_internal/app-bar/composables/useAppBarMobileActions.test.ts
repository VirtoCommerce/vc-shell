import { ref, nextTick } from "vue";
import { mountWithSetup } from "@framework/test-helpers";

const mockButtons = ref<Array<{ id: string; onClose?: () => void }>>([]);

vi.mock("@core/composables/useAppBarMobileButtons", () => ({
  useAppBarMobileButtons: () => ({
    getButtons: mockButtons,
  }),
}));

vi.mock("@ui/components/organisms/vc-app/_internal/app-bar/composables/useAppBarState", () => ({
  useAppBarState: () => ({
    activeMobileActionId: ref<string | null>(null),
  }),
}));

import { useAppBarMobileActions } from "./useAppBarMobileActions";

describe("useAppBarMobileActions", () => {
  beforeEach(() => {
    mockButtons.value = [{ id: "btn-1" }, { id: "btn-2" }];
  });

  it("returns the expected API shape", () => {
    const { result } = mountWithSetup(() => useAppBarMobileActions());

    expect(result).toHaveProperty("showAction");
    expect(result).toHaveProperty("hideAllActions");
    expect(result).toHaveProperty("toggleAction");
    expect(result).toHaveProperty("currentAction");
    expect(result).toHaveProperty("isAnyActionVisible");
    expect(result).toHaveProperty("closeAction");
  });

  it("showAction activates a button", () => {
    const { result } = mountWithSetup(() => useAppBarMobileActions());

    result.showAction("btn-1");
    expect(result.currentAction.value).toEqual({ id: "btn-1" });
    expect(result.isAnyActionVisible.value).toBe(true);
  });

  it("toggleAction toggles visibility", () => {
    const { result } = mountWithSetup(() => useAppBarMobileActions());

    result.toggleAction("btn-2");
    expect(result.isAnyActionVisible.value).toBe(true);

    result.toggleAction("btn-2");
    expect(result.isAnyActionVisible.value).toBe(false);
  });

  it("hideAllActions clears active state", () => {
    const { result } = mountWithSetup(() => useAppBarMobileActions());

    result.showAction("btn-1");
    result.hideAllActions();
    expect(result.currentAction.value).toBeNull();
  });
});
