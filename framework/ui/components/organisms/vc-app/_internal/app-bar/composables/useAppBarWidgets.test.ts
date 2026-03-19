import { ref } from "vue";
import { mountWithSetup } from "@framework/test-helpers";

const mockItems = ref([
  { id: "widget-1" },
  { id: "widget-2" },
]);

vi.mock("@core/composables/useAppBarWidget", () => ({
  useAppBarWidget: () => ({
    items: mockItems,
  }),
}));

vi.mock(
  "@ui/components/organisms/vc-app/_internal/app-bar/composables/useAppBarState",
  () => ({
    useAppBarState: () => ({
      activeWidgetId: ref<string | null>(null),
    }),
  }),
);

import { useAppBarWidgets } from "./useAppBarWidgets";

describe("useAppBarWidgets", () => {
  it("returns the expected API shape", () => {
    const { result } = mountWithSetup(() => useAppBarWidgets());

    expect(result).toHaveProperty("showWidget");
    expect(result).toHaveProperty("hideAllWidgets");
    expect(result).toHaveProperty("toggleWidget");
    expect(result).toHaveProperty("currentWidget");
    expect(result).toHaveProperty("isAnyWidgetVisible");
  });

  it("showWidget activates a widget", () => {
    const { result } = mountWithSetup(() => useAppBarWidgets());

    result.showWidget("widget-1");
    expect(result.currentWidget.value).toEqual({ id: "widget-1" });
    expect(result.isAnyWidgetVisible.value).toBe(true);
  });

  it("toggleWidget toggles visibility", () => {
    const { result } = mountWithSetup(() => useAppBarWidgets());

    result.toggleWidget("widget-2");
    expect(result.isAnyWidgetVisible.value).toBe(true);

    result.toggleWidget("widget-2");
    expect(result.isAnyWidgetVisible.value).toBe(false);
  });

  it("hideAllWidgets clears active widget", () => {
    const { result } = mountWithSetup(() => useAppBarWidgets());

    result.showWidget("widget-1");
    result.hideAllWidgets();
    expect(result.currentWidget.value).toBeNull();
  });
});
