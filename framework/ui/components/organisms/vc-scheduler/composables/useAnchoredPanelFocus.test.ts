import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { useAnchoredPanelFocus } from "./useAnchoredPanelFocus";

/** A panel that renders only while open, the way the anchored popovers do. */
const Panel = defineComponent({
  props: { open: { type: Boolean, default: false } },
  setup(props) {
    const panelRef = ref<HTMLElement | null>(null);

    useAnchoredPanelFocus(
      () => props.open,
      panelRef,
      () => panelRef.value?.querySelector<HTMLElement>("button"),
    );

    return () =>
      props.open ? h("div", { ref: panelRef, class: "panel" }, [h("button", { class: "first" }, "First")]) : null;
  },
});

describe("useAnchoredPanelFocus", () => {
  const mountPanel = (open = false) => mount(Panel, { props: { open }, attachTo: document.body });

  it("moves focus to the first target when the panel opens", async () => {
    const wrapper = mountPanel();
    try {
      await wrapper.setProps({ open: true });
      await nextTick();

      expect(document.activeElement).toBe(wrapper.find("button.first").element);
    } finally {
      wrapper.unmount();
    }
  });

  // Mounting already-open is how these panels usually appear, so the watcher
  // has to be immediate — without that, opening never moves focus at all.
  it("moves focus when the panel is mounted already open", async () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();
    const wrapper = mountPanel(true);
    try {
      await nextTick();

      expect(document.activeElement).toBe(wrapper.find("button.first").element);
    } finally {
      wrapper.unmount();
      opener.remove();
    }
  });

  it("returns focus to whatever held it before the panel opened", async () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();
    const wrapper = mountPanel();
    try {
      await wrapper.setProps({ open: true });
      await nextTick();

      await wrapper.setProps({ open: false });
      await nextTick();

      expect(document.activeElement).toBe(opener);
    } finally {
      wrapper.unmount();
      opener.remove();
    }
  });

  /**
   * The reason this is shared code. The check has to read `activeElement` while
   * the panel is still in the DOM — one tick later the node is gone, "is focus
   * inside?" is false for every close, and focus is yanked back even when the
   * user deliberately moved on.
   */
  it("leaves focus alone when the user moved it out of the panel first", async () => {
    const opener = document.createElement("button");
    const elsewhere = document.createElement("button");
    document.body.append(opener, elsewhere);
    opener.focus();
    const wrapper = mountPanel();
    try {
      await wrapper.setProps({ open: true });
      await nextTick();
      elsewhere.focus();

      await wrapper.setProps({ open: false });
      await nextTick();

      expect(document.activeElement).toBe(elsewhere);
    } finally {
      wrapper.unmount();
      opener.remove();
      elsewhere.remove();
    }
  });

  it("does not throw when the opener is gone by the time the panel closes", async () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();
    const wrapper = mountPanel();
    try {
      await wrapper.setProps({ open: true });
      await nextTick();
      opener.remove();

      await wrapper.setProps({ open: false });
      await nextTick();

      expect(document.activeElement === document.body).toBe(true);
    } finally {
      wrapper.unmount();
    }
  });
});
