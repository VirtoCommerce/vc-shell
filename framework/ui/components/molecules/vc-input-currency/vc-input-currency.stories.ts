import type { Meta, StoryObj } from "@storybook/vue3";
import { VcInputCurrency } from "./";
import { ref } from "vue";

const meta: Meta<typeof VcInputCurrency> = {
  title: "molecules/VcInputCurrency",
  component: VcInputCurrency,
};

export default meta;
type Story = StoryObj<typeof VcInputCurrency>;

export const Primary: Story = {
  render: (args) => ({
    // components: { VcInputCurrency, VcSelect, VcInput },
    setup() {
      const price = ref(0);
      const option = ref("USD");
      return { args, price, option };
    },
    template:
      '<vc-input-currency v-bind="args" v-model:modelValue.number="price" v-model:option="option"></vc-input-currency>',
  }),
  args: {
    label: "Label",
    placeholder: "Placeholder",
    options: [
      {
        title: "USD",
        value: "USD",
      },
      {
        title: "EUR",
        value: "EUR",
      },
    ],
    optionLabel: "title",
    optionValue: "value",
  },
};
