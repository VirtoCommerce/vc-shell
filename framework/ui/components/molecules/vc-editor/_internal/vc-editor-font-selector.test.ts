import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import VcEditorFontSelector from "./vc-editor-font-selector.vue";

function createMockEditor(fontSize: string | null = null) {
  const chainObj = {
    focus: vi.fn().mockReturnThis(),
    setFontSize: vi.fn().mockReturnThis(),
    run: vi.fn(),
  };
  return {
    getAttributes: vi.fn(() => (fontSize ? { fontSize } : {})),
    chain: vi.fn(() => chainObj),
    __chain: chainObj,
  } as any;
}

describe("VcEditorFontSelector", () => {
  it("renders the font selector button", () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorFontSelector, {
      props: { editor, disabled: false },
    });
    expect(wrapper.find(".vc-editor-font-selector__button").exists()).toBe(true);
  });

  it("shows current font size when set", () => {
    const editor = createMockEditor("16px");
    const wrapper = mount(VcEditorFontSelector, {
      props: { editor, disabled: false },
    });
    expect(wrapper.find(".vc-editor-font-selector__size-value").text()).toBe("16px");
  });

  it("does not show size value when no font size is set", () => {
    const editor = createMockEditor(null);
    const wrapper = mount(VcEditorFontSelector, {
      props: { editor, disabled: false },
    });
    expect(wrapper.find(".vc-editor-font-selector__size-value").exists()).toBe(false);
  });

  it("toggles dropdown visibility on button click", async () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorFontSelector, {
      props: { editor, disabled: false },
    });
    expect(wrapper.find(".vc-editor-font-selector__menu").exists()).toBe(false);
    await wrapper.find(".vc-editor-font-selector__button").trigger("click");
    expect(wrapper.find(".vc-editor-font-selector__menu").exists()).toBe(true);
    await wrapper.find(".vc-editor-font-selector__button").trigger("click");
    expect(wrapper.find(".vc-editor-font-selector__menu").exists()).toBe(false);
  });

  it("renders all preset font sizes", async () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorFontSelector, {
      props: { editor, disabled: false },
    });
    await wrapper.find(".vc-editor-font-selector__button").trigger("click");
    const options = wrapper.findAll(".vc-editor-font-selector__option");
    // 13 preset sizes: 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72
    expect(options).toHaveLength(13);
  });

  it("calls setFontSize on editor when a size is selected", async () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorFontSelector, {
      props: { editor, disabled: false },
    });
    await wrapper.find(".vc-editor-font-selector__button").trigger("click");
    const options = wrapper.findAll(".vc-editor-font-selector__option");
    // Click the 16px option (index 4)
    await options[4].trigger("click");
    expect(editor.__chain.setFontSize).toHaveBeenCalledWith("16px");
    expect(editor.__chain.run).toHaveBeenCalled();
  });

  it("closes dropdown after selecting a size", async () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorFontSelector, {
      props: { editor, disabled: false },
    });
    await wrapper.find(".vc-editor-font-selector__button").trigger("click");
    expect(wrapper.find(".vc-editor-font-selector__menu").exists()).toBe(true);
    await wrapper.findAll(".vc-editor-font-selector__option")[0].trigger("click");
    expect(wrapper.find(".vc-editor-font-selector__menu").exists()).toBe(false);
  });

  it("disables button when disabled prop is true", () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorFontSelector, {
      props: { editor, disabled: true },
    });
    expect((wrapper.find(".vc-editor-font-selector__button").element as HTMLButtonElement).disabled).toBe(true);
  });

  it("highlights the active font size option", async () => {
    const editor = createMockEditor("14px");
    const wrapper = mount(VcEditorFontSelector, {
      props: { editor, disabled: false },
    });
    await wrapper.find(".vc-editor-font-selector__button").trigger("click");
    const options = wrapper.findAll(".vc-editor-font-selector__option");
    // 14px is index 3
    expect(options[3].classes()).toContain("vc-editor-font-selector__option--active");
    expect(options[0].classes()).not.toContain("vc-editor-font-selector__option--active");
  });

  it("has a custom size input", async () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorFontSelector, {
      props: { editor, disabled: false },
    });
    await wrapper.find(".vc-editor-font-selector__button").trigger("click");
    expect(wrapper.find(".vc-editor-font-selector__input").exists()).toBe(true);
  });
});
