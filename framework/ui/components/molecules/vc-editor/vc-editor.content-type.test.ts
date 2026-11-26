import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";

// Captures the options VcEditor gives TipTap, so a test can play an edit through onUpdate
const editorOptions = vi.hoisted(() => ({ current: undefined as undefined | Record<string, any> }));
vi.mock("@tiptap/vue-3", () => ({
  useEditor: (options: Record<string, any>) => {
    editorOptions.current = options;
    return ref(null);
  },
  EditorContent: defineComponent({ name: "EditorContent", props: ["editor"], setup: () => () => h("div") }),
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
vi.mock("js-beautify", () => ({ default: { html: (v: string) => v } }));
vi.mock("dompurify", () => ({ default: { sanitize: (html: string) => html } }));

import VcEditor from "@ui/components/molecules/vc-editor/vc-editor.vue";

const typed = {
  getHTML: () => "<p>New <strong>text</strong></p>",
  storage: { markdown: { getMarkdown: () => "New **text**" } },
};

function editEmpty(props: Record<string, unknown> = {}) {
  const wrapper = mount(VcEditor as any, {
    props: { modelValue: "", ...props },
    global: { stubs: { VcLabel: true, VcHint: true, VcIcon: true, VcEditorToolbar: true, EditorContent: true } },
  });
  editorOptions.current!.onUpdate({ editor: typed });
  return wrapper.emitted("update:modelValue")?.[0]?.[0];
}

describe("VcEditor content type", () => {
  it("saves HTML for a field declared as HTML, even when it starts empty", () => {
    expect(editEmpty({ contentType: "html" })).toBe("<p>New <strong>text</strong></p>");
  });

  it("saves Markdown for a field declared as Markdown", () => {
    expect(editEmpty({ contentType: "markdown" })).toBe("New **text**");
  });

  it("keeps guessing when no type is declared: an empty field is taken as Markdown", () => {
    expect(editEmpty()).toBe("New **text**");
  });
});
