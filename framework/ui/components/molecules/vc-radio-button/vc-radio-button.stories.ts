import type { Meta, StoryFn } from "@storybook/vue3";
import { VcRadioButton } from "./";
import { ref } from "vue";

export default {
  title: "molecules/VcRadioButton",
  component: VcRadioButton,
  args: {
    modelValue: "Product 1",
    label: "Product 1",
    value: "Product 1",
  },
  argTypes: {
    modelValue: {
      control: "text",
      table: {
        type: {
          summary: "any",
        },
      },
    },
    value: {
      control: "text",
      table: {
        type: {
          summary: "any",
        },
      },
    },
    binary: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    name: {
      control: "text",
    },
    error: {
      control: "boolean",
    },
    errorMessage: {
      control: "text",
    },
    label: {
      control: "text",
    },
  },
} satisfies Meta<typeof VcRadioButton>;

export const Template: StoryFn<typeof VcRadioButton> = (args) => ({
  components: { VcRadioButton },
  setup() {
    return { args };
  },
  template: '<vc-radio-button v-bind="args">{{args.default}}</vc-radio-button>',
});

export const Group: StoryFn<typeof VcRadioButton> = (args) => ({
  components: { VcRadioButton },
  setup() {
    const products = ref([
      { id: 1, name: "Product 1" },
      { id: 2, name: "Product 2" },
      { id: 3, name: "Product 3" },
    ]);
    const selectedProduct = ref("Product 1");
    return { args, products, selectedProduct };
  },
  template: `
  <div v-for="product in products" :key="product.id" class="tw-pb-1">
    <vc-radio-button v-model="selectedProduct" :value="product.name" :label="product.name" />
  </div>`,
});

export const StringGroup: StoryFn<typeof VcRadioButton> = (args) => ({
  components: { VcRadioButton },
  setup() {
    const products = ref(["Product 1", "Product 2", "Product 3"]);
    const selectedProduct = ref("Product 1");

    return { args, products, selectedProduct };
  },
  template: `
  <div v-for="product in products" :key="product" class="tw-pb-1">
    <vc-radio-button v-model="selectedProduct" :value="product" :label="product" />
  </div>`,
});

export const Disabled = Template.bind({});
Disabled.args = { disabled: true };

export const Error = Template.bind({});
Error.args = { errorMessage: "This is an error message", error: true, modelValue: null };

export const Label = Template.bind({});
Label.args = { label: "Radio button label" };
