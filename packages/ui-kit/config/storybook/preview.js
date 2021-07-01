import "!style-loader!css-loader!less-loader!../../src/styles/common.less";
import "!style-loader!css-loader!less-loader!../../src/styles/components.less";

import "!style-loader!css-loader!less-loader!../../src/themes/light.less";

export const decorators = [(story) => ({
  components: { story },
  template: "<div class='vc-theme_light'><story/></div>"
})];
