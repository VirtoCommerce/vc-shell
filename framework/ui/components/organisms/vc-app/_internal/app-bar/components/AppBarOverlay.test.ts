import { describe, expect, it, vi, beforeEach } from "vitest";
import { ref, provide, defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { AppRootElementKey } from "@framework/injection-keys";
import AppBarOverlay from "./AppBarOverlay.vue";

function mountOverlay(
  props: Record<string, unknown> = {},
  options: { appRootEl?: HTMLElement; isMobile?: boolean; isDesktop?: boolean } = {},
) {
  const appRootEl = options.appRootEl ?? document.createElement("div");
  document.body.appendChild(appRootEl);

  const Wrapper = defineComponent({
    setup() {
      provide(AppRootElementKey, ref(appRootEl));
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
      global: {
        mocks: {
          $isMobile: ref(options.isMobile ?? false),
          $isDesktop: ref(options.isDesktop ?? true),
        },
      },
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
        mocks: {
          $isMobile: ref(false),
          $isDesktop: ref(true),
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
        return () =>
          h(
            AppBarOverlay,
            { isSidebarMode: false, expanded: false },
            { default: () => h("span", { class: "test-content" }, "Hello") },
          );
      },
    });

    mount(Wrapper, {
      global: {
        mocks: {
          $isMobile: ref(false),
          $isDesktop: ref(true),
        },
      },
      attachTo: document.body,
    });

    expect(appRootEl.querySelector(".test-content")).toBeTruthy();
  });
});
