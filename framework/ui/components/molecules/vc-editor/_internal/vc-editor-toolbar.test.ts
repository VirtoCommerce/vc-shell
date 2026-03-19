import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VcEditorToolbar from "./vc-editor-toolbar.vue";

function createMockEditor(activeItems: string[] = []) {
  const chainObj = {
    focus: vi.fn().mockReturnThis(),
    toggleBold: vi.fn().mockReturnThis(),
    toggleItalic: vi.fn().mockReturnThis(),
    toggleUnderline: vi.fn().mockReturnThis(),
    toggleStrike: vi.fn().mockReturnThis(),
    toggleHeading: vi.fn().mockReturnThis(),
    toggleBulletList: vi.fn().mockReturnThis(),
    toggleOrderedList: vi.fn().mockReturnThis(),
    toggleBlockquote: vi.fn().mockReturnThis(),
    extendMarkRange: vi.fn().mockReturnThis(),
    setLink: vi.fn().mockReturnThis(),
    unsetLink: vi.fn().mockReturnThis(),
    insertTable: vi.fn().mockReturnThis(),
    deleteTable: vi.fn().mockReturnThis(),
    addColumnBefore: vi.fn().mockReturnThis(),
    addColumnAfter: vi.fn().mockReturnThis(),
    addRowBefore: vi.fn().mockReturnThis(),
    addRowAfter: vi.fn().mockReturnThis(),
    deleteColumn: vi.fn().mockReturnThis(),
    deleteRow: vi.fn().mockReturnThis(),
    run: vi.fn(),
  };
  return {
    isActive: vi.fn((name: string, opts?: any) => {
      if (opts?.level) return activeItems.includes(`${name}-${opts.level}`);
      return activeItems.includes(name);
    }),
    can: vi.fn(() => ({
      toggleBold: vi.fn(() => true),
      toggleItalic: vi.fn(() => true),
      toggleUnderline: vi.fn(() => true),
      toggleStrike: vi.fn(() => true),
      toggleHeading: vi.fn(() => true),
      toggleBulletList: vi.fn(() => true),
      toggleOrderedList: vi.fn(() => true),
      toggleBlockquote: vi.fn(() => true),
    })),
    chain: vi.fn(() => chainObj),
    getAttributes: vi.fn(() => ({})),
    __chain: chainObj,
  } as any;
}

describe("VcEditorToolbar", () => {
  it("renders toolbar with role='toolbar'", () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorToolbar, {
      props: {
        editor,
        disabled: false,
        contentType: "html",
        toolbar: ["bold"],
        customButtons: [],
      },
    });
    expect(wrapper.find("[role='toolbar']").exists()).toBe(true);
  });

  it("renders bold button when toolbar includes 'bold'", () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorToolbar, {
      props: {
        editor,
        disabled: false,
        contentType: "html",
        toolbar: ["bold"],
        customButtons: [],
      },
    });
    expect(wrapper.find("[aria-label='Bold']").exists()).toBe(true);
  });

  it("renders separator element", () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorToolbar, {
      props: {
        editor,
        disabled: false,
        contentType: "html",
        toolbar: ["bold", "separator", "italic"],
        customButtons: [],
      },
    });
    expect(wrapper.findAll(".vc-editor-toolbar__separator").length).toBeGreaterThanOrEqual(1);
  });

  it("renders multiple toolbar items", () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorToolbar, {
      props: {
        editor,
        disabled: false,
        contentType: "html",
        toolbar: ["bold", "italic", "underline", "strikethrough"],
        customButtons: [],
      },
    });
    expect(wrapper.find("[aria-label='Bold']").exists()).toBe(true);
    expect(wrapper.find("[aria-label='Italic']").exists()).toBe(true);
    expect(wrapper.find("[aria-label='Underline']").exists()).toBe(true);
    expect(wrapper.find("[aria-label='Strikethrough']").exists()).toBe(true);
  });

  it("renders heading buttons", () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorToolbar, {
      props: {
        editor,
        disabled: false,
        contentType: "html",
        toolbar: ["heading1", "heading2", "heading3"],
        customButtons: [],
      },
    });
    expect(wrapper.find("[aria-label='Heading 1']").exists()).toBe(true);
    expect(wrapper.find("[aria-label='Heading 2']").exists()).toBe(true);
    expect(wrapper.find("[aria-label='Heading 3']").exists()).toBe(true);
  });

  it("renders list and blockquote buttons", () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorToolbar, {
      props: {
        editor,
        disabled: false,
        contentType: "html",
        toolbar: ["bulletList", "orderedList", "blockquote"],
        customButtons: [],
      },
    });
    expect(wrapper.find("[aria-label='Bullet list']").exists()).toBe(true);
    expect(wrapper.find("[aria-label='Numbered list']").exists()).toBe(true);
    expect(wrapper.find("[aria-label='Blockquote']").exists()).toBe(true);
  });

  it("renders link and image buttons", () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorToolbar, {
      props: {
        editor,
        disabled: false,
        contentType: "html",
        toolbar: ["link", "image"],
        customButtons: [],
      },
    });
    expect(wrapper.find("[aria-label='Insert link']").exists()).toBe(true);
    expect(wrapper.find("[aria-label='Insert image']").exists()).toBe(true);
  });

  it("renders table button", () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorToolbar, {
      props: {
        editor,
        disabled: false,
        contentType: "html",
        toolbar: ["table"],
        customButtons: [],
      },
    });
    expect(wrapper.find("[aria-label='Insert table']").exists()).toBe(true);
  });

  it("shows table controls when table is active", () => {
    const editor = createMockEditor(["table"]);
    const wrapper = mount(VcEditorToolbar, {
      props: {
        editor,
        disabled: false,
        contentType: "html",
        toolbar: ["table"],
        customButtons: [],
      },
    });
    expect(wrapper.find("[aria-label='Delete table']").exists()).toBe(true);
    expect(wrapper.find("[aria-label='Add column before']").exists()).toBe(true);
    expect(wrapper.find("[aria-label='Add row after']").exists()).toBe(true);
  });

  it("does not show table controls when table is not active", () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorToolbar, {
      props: {
        editor,
        disabled: false,
        contentType: "html",
        toolbar: ["table"],
        customButtons: [],
      },
    });
    expect(wrapper.find("[aria-label='Delete table']").exists()).toBe(false);
  });

  it("emits uploadImage when image button is clicked", async () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorToolbar, {
      props: {
        editor,
        disabled: false,
        contentType: "html",
        toolbar: ["image"],
        customButtons: [],
      },
    });
    await wrapper.find("[aria-label='Insert image']").trigger("click");
    expect(wrapper.emitted("uploadImage")).toBeTruthy();
  });

  it("renders with empty toolbar gracefully", () => {
    const editor = createMockEditor();
    const wrapper = mount(VcEditorToolbar, {
      props: {
        editor,
        disabled: false,
        contentType: "html",
        toolbar: [],
        customButtons: [],
      },
    });
    expect(wrapper.find(".vc-editor-toolbar").exists()).toBe(true);
  });
});
