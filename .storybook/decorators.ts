import { Decorator } from '@storybook/vue3-vite';
import { mockGlobals } from './storybook-globals';

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
    template: '<div><story /></div>'
  };
};
