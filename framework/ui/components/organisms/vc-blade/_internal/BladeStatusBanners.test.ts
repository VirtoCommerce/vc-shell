import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { computed, ref } from "vue";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import type { BladeDescriptor } from "@core/blade-navigation/types";

// Mock vue-i18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useCollapsible
vi.mock("@ui/composables/useCollapsible", () => ({
  useCollapsible: () => ({
    contentRef: ref(null),
    isExpanded: ref(false),
    wrapperStyle: ref({}),
    toggle: vi.fn(),
  }),
}));

// Mock useBladeError
vi.mock("@ui/components/organisms/vc-blade/_internal/composables/useBladeError", () => ({
  useBladeError: (blade: any) => {
    const error = blade.value.error;
    return {
      hasError: computed(() => Boolean(error)),
      shortErrorMessage: computed(() => (error instanceof Error ? error.message : String(error || ""))),
      errorDetails: computed(() => (error instanceof Error ? error.stack || String(error) : String(error || ""))),
      copyError: vi.fn().mockResolvedValue(true),
    };
  },
}));

import BladeStatusBanners from "./BladeStatusBanners.vue";

function factory(props: Record<string, unknown> = {}, bladeError: unknown = null) {
  return mount(BladeStatusBanners, {
    props,
    global: {
      provide: {
        [BladeDescriptorKey as symbol]: computed<BladeDescriptor>(() => ({
          id: "test-blade",
          name: "TestBlade",
          visible: true,
          error: bladeError as Error | undefined,
        })),
      },
      stubs: {
        VcIcon: {
          name: "VcIcon",
          props: ["icon", "size", "class"],
          template: '<i class="vc-icon-stub" />',
        },
      },
      mocks: {
        $t: (key: string) => key,
      },
    },
  });
}

describe("BladeStatusBanners", () => {
  it("renders nothing when no error and not modified", () => {
    const wrapper = factory();
    expect(wrapper.find(".vc-blade-status-banners__error").exists()).toBe(false);
    expect(wrapper.find(".vc-blade-status-banners__unsaved").exists()).toBe(false);
  });

  it("renders unsaved changes banner when modified=true", () => {
    const wrapper = factory({ modified: true });
    expect(wrapper.find(".vc-blade-status-banners__unsaved").exists()).toBe(true);
  });

  it("unsaved banner has role=status", () => {
    const wrapper = factory({ modified: true });
    expect(wrapper.find(".vc-blade-status-banners__unsaved").attributes("role")).toBe("status");
  });

  it("hides unsaved changes banner when modified=false", () => {
    const wrapper = factory({ modified: false });
    expect(wrapper.find(".vc-blade-status-banners__unsaved").exists()).toBe(false);
  });

  it("renders error banner when blade has an error", () => {
    const wrapper = factory({}, new Error("Something went wrong"));
    expect(wrapper.find(".vc-blade-status-banners__error").exists()).toBe(true);
  });

  it("error banner has role=alert", () => {
    const wrapper = factory({}, new Error("fail"));
    expect(wrapper.find(".vc-blade-status-banners__error").attributes("role")).toBe("alert");
  });

  it("shows error message text in the header", () => {
    const wrapper = factory({}, new Error("Network failure"));
    expect(wrapper.find(".vc-blade-status-banners__error-text").text()).toBe("Network failure");
  });

  it("hides error banner when blade has no error", () => {
    const wrapper = factory({});
    expect(wrapper.find(".vc-blade-status-banners__error").exists()).toBe(false);
  });

  it("renders both banners simultaneously when both error and modified", () => {
    const wrapper = factory({ modified: true }, new Error("Save failed"));
    expect(wrapper.find(".vc-blade-status-banners__error").exists()).toBe(true);
    expect(wrapper.find(".vc-blade-status-banners__unsaved").exists()).toBe(true);
  });

  it("renders error details section", () => {
    const wrapper = factory({}, new Error("fail"));
    expect(wrapper.find(".vc-blade-status-banners__error-details-wrapper").exists()).toBe(true);
  });

  it("renders copy button", () => {
    const wrapper = factory({}, new Error("fail"));
    expect(wrapper.find(".vc-blade-status-banners__error-copy").exists()).toBe(true);
  });
});
