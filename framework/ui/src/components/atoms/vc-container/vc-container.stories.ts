/**
 * Container component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcContainer from "./vc-container.vue";

export default {
  title: "atoms/vc-container",
  component: VcContainer,
};

const Template: Story = (args) => ({
  components: { VcContainer },
  setup() {
    return { args };
  },
  template: `<div style="width: 400px; height: 300px"><vc-container v-bind="args">
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus pellentesque tortor id lacus viverra, ut mollis libero auctor. Curabitur viverra, justo eu convallis pulvinar, dui nisi luctus quam, ut egestas tortor dolor quis nisi. Sed dignissim tellus ac enim dignissim dapibus. Duis vitae ipsum sit amet leo ornare fringilla sit amet a felis. Quisque finibus elementum dolor eu rhoncus. Donec dapibus non nisl blandit lobortis. Suspendisse pellentesque elit nunc, at auctor orci dignissim sed. Cras malesuada nibh id porttitor hendrerit.</p>
    <p>Maecenas ut malesuada risus, a euismod ligula. Mauris fringilla arcu a vestibulum varius. Phasellus et quam facilisis, egestas magna ut, ultrices est. Maecenas accumsan sit amet metus sit amet laoreet. Sed at accumsan orci, id tincidunt nibh. Nam laoreet eu nisl a condimentum. Fusce ac blandit justo. Vestibulum sollicitudin eros euismod, cursus arcu ac, blandit eros. Phasellus tempor mi et iaculis pulvinar. Cras blandit, tortor sit amet fermentum aliquet, metus ipsum ultricies est, eu congue dui nunc nec ligula.</p>
    <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Pellentesque porttitor felis non turpis volutpat, ut consequat nulla vestibulum. Donec ipsum dui, convallis a faucibus eget, vehicula faucibus quam. Maecenas et velit odio. Suspendisse posuere faucibus est vel condimentum. Mauris et est placerat risus tincidunt rutrum. Sed venenatis nunc a mollis dignissim. Nam felis nisl, blandit in venenatis et, sollicitudin ut eros. Quisque ornare lacus metus, sed placerat lacus malesuada et. Sed venenatis, turpis in porta suscipit, libero ex tristique erat, nec pretium lectus justo malesuada dolor.</p>
    <p>Vivamus non nisi quis elit pellentesque pharetra quis eget augue. Donec tincidunt nunc id placerat tincidunt. Mauris ultrices quam id risus sodales, at euismod mauris convallis. Morbi quis aliquam nibh. Cras vitae mi a risus dapibus lacinia sit amet eu erat. Morbi ligula ex, aliquet ac nunc a, tempus lacinia lacus. Integer pretium arcu augue, vitae egestas libero rutrum eu.</p>
    <p>Suspendisse malesuada nisl tempor tellus ullamcorper, ut varius enim molestie. Suspendisse eleifend at libero id ultricies. Duis sagittis quis metus eget condimentum. Praesent iaculis viverra mauris et mattis. Pellentesque cursus, turpis sed venenatis volutpat, nibh tortor eleifend eros, non varius neque lectus ut dolor. Sed eget lectus et risus hendrerit molestie. Cras lorem enim, rutrum sed pellentesque in, tristique et diam. Donec aliquet dolor sit amet cursus facilisis. Donec a placerat nibh.</p>
  </vc-container></div>`,
});

export const Container = Template.bind({});
Container.storyName = "vc-container";
Container.args = {
  shadow: false,
};
