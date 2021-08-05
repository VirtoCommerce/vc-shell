/* eslint-disable */
import { Decorators } from "@storybook/vue3";

import "!style-loader!css-loader!less-loader!../../src/styles/index.less";
import "!style-loader!css-loader!@virtoshell/ui-theme-light/dist/theme.css";

export const decorators: Decorators = [
  () => ({
    template: "<div class='vc-theme_light'><story/></div>",
  }),
];
