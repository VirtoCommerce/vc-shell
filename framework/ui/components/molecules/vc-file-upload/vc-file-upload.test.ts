import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, computed } from "vue";
import VcFileUpload from "@ui/components/molecules/vc-file-upload/vc-file-upload.vue";

// Mock vee-validate
vi.mock("vee-validate", () => ({
  useField: () => ({
    errorMessage: ref(""),
    handleChange: vi.fn(),
    validate: vi.fn().mockResolvedValue({ valid: true }),
  }),
}));

// Mock useFormField
vi.mock("@ui/composables/useFormField", () => ({
  useFormField: (props: any) => ({
    fieldId: ref("file-upload-1"),
    errorId: ref("file-upload-1-error"),
    resolvedDisabled: computed(() => props.disabled ?? false),
    resolvedName: ref(props.name || "Gallery"),
    ariaRequired: ref(undefined),
    groupContext: undefined,
  }),
}));

// Mock vue-i18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe("VcFileUpload", () => {
  const mountComponent = (props: Record<string, unknown> = {}) =>
    mount(VcFileUpload as any, {
      props,
      global: {
        stubs: {
          VcIcon: true,
          VcLink: {
            template: '<a class="stub-link" @click="$emit(\'click\')"><slot /></a>',
          },
          VcHint: true,
        },
        directives: {
          loading: () => {},
        },
      },
    });

  it("renders correctly", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-file-upload__container").exists()).toBe(true);
    expect(wrapper.find(".vc-file-upload__drop-zone").exists()).toBe(true);
  });

  it("renders icon", () => {
    const wrapper = mountComponent();
    expect(wrapper.findComponent({ name: "VcIcon" }).exists()).toBe(true);
  });

  it("renders file input hidden", () => {
    const wrapper = mountComponent();
    const input = wrapper.find('input[type="file"]');
    expect(input.exists()).toBe(true);
    expect(input.attributes("hidden")).toBeDefined();
  });

  it("applies default accept attribute", () => {
    const wrapper = mountComponent();
    const input = wrapper.find('input[type="file"]');
    expect(input.attributes("accept")).toBe(".jpg, .png, .jpeg, .webp, .heic, .svg");
  });

  it("applies custom accept attribute", () => {
    const wrapper = mountComponent({ accept: ".pdf,.doc" });
    const input = wrapper.find('input[type="file"]');
    expect(input.attributes("accept")).toBe(".pdf,.doc");
  });

  it("supports multiple file upload", () => {
    const wrapper = mountComponent({ multiple: true });
    const input = wrapper.find('input[type="file"]');
    expect(input.attributes("multiple")).toBeDefined();
  });

  it("applies disabled state", () => {
    const wrapper = mountComponent({ disabled: true });
    expect(wrapper.find(".vc-file-upload__drop-zone--disabled").exists()).toBe(true);
  });

  it("has role button on drop zone", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-file-upload__drop-zone").attributes("role")).toBe("button");
  });

  it("sets tabindex to -1 when disabled", () => {
    const wrapper = mountComponent({ disabled: true });
    expect(wrapper.find(".vc-file-upload__drop-zone").attributes("tabindex")).toBe("-1");
  });

  it("sets tabindex to 0 when enabled", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-file-upload__drop-zone").attributes("tabindex")).toBe("0");
  });
});
