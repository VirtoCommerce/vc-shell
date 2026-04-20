import { describe, expect, it, beforeEach } from "vitest";
import { ref, provide, defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { AppRootElementKey, IsMobileKey, IsDesktopKey } from "@framework/injection-keys";
import AppBarOverlay from "./AppBarOverlay.vue";

function mountOverlay(
  props: Record<string, unknown> = {},
  options: { appRootEl?: HTMLElement; isMobile?: boolean; isDesktop?: boolean } = {},
) {
  const appRootEl = options.appRootEl ?? document.createElement("div");
  document.body.appendChild(appRootEl);

  const isMobile = ref(options.isMobile ?? false);
  const isDesktop = ref(options.isDesktop ?? true);

  const Wrapper = defineComponent({
    setup() {
      provide(AppRootElementKey, ref(appRootEl));
      provide(IsMobileKey, isMobile);
      provide(IsDesktopKey, isDesktop);
      return () =>
        h(AppBarOverlay, {
          isSidebarMode: false,
          expanded: false,
          ...props,
        });
    },
  });

  return {
    wrapper: mount(Wrapper, {
      attachTo: document.body,
    }),
    appRootEl,
  };
}

function cleanupBody() {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

describe("AppBarOverlay", () => {
  beforeEach(() => {
    cleanupBody();
  });

  it("renders overlay via teleport when appRootEl is provided", () => {
    const { appRootEl } = mountOverlay();
    expect(appRootEl.querySelector(".app-bar-overlay")).toBeTruthy();
  });

  it("does not render when appRootEl is not injected", () => {
    const wrapper = mount(AppBarOverlay, {
      props: { isSidebarMode: false, expanded: false },
      global: {
        provide: {
          [IsMobileKey as symbol]: ref(false),
          [IsDesktopKey as symbol]: ref(true),
        },
      },
    });
    expect(wrapper.find(".app-bar-overlay").exists()).toBe(false);
  });

  it("applies desktop class", () => {
    const { appRootEl } = mountOverlay({}, { isDesktop: true, isMobile: false });
    expect(appRootEl.querySelector(".app-bar-overlay--desktop")).toBeTruthy();
  });

  it("applies mobile class", () => {
    const { appRootEl } = mountOverlay({}, { isMobile: true, isDesktop: false });
    expect(appRootEl.querySelector(".app-bar-overlay--mobile")).toBeTruthy();
  });

  it("applies sidebar class when isSidebarMode is true", () => {
    const { appRootEl } = mountOverlay({ isSidebarMode: true });
    expect(appRootEl.querySelector(".app-bar-overlay--sidebar")).toBeTruthy();
  });

  it("applies collapsed class when not expanded and not mobile", () => {
    const { appRootEl } = mountOverlay({ expanded: false }, { isMobile: false });
    expect(appRootEl.querySelector(".app-bar-overlay--collapsed")).toBeTruthy();
  });

  it("does not apply collapsed class when expanded", () => {
    const { appRootEl } = mountOverlay({ expanded: true }, { isMobile: false });
    expect(appRootEl.querySelector(".app-bar-overlay--collapsed")).toBeFalsy();
  });

  it("renders default slot content", () => {
    const appRootEl = document.createElement("div");
    document.body.appendChild(appRootEl);

    const Wrapper = defineComponent({
      setup() {
        provide(AppRootElementKey, ref(appRootEl));
        provide(IsMobileKey, ref(false));
        provide(IsDesktopKey, ref(true));
        return () =>
          h(
            AppBarOverlay,
            { isSidebarMode: false, expanded: false },
            { default: () => h("span", { class: "test-content" }, "Hello") },
          );
      },
    });

    mount(Wrapper, {
      attachTo: document.body,
    });

    expect(appRootEl.querySelector(".test-content")).toBeTruthy();
  });
});
