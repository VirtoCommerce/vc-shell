import { Decorators } from '@storybook/vue3';

import "!style-loader!css-loader!less-loader!../../src/styles/common.less";
import "!style-loader!css-loader!less-loader!../../src/styles/components.less";
import "!style-loader!css-loader!less-loader!../../src/themes/light.less";

export const decorators: Decorators = [() => ({
  template: "<div class='vc-theme_light'><story/></div>"
})];
