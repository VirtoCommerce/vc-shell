import { describe, it, expect, beforeEach, vi } from "vitest";
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

    // The container renders string slots through v-html, so an entity name
    // interpolated into the message would be treated as markup (VCST-5665).
    it.each([
      ["showConfirmation", (r: any) => r.showConfirmation("Delete <h1>Big</h1>?")],
      ["showError", (r: any) => r.showError("Failed for <h1>Big</h1>")],
      ["showInfo", (r: any) => r.showInfo("Done with <h1>Big</h1>")],
    ])("%s keeps the message off the v-html path by default", (_name, call) => {
      const { result, popupPlugin } = mountWithPopup(() => usePopup());

      call(result);

      expect(typeof (popupPlugin.popups[0] as any).slots.default).not.toBe("string");
    });

    it("showConfirmation still passes the raw string when html is opted into", () => {
      const { result, popupPlugin } = mountWithPopup(() => usePopup());

      result.showConfirmation("Delete <b>Big</b>?", { html: true });

      expect((popupPlugin.popups[0] as any).slots.default).toBe("Delete <b>Big</b>?");
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

    it("close() marks the popup as closing and keeps it mounted for its leave transition", async () => {
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

      // Still mounted: unmounting here would tear the dialog out of the DOM before
      // it can run its own close sequence, which is what restores focus to the
      // opener (VCST-5632). The container unmounts it on `finalize`.
      expect(popupPlugin.popups.length).toBe(1);
      expect(popupPlugin.popups[0].closing).toBe(true);
    });

    it("close() unmounts the popup via the fallback timer when no transition reports back", async () => {
      vi.useFakeTimers();
      try {
        const { result, popupPlugin } = mountWithPopup(() =>
          usePopup({
            component: FakePopup as any,
            props: { title: "Test" },
            emits: { onConfirm: () => {}, onClose: () => {} },
          }),
        );

        result.open();
        await nextTick();
        result.close();
        expect(popupPlugin.popups.length).toBe(1);

        // A popup component that renders no transition never calls finalize, so the
        // safety timer has to remove it — otherwise it would stay mounted forever.
        vi.advanceTimersByTime(400);
        expect(popupPlugin.popups.length).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it("reopens the same popup instance as visible and keeps it mounted past the close fallback", async () => {
      vi.useFakeTimers();
      try {
        const { result, popupPlugin } = mountWithPopup(() =>
          usePopup({
            component: FakePopup as any,
            props: { title: "Test" },
            emits: { onConfirm: () => {}, onClose: () => {} },
          }),
        );

        await result.open();
        result.close();
        await result.open();

        vi.advanceTimersByTime(400);

        expect(popupPlugin.popups).toHaveLength(1);
        expect(popupPlugin.popups[0].closing).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it("ignores a stale transition finalize after the popup reopens", async () => {
      const trigger = document.createElement("button");
      document.body.appendChild(trigger);
      const focus = vi.spyOn(trigger, "focus");
      try {
        trigger.focus();
        focus.mockClear();

        const { result, popupPlugin } = mountWithPopup(() =>
          usePopup({
            component: FakePopup as any,
            props: { title: "Test" },
            emits: { onConfirm: () => {}, onClose: () => {} },
          }),
        );

        await result.open();
        const popup = popupPlugin.popups[0];
        result.close();
        await result.open();

        popup.finalize();
        await nextTick();

        expect(popupPlugin.popups).toHaveLength(1);
        expect(focus).not.toHaveBeenCalled();
      } finally {
        trigger.remove();
      }
    });

    it("does not let the first close fallback finish a later close early", async () => {
      vi.useFakeTimers();
      try {
        const { result, popupPlugin } = mountWithPopup(() =>
          usePopup({
            component: FakePopup as any,
            props: { title: "Test" },
            emits: { onConfirm: () => {}, onClose: () => {} },
          }),
        );

        await result.open();
        result.close();
        vi.advanceTimersByTime(200);

        await result.open();
        result.close();
        vi.advanceTimersByTime(200);
        expect(popupPlugin.popups).toHaveLength(1);

        vi.advanceTimersByTime(200);
        expect(popupPlugin.popups).toHaveLength(0);
      } finally {
        vi.useRealTimers();
      }
    });

    // The path the browser actually takes: the popup's leave transition ends and
    // the container calls finalize. It beats the fallback timer every time, so the
    // restore has to live here — the first attempt at VCST-5632 restored focus only
    // on the timer and therefore did nothing in a real app.
    it("returns focus to the opener when the popup finalizes after its transition", async () => {
      const trigger = document.createElement("button");
      document.body.appendChild(trigger);
      try {
        trigger.focus();

        const { result, popupPlugin } = mountWithPopup(() =>
          usePopup({
            component: FakePopup as any,
            props: { title: "Test" },
            emits: { onConfirm: () => {}, onClose: () => {} },
          }),
        );

        result.open();
        await nextTick();
        (document.activeElement as HTMLElement | null)?.blur?.();

        result.close();
        expect(popupPlugin.popups.length).toBe(1);

        // What PopupInstanceProvider emits on @after-leave.
        popupPlugin.popups[0].finalize();
        await nextTick();

        expect(popupPlugin.popups.length).toBe(0);
        expect(document.activeElement).toBe(trigger);
      } finally {
        trigger.remove();
      }
    });

    it("returns focus to the control that opened the popup", async () => {
      vi.useFakeTimers();
      const trigger = document.createElement("button");
      document.body.appendChild(trigger);
      try {
        trigger.focus();
        expect(document.activeElement).toBe(trigger);

        const { result } = mountWithPopup(() =>
          usePopup({
            component: FakePopup as any,
            props: { title: "Test" },
            emits: { onConfirm: () => {}, onClose: () => {} },
          }),
        );

        result.open();
        await nextTick();

        // The popup normally takes focus; emulate that so the restore path is the
        // one under test rather than "focus never moved".
        (document.activeElement as HTMLElement | null)?.blur?.();
        expect(document.activeElement === trigger).toBe(false);

        result.close();
        vi.advanceTimersByTime(400);
        await nextTick();

        expect(document.activeElement).toBe(trigger);
      } finally {
        vi.useRealTimers();
        trigger.remove();
      }
    });

    it("leaves focus alone when something else took it while the popup was open", async () => {
      vi.useFakeTimers();
      const trigger = document.createElement("button");
      const elsewhere = document.createElement("button");
      document.body.append(trigger, elsewhere);
      try {
        trigger.focus();

        const { result } = mountWithPopup(() =>
          usePopup({
            component: FakePopup as any,
            props: { title: "Test" },
            emits: { onConfirm: () => {}, onClose: () => {} },
          }),
        );

        result.open();
        await nextTick();
        elsewhere.focus();

        result.close();
        vi.advanceTimersByTime(400);
        await nextTick();

        // Focus was not lost, so it must not be yanked back to the opener.
        expect(document.activeElement).toBe(elsewhere);
      } finally {
        vi.useRealTimers();
        trigger.remove();
        elsewhere.remove();
      }
    });

    it("close() is idempotent while a popup is already closing", async () => {
      vi.useFakeTimers();
      try {
        const { result, popupPlugin } = mountWithPopup(() =>
          usePopup({
            component: FakePopup as any,
            props: { title: "Test" },
            emits: { onConfirm: () => {}, onClose: () => {} },
          }),
        );

        result.open();
        await nextTick();
        result.close();
        result.close();

        vi.advanceTimersByTime(400);
        expect(popupPlugin.popups.length).toBe(0);
      } finally {
        vi.useRealTimers();
      }
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
