import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VcEditorButton from "./vc-editor-button.vue";

describe("VcEditorButton", () => {
  it("renders a button with the given icon", () => {
    const wrapper = mount(VcEditorButton, {
      props: { icon: "lucide-bold" },
    });
    expect(wrapper.find("button").exists()).toBe(true);
    expect(wrapper.find("button").classes()).toContain("vc-editor-button");
  });

  it("emits action when clicked", async () => {
    const wrapper = mount(VcEditorButton, {
      props: { icon: "lucide-bold" },
    });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("action")).toBeTruthy();
    expect(wrapper.emitted("action")).toHaveLength(1);
  });

  it("applies active class when active prop is true", () => {
    const wrapper = mount(VcEditorButton, {
      props: { icon: "lucide-bold", active: true },
    });
    expect(wrapper.find("button").classes()).toContain("vc-editor-button--active");
  });

  it("does not apply active class when active is false", () => {
    const wrapper = mount(VcEditorButton, {
      props: { icon: "lucide-bold", active: false },
    });
    expect(wrapper.find("button").classes()).not.toContain("vc-editor-button--active");
  });

  it("disables the button when disabled prop is true", () => {
    const wrapper = mount(VcEditorButton, {
      props: { icon: "lucide-bold", disabled: true },
    });
    expect((wrapper.find("button").element as HTMLButtonElement).disabled).toBe(true);
  });

  it("sets aria-pressed based on active prop", () => {
    const wrapper = mount(VcEditorButton, {
      props: { icon: "lucide-bold", active: true },
    });
    expect(wrapper.find("button").attributes("aria-pressed")).toBe("true");
  });

  it("sets aria-pressed to 'false' when active is not provided (defaults to undefined, but != null is true for false)", () => {
    // When active prop is not passed, it defaults to undefined.
    // The template uses `active != null ? active : undefined`.
    // undefined != null is false, so aria-pressed should be undefined.
    // However, Vue resolves the prop as `false` (boolean cast), so active != null => true => aria-pressed="false".
    const wrapper = mount(VcEditorButton, {
      props: { icon: "lucide-bold" },
    });
    expect(wrapper.find("button").attributes("aria-pressed")).toBe("false");
  });

  it("sets aria-label when provided", () => {
    const wrapper = mount(VcEditorButton, {
      props: { icon: "lucide-bold", ariaLabel: "Toggle bold" },
    });
    expect(wrapper.find("button").attributes("aria-label")).toBe("Toggle bold");
  });

  it("button type is 'button'", () => {
    const wrapper = mount(VcEditorButton, {
      props: { icon: "lucide-bold" },
    });
    expect(wrapper.find("button").attributes("type")).toBe("button");
  });
});
