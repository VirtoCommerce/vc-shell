import { describe, it, expect, beforeEach } from "vitest";
import { defineComponent, shallowReactive, DefineComponent, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { PopupPluginKey } from "@core/composables/usePopup/keys";
import type { PopupPlugin, UsePopupProps, UsePopupInternal } from "@core/composables/usePopup/types";
import { usePopup } from "./index";
import { registerPopupPreset, _resetPopupPresets } from "./preset-registry";

// Mock preset components (simple defineComponent stubs)
const MockWarning = defineComponent({ name: "MockWarning", emits: ["close", "confirm"], template: "<div />" });
const MockError = defineComponent({ name: "MockError", emits: ["close"], template: "<div />" });
const MockInfo = defineComponent({ name: "MockInfo", emits: ["close"], template: "<div />" });

function createPopupPlugin(): PopupPlugin {
  return {
    popups: shallowReactive<(UsePopupProps<DefineComponent> & UsePopupInternal)[]>([]),
  };
}

function mountWithPopup(setupFn: () => ReturnType<typeof usePopup>, plugin?: PopupPlugin) {
  const popupPlugin = plugin ?? createPopupPlugin();
  let result: ReturnType<typeof usePopup> | undefined;

  const Comp = defineComponent({
    setup() {
      result = setupFn();
      return () => null;
    },
  });

  const wrapper = mount(Comp, {
    global: {
      provide: { [PopupPluginKey as symbol]: popupPlugin },
    },
  });

  return { result: result!, popupPlugin, wrapper };
}

describe("usePopup", () => {
  beforeEach(() => {
    _resetPopupPresets();
    registerPopupPreset("warning", MockWarning);
    registerPopupPreset("error", MockError);
    registerPopupPreset("info", MockInfo);
  });

  describe("built-in dialogs (no options)", () => {
    it("returns all expected methods", () => {
      const { result } = mountWithPopup(() => usePopup());

      expect(result.open).toBeTypeOf("function");
      expect(result.close).toBeTypeOf("function");
      expect(result.showConfirmation).toBeTypeOf("function");
      expect(result.showError).toBeTypeOf("function");
      expect(result.showInfo).toBeTypeOf("function");
    });

    it("showConfirmation pushes a popup onto the stack", () => {
      const { result, popupPlugin } = mountWithPopup(() => usePopup());

      // Don't await — we test the stack state
      result.showConfirmation("Delete this?");

      expect(popupPlugin.popups.length).toBe(1);
    });

    it("showConfirmation resolves true on confirm", async () => {
      const { result, popupPlugin } = mountWithPopup(() => usePopup());

      const promise = result.showConfirmation("Delete?");

      // Find the popup and trigger onConfirm
      const popup = popupPlugin.popups[0] as any;
      expect(popup).toBeDefined();
      popup.emits.onConfirm();

      const confirmed = await promise;
      expect(confirmed).toBe(true);
    });

    it("showConfirmation resolves false on close", async () => {
      const { result, popupPlugin } = mountWithPopup(() => usePopup());

      const promise = result.showConfirmation("Delete?");

      const popup = popupPlugin.popups[0] as any;
      popup.emits.onClose();

      const confirmed = await promise;
      expect(confirmed).toBe(false);
    });

    it("showError pushes an error popup onto the stack", () => {
      const { result, popupPlugin } = mountWithPopup(() => usePopup());

      result.showError("Something went wrong");

      expect(popupPlugin.popups.length).toBe(1);
    });

    it("showInfo pushes an info popup onto the stack", () => {
      const { result, popupPlugin } = mountWithPopup(() => usePopup());

      result.showInfo("Operation completed");

      expect(popupPlugin.popups.length).toBe(1);
    });
  });

  describe("custom popup component", () => {
    const FakePopup = defineComponent({
      name: "FakePopup",
      props: { title: String },
      emits: ["confirm", "close"],
      setup() {
        return () => null;
      },
    });

    it("open() pushes custom popup onto the stack", async () => {
      const { result, popupPlugin } = mountWithPopup(() =>
        usePopup({
          component: FakePopup as any,
          props: { title: "Test" },
          emits: { onConfirm: () => {}, onClose: () => {} },
        }),
      );

      result.open();
      await nextTick();

      expect(popupPlugin.popups.length).toBe(1);
    });

    it("close() removes custom popup from the stack", async () => {
      const { result, popupPlugin } = mountWithPopup(() =>
        usePopup({
          component: FakePopup as any,
          props: { title: "Test" },
          emits: { onConfirm: () => {}, onClose: () => {} },
        }),
      );

      result.open();
      await nextTick();
      expect(popupPlugin.popups.length).toBe(1);

      result.close();
      expect(popupPlugin.popups.length).toBe(0);
    });
  });

  describe("multiple popups", () => {
    it("stacks multiple popups", () => {
      const { result, popupPlugin } = mountWithPopup(() => usePopup());

      result.showError("Error 1");
      result.showInfo("Info 1");

      expect(popupPlugin.popups.length).toBe(2);
    });

    // Regression: pushInstance() calls destroy() with the incoming instance to
    // drop a same-id duplicate. A structural comparator treated every popup that
    // merely HAS a component as equal, so opening a second popup evicted the first.
    it("opening a distinct popup does not evict earlier ones", async () => {
      const StackPopup = defineComponent({ name: "StackPopup", props: { title: String }, setup: () => () => null });
      const plugin = createPopupPlugin();

      const a = mountWithPopup(
        () => usePopup({ component: StackPopup as any, props: { title: "A" }, emits: {} }),
        plugin,
      ).result;
      const b = mountWithPopup(
        () => usePopup({ component: StackPopup as any, props: { title: "B" }, emits: {} }),
        plugin,
      ).result;
      const c = mountWithPopup(
        () => usePopup({ component: StackPopup as any, props: { title: "C" }, emits: {} }),
        plugin,
      ).result;

      a.open();
      await nextTick();
      b.open();
      await nextTick();
      c.open();
      await nextTick();

      expect(plugin.popups.length).toBe(3);
      expect(plugin.popups.map((p) => (p.props as { title: string }).title)).toEqual(["A", "B", "C"]);
    });
  });
});
