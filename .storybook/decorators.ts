import { Decorator } from "@storybook/vue3-vite";
import { ref, provide, getCurrentInstance, onUnmounted } from "vue";
import { IsMobileKey, IsDesktopKey } from "../framework/injection-keys";
import { mockGlobals } from "./storybook-globals";

/**
 * Decorator for components that require a wrapper
 */
export const withContainer: Decorator = (story, context) => {
  return {
    components: { story },
    template: '<div class="tw-p-4 tw-m-4 tw-border tw-border-gray-200 tw-rounded"><story /></div>',
    setup() {
      return { args: context.args };
    },
  };
};

/**
 * Decorator for a dark background
 */
export const withDarkBackground: Decorator = (story, context) => {
  return {
    components: { story },
    template: '<div class="tw-p-4 tw-bg-gray-800 tw-text-white"><story /></div>',
    setup() {
      return { args: context.args };
    },
  };
};

/**
 * Decorator to ensure global mocks
 * Mocks are already declared in preview-head.html,
 * this decorator is used for documentation
 */
export const withGlobalMocks: Decorator = (story, context) => {
  return {
    components: { story },
    template: "<div><story /></div>",
  };
};

/**
 * Decorator that provides .vc-app container for Teleport targets.
 * Required for components using VcTooltip or other teleporting components.
 */
export const withVcApp: Decorator = (story, context) => {
  return {
    components: { story },
    template: '<div class="vc-app" style="background-color: transparent;"><story /></div>',
    setup() {
      return { args: context.args };
    },
  };
};

/**
 * Decorator that forces mobile view for stories.
 * Overrides both global properties ($isMobile/$isDesktop used in templates)
 * and provide/inject values (used by some composables).
 * Restores originals on unmount to avoid leaking into other stories.
 */
export const withMobileView: Decorator = (story, context) => {
  return {
    components: { story },
    template: "<story />",
    setup() {
      const instance = getCurrentInstance();
      if (instance) {
        const globals = instance.appContext.config.globalProperties;
        // Save originals
        const origMobile = globals.$isMobile;
        const origDesktop = globals.$isDesktop;
        const origPhone = globals.$isPhone;
        const origTablet = globals.$isTablet;

        // Override with mobile values
        globals.$isMobile = ref(true);
        globals.$isDesktop = ref(false);
        globals.$isPhone = ref(false);
        globals.$isTablet = ref(true);

        onUnmounted(() => {
          globals.$isMobile = origMobile;
          globals.$isDesktop = origDesktop;
          globals.$isPhone = origPhone;
          globals.$isTablet = origTablet;
        });
      }

      // Also provide via inject for components that use inject
      provide(IsMobileKey, ref(true));
      provide(IsDesktopKey, ref(false));

      return { args: context.args };
    },
  };
};
