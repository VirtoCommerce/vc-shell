import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VcEditorCustomButton from "./vc-editor-custom-button.vue";
import type { CustomToolbarButton, CustomToolbarDropdown } from "./toolbar-types";

// Create a mock editor
function createMockEditor() {
  return {
    isActive: vi.fn(() => false),
    can: vi.fn(() => ({ toggleBold: vi.fn(() => true) })),
    chain: vi.fn(() => ({
      focus: vi.fn().mockReturnThis(),
      run: vi.fn(),
    })),
    getAttributes: vi.fn(() => ({})),
  } as any;
}

describe("VcEditorCustomButton", () => {
  it("renders VcEditorButton for a button-type custom item", () => {
    const editor = createMockEditor();
    const button: CustomToolbarButton = {
      id: "custom-bold",
      label: "Bold",
      icon: "lucide-bold",
      action: vi.fn(),
    };
    const wrapper = mount(VcEditorCustomButton, {
      props: { editor, customButton: button, disabled: false },
    });
    // Should render the VcEditorButton (not a select)
    expect(wrapper.find("button").exists()).toBe(true);
    expect(wrapper.find("select").exists()).toBe(false);
  });

  it("calls action on the editor when button is clicked", async () => {
    const editor = createMockEditor();
    const action = vi.fn();
    const button: CustomToolbarButton = {
      id: "my-btn",
      label: "My Button",
      icon: "lucide-star",
      action,
    };
    const wrapper = mount(VcEditorCustomButton, {
      props: { editor, customButton: button, disabled: false },
    });
    await wrapper.find("button").trigger("click");
    expect(action).toHaveBeenCalledWith(editor);
  });

  it("renders a select dropdown for dropdown-type custom item", () => {
    const editor = createMockEditor();
    const dropdown: CustomToolbarDropdown = {
      id: "font-dd",
      label: "Font",
      options: [
        { value: "serif", label: "Serif", action: vi.fn() },
        { value: "sans", label: "Sans", action: vi.fn() },
      ],
    };
    const wrapper = mount(VcEditorCustomButton, {
      props: { editor, customButton: dropdown, disabled: false },
    });
    expect(wrapper.find("select").exists()).toBe(true);
    const options = wrapper.findAll("option");
    expect(options).toHaveLength(2);
    expect(options[0].text()).toBe("Serif");
    expect(options[1].text()).toBe("Sans");
  });

  it("calls option action when dropdown value changes", async () => {
    const editor = createMockEditor();
    const action = vi.fn();
    const dropdown: CustomToolbarDropdown = {
      id: "dd",
      label: "DD",
      options: [
        { value: "a", label: "A", action: vi.fn() },
        { value: "b", label: "B", action },
      ],
    };
    const wrapper = mount(VcEditorCustomButton, {
      props: { editor, customButton: dropdown, disabled: false },
    });
    const select = wrapper.find("select");
    await select.setValue("b");
    expect(action).toHaveBeenCalledWith(editor, "b");
  });

  it("respects isActive callback for button active state", () => {
    const editor = createMockEditor();
    const button: CustomToolbarButton = {
      id: "active-btn",
      label: "Active",
      icon: "lucide-check",
      action: vi.fn(),
      isActive: () => true,
    };
    const wrapper = mount(VcEditorCustomButton, {
      props: { editor, customButton: button, disabled: false },
    });
    expect(wrapper.find("button").classes()).toContain("vc-editor-button--active");
  });

  it("respects isDisabled callback", () => {
    const editor = createMockEditor();
    const button: CustomToolbarButton = {
      id: "dis-btn",
      label: "Dis",
      icon: "lucide-x",
      action: vi.fn(),
      isDisabled: () => true,
    };
    const wrapper = mount(VcEditorCustomButton, {
      props: { editor, customButton: button, disabled: false },
    });
    expect((wrapper.find("button").element as HTMLButtonElement).disabled).toBe(true);
  });

  it("combines disabled prop and isDisabled callback", () => {
    const editor = createMockEditor();
    const button: CustomToolbarButton = {
      id: "btn",
      label: "B",
      icon: "lucide-x",
      action: vi.fn(),
      isDisabled: () => false,
    };
    const wrapper = mount(VcEditorCustomButton, {
      props: { editor, customButton: button, disabled: true },
    });
    expect((wrapper.find("button").element as HTMLButtonElement).disabled).toBe(true);
  });
});
