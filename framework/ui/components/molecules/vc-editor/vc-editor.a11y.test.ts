import { describe, expect, it, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";

/**
 * Kept apart from `vc-editor.test.ts` because these need a live editor stub —
 * that suite mocks `useEditor` to `{ value: null }`, which is enough for the
 * chrome around the editor but leaves nothing to carry ARIA attributes.
 *
 * Tiptap takes `editorProps.attributes` once at creation, so what the component
 * hands it, and what it pushes back through `setOptions`, is the whole contract.
 */

let creationOptions: Record<string, any> | undefined;
const setOptions = vi.fn();

/**
 * A live-enough editor: the toolbar renders as soon as `editor.value` is truthy
 * and calls into it freely (`isActive`, `can`, chained commands), so unknown
 * members answer with a chainable no-op rather than being enumerated here.
 */
function createEditorStub() {
  const base: Record<string, any> = {
    setOptions,
    setEditable: vi.fn(),
    destroy: vi.fn(),
    isActive: () => false,
    getAttributes: () => ({}),
    isEmpty: true,
    storage: {},
  };

  const chainable: any = new Proxy(() => chainable, {
    get: (_t, prop) => (prop === "run" ? () => true : chainable),
    apply: () => chainable,
  });

  return new Proxy(base, {
    get: (target, prop) => (prop in target ? target[prop as string] : () => chainable),
  });
}

vi.mock("@tiptap/vue-3", async () => {
  // A real ref, so the template unwraps it before handing the editor to the
  // toolbar — a plain `{ value }` reaches children as the wrapper, not the editor.
  const { shallowRef } = await import("vue");
  return {
    useEditor: (options: Record<string, any>) => {
      creationOptions = options;
      return shallowRef(createEditorStub());
    },
    EditorContent: defineComponent({
      name: "EditorContent",
      props: ["editor"],
      setup: () => () => h("div", { class: "mock-editor-content" }),
    }),
  };
});

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
import { InputGroupContextKey } from "@ui/components/molecules/vc-input-group/context";

function mountEditor(props: Record<string, unknown> = {}) {
  return mount(VcEditor as any, {
    props: { modelValue: "", ...props },
    global: { stubs: { VcLabel: true, VcIcon: true, VcTooltip: true, VcButton: true } },
  });
}

/** The attributes tiptap is holding: creation options, or the last setOptions push. */
function currentAttributes(): Record<string, string> {
  const pushed = setOptions.mock.calls.at(-1)?.[0]?.editorProps?.attributes;
  return pushed ?? creationOptions?.editorProps?.attributes ?? {};
}

beforeEach(() => {
  creationOptions = undefined;
  setOptions.mockClear();
});

describe("VcEditor accessibility", () => {
  it("names the editable region as a multiline textbox", () => {
    mountEditor({ label: "Description" });

    expect(currentAttributes()).toMatchObject({
      role: "textbox",
      "aria-multiline": "true",
      "aria-label": "Description",
    });
  });

  // The defect: the message was rendered but nothing connected it to the control,
  // so a screen reader user was told the field was invalid and never told why.
  it("points the editable region at the element holding the error message", async () => {
    const wrapper = mountEditor({ errorMessage: "Description is required" });
    await nextTick();

    const describedBy = currentAttributes()["aria-describedby"];
    expect(describedBy).toBeTruthy();

    const target = wrapper.find(`#${describedBy}`);
    expect(target.exists()).toBe(true);
    expect(target.text()).toContain("Description is required");
  });

  it("describes nothing while the field is valid", () => {
    mountEditor({ label: "Description" });

    expect(currentAttributes()["aria-describedby"]).toBeUndefined();
  });

  it("marks the editable region invalid, not just the wrapper", async () => {
    mountEditor({ errorMessage: "Description is required" });
    await nextTick();

    expect(currentAttributes()["aria-invalid"]).toBe("true");
  });

  // An error arriving after mount has to reach the node tiptap already rendered.
  it("pushes the reference through when the error appears later", async () => {
    const wrapper = mountEditor({ label: "Description" });
    expect(currentAttributes()["aria-describedby"]).toBeUndefined();

    await wrapper.setProps({ errorMessage: "Description is required" });
    await nextTick();

    expect(setOptions).toHaveBeenCalled();
    expect(currentAttributes()["aria-describedby"]).toBeTruthy();
  });

  it("drops the reference again when the error clears", async () => {
    const wrapper = mountEditor({ errorMessage: "Description is required" });
    await nextTick();
    expect(currentAttributes()["aria-describedby"]).toBeTruthy();

    await wrapper.setProps({ errorMessage: undefined });
    await nextTick();

    expect(currentAttributes()["aria-describedby"]).toBeUndefined();
  });

  // The old local `!!errorMessage` check could not see group-level invalid state,
  // so an editor inside an invalid group looked fine to assistive technology.
  it("takes invalid state from the surrounding input group", () => {
    mount(VcEditor as any, {
      props: { modelValue: "" },
      global: {
        stubs: { VcLabel: true, VcIcon: true, VcTooltip: true, VcButton: true },
        provide: {
          [InputGroupContextKey as symbol]: {
            name: ref(undefined),
            disabled: ref(false),
            invalid: ref(true),
            describedBy: ref(undefined),
          },
        },
      },
    });

    expect(currentAttributes()["aria-invalid"]).toBe("true");
  });

  it("adopts the ids the group already describes its fields by", () => {
    mount(VcEditor as any, {
      props: { modelValue: "" },
      global: {
        stubs: { VcLabel: true, VcIcon: true, VcTooltip: true, VcButton: true },
        provide: {
          [InputGroupContextKey as symbol]: {
            name: ref(undefined),
            disabled: ref(false),
            invalid: ref(false),
            describedBy: ref("group-help"),
          },
        },
      },
    });

    expect(currentAttributes()["aria-describedby"]).toContain("group-help");
  });
});
