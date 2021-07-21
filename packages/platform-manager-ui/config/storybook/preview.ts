import { Decorators } from "@storybook/vue3";

import "!style-loader!css-loader!less-loader!../../src/styles/index.less";
import "!style-loader!css-loader!@virtocommerce/platform-manager-theme-light/dist/theme.css";

export const decorators: Decorators = [
  (): unknown => ({
    template: "<div class='vc-theme_light'><story/></div>",
  }),
];
