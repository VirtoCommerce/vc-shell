import type { Decorator } from "@storybook/vue3-vite";

// Story-only helpers, never imported by the component

/** Room under the bar, so its popovers and sheets fit in the canvas */
export const minHeight =
  (px: number): Decorator =>
  (story) => ({
    components: { story },
    template: `<div style="min-height: ${px}px"><story /></div>`,
  });
