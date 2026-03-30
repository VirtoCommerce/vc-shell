import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { computed, ref } from "vue";
import { BladeDescriptorKey, BladeBannersKey, BladeStackKey } from "@core/blade-navigation/types";
import type { BladeDescriptor, IBladeBanner, IBladeStack } from "@core/blade-navigation/types";

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
    const error = blade?.value?.error;
    return {
      hasError: computed(() => Boolean(error)),
      shortErrorMessage: computed(() => (error instanceof Error ? error.message : String(error || ""))),
      errorDetails: computed(() => (error instanceof Error ? error.stack || String(error) : String(error || ""))),
      copyError: vi.fn().mockResolvedValue(true),
    };
  },
}));

import BladeStatusBanners from "./BladeStatusBanners.vue";

const stubStack: Partial<IBladeStack> = {
  clearBladeError: vi.fn(),
};

function factory(props: Record<string, unknown> = {}, bladeError: unknown = null) {
  const banners = ref<IBladeBanner[]>([]);
  const wrapper = mount(BladeStatusBanners, {
    props,
    global: {
      provide: {
        [BladeDescriptorKey as symbol]: computed<BladeDescriptor>(() => ({
          id: "test-blade",
          name: "TestBlade",
          visible: true,
          error: bladeError as Error | undefined,
        })),
        [BladeBannersKey as symbol]: banners,
        [BladeStackKey as symbol]: stubStack,
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
  return { wrapper, banners };
}

describe("BladeStatusBanners", () => {
  it("renders nothing when no error and not modified", () => {
    const { wrapper } = factory();
    expect(wrapper.find(".vc-blade-status-banners__banner").exists()).toBe(false);
  });

  it("renders unsaved changes banner when modified=true", () => {
    const { wrapper } = factory({ modified: true });
    expect(wrapper.find(".vc-blade-status-banners__banner--warning").exists()).toBe(true);
  });

  it("unsaved banner has role=alert", () => {
    const { wrapper } = factory({ modified: true });
    expect(wrapper.find(".vc-blade-status-banners__banner--warning").attributes("role")).toBe("alert");
  });

  it("hides unsaved changes banner when modified=false", () => {
    const { wrapper } = factory({ modified: false });
    expect(wrapper.find(".vc-blade-status-banners__banner--warning").exists()).toBe(false);
  });

  it("renders error banner when blade has an error", () => {
    const { wrapper } = factory({}, new Error("Something went wrong"));
    expect(wrapper.find(".vc-blade-status-banners__banner--danger").exists()).toBe(true);
  });

  it("error banner has role=alert", () => {
    const { wrapper } = factory({}, new Error("fail"));
    expect(wrapper.find(".vc-blade-status-banners__banner--danger").attributes("role")).toBe("alert");
  });

  it("shows error message text in the header", () => {
    const { wrapper } = factory({}, new Error("Network failure"));
    expect(wrapper.find(".vc-blade-status-banners__text").text()).toBe("Network failure");
  });

  it("hides error banner when blade has no error", () => {
    const { wrapper } = factory({});
    expect(wrapper.find(".vc-blade-status-banners__banner--danger").exists()).toBe(false);
  });

  it("renders both banners simultaneously when both error and modified", () => {
    const { wrapper } = factory({ modified: true }, new Error("Save failed"));
    expect(wrapper.find(".vc-blade-status-banners__banner--danger").exists()).toBe(true);
    expect(wrapper.find(".vc-blade-status-banners__banner--warning").exists()).toBe(true);
  });

  it("renders error details section", () => {
    const { wrapper } = factory({}, new Error("fail"));
    expect(wrapper.find(".vc-blade-status-banners__error-details-wrapper").exists()).toBe(true);
  });

  it("renders copy button", () => {
    const { wrapper } = factory({}, new Error("fail"));
    expect(wrapper.find(".vc-blade-status-banners__error-copy").exists()).toBe(true);
  });

  it("danger banners render before warning banners", () => {
    const { wrapper } = factory({ modified: true }, new Error("Error"));
    const banners = wrapper.findAll(".vc-blade-status-banners__banner");
    expect(banners).toHaveLength(2);
    expect(banners[0].classes()).toContain("vc-blade-status-banners__banner--danger");
    expect(banners[1].classes()).toContain("vc-blade-status-banners__banner--warning");
  });

  it("renders custom banners from BladeBannersKey", async () => {
    const { wrapper, banners } = factory();
    banners.value.push({
      id: "custom-1",
      variant: "info",
      message: "Read-only mode",
      dismissible: false,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".vc-blade-status-banners__banner--info").exists()).toBe(true);
    expect(wrapper.find(".vc-blade-status-banners__text").text()).toBe("Read-only mode");
  });

  it("renders dismiss button for dismissible banners", async () => {
    const { wrapper, banners } = factory();
    banners.value.push({
      id: "custom-2",
      variant: "success",
      message: "Saved",
      dismissible: true,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".vc-blade-status-banners__dismiss").exists()).toBe(true);
  });

  it("does not render dismiss button for non-dismissible banners", async () => {
    const { wrapper, banners } = factory();
    banners.value.push({
      id: "custom-3",
      variant: "info",
      message: "Info",
      dismissible: false,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".vc-blade-status-banners__dismiss").exists()).toBe(false);
  });
});
