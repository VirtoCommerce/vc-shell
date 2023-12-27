import type { Meta, StoryObj } from "@storybook/vue3";
import { VcCard } from ".";
import { VcInput, VcCol } from "./../../";

const meta: Meta<typeof VcCard> = {
  title: "atoms/VcCard",
  component: VcCard,
};

export default meta;
type Story = StoryObj<typeof VcCard>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcCard, VcInput, VcCol },
    setup() {
      return { args };
    },
    template: `<vc-card v-bind="args">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque quas!</vc-card>`,
  }),
  args: {
    variant: "default",
    header: "Simple Card",
  },
};
