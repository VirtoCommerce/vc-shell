import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";

// Mock tiptap and its extensions before importing the component
vi.mock("@tiptap/vue-3", () => ({
  useEditor: () => ({ value: null }),
  EditorContent: defineComponent({
    name: "EditorContent",
    props: ["editor"],
    setup() {
      return () => h("div", { class: "mock-editor-content" });
    },
  }),
}));

vi.mock("@tiptap/starter-kit", () => ({ StarterKit: {} }));
vi.mock("@tiptap/extension-underline", () => ({ Underline: {} }));
vi.mock("@tiptap/extension-table", () => ({ Table: { configure: () => ({}) } }));
vi.mock("@tiptap/extension-table-row", () => ({ TableRow: {} }));
vi.mock("@tiptap/extension-table-header", () => ({ TableHeader: {} }));
vi.mock("@tiptap/extension-table-cell", () => ({ TableCell: {} }));
vi.mock("@tiptap/extension-link", () => ({ Link: { configure: () => ({}) } }));
vi.mock("@tiptap/extension-image", () => ({ Image: {} }));
vi.mock("@tiptap/extension-placeholder", () => ({ Placeholder: { configure: () => ({}) } }));
vi.mock("@tiptap/extension-text-style", () => ({ TextStyle: {} }));
vi.mock("tiptap-markdown", () => ({ Markdown: { configure: () => ({}) } }));
vi.mock("@ui/components/molecules/vc-editor/_internal/extensions/font-size", () => ({ FontSize: {} }));
vi.mock("prettier/standalone", () => ({ format: vi.fn((v: string) => Promise.resolve(v)) }));
vi.mock("prettier/parser-html", () => ({}));
vi.mock("dompurify", () => ({ default: { sanitize: (html: string) => html } }));

import VcEditor from "@ui/components/molecules/vc-editor/vc-editor.vue";

describe("VcEditor", () => {
  const mountComponent = (props: Record<string, unknown> = {}) =>
    mount(VcEditor as any, {
      props: { modelValue: "", ...props },
      global: {
        stubs: {
          VcLabel: true,
          VcHint: true,
          VcIcon: true,
          VcEditorToolbar: true,
          VcEditorButton: true,
          EditorContent: true,
        },
      },
    });

  it("renders correctly", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-editor").exists()).toBe(true);
  });

  it("renders label when provided", () => {
    const wrapper = mountComponent({ label: "Description" });
    expect(wrapper.findComponent({ name: "VcLabel" }).exists()).toBe(true);
  });

  it("does not render label when not provided", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-editor__label").exists()).toBe(false);
  });

  it("applies disabled class when disabled", () => {
    const wrapper = mountComponent({ disabled: true });
    expect(wrapper.find(".vc-editor--disabled").exists()).toBe(true);
  });

  it("applies error class when errorMessage is provided", () => {
    const wrapper = mountComponent({ errorMessage: "Required field" });
    expect(wrapper.find(".vc-editor--error").exists()).toBe(true);
  });

  it("sets aria-label from label prop", () => {
    const wrapper = mountComponent({ label: "Notes" });
    expect(wrapper.find(".vc-editor").attributes("aria-label")).toBe("Notes");
  });

  it("sets aria-invalid when errorMessage exists", () => {
    const wrapper = mountComponent({ errorMessage: "Error" });
    expect(wrapper.find(".vc-editor").attributes("aria-invalid")).toBe("true");
  });

  it("sets aria-disabled when disabled", () => {
    const wrapper = mountComponent({ disabled: true });
    expect(wrapper.find(".vc-editor").attributes("aria-disabled")).toBe("true");
  });

  it("renders hidden file input for image upload", () => {
    const wrapper = mountComponent();
    const input = wrapper.find('input[type="file"]');
    expect(input.exists()).toBe(true);
    expect(input.attributes("accept")).toBe("image/*");
    expect(input.attributes("hidden")).toBeDefined();
  });
});
