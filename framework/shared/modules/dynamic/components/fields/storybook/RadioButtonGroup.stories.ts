import { Meta, StoryFn } from "@storybook/vue3";
import { computed, reactive, ref } from "vue";
import page from "./pages/DynamicRender";
import { template, templateWithVisibilityToggle } from "./common/templates";
import * as _ from "lodash-es";
import { SchemaBaseArgTypes } from "./common/args";
import { RadioButtonSchema } from "../../..";

export default {
  title: "DynamicViews/molecules/VcRadioButtonGroup",
  component: page,
  args: {
    id: "radioButton",
    component: "vc-radio-button-group",
    property: "selectedProduct",
    options: "products",
  },
  argTypes: {
    ..._.omit(SchemaBaseArgTypes, ["multilanguage", "placeholder", "tooltip"]),
    component: {
      description: "Component type.",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "vc-radio-button",
        },
        defaultValue: {
          summary: "vc-radio-button",
        },
      },
    },
  },
  parameters: {
    docs: {
      canvas: {
        sourceState: "none",
      },
    },
  },
} satisfies Meta<RadioButtonSchema>;

export const Template: StoryFn<RadioButtonSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        selectedProduct: undefined,
      },
      scope: {
        products: ["Product 1"],
      },
    });

    return { args, context };
  },
  template,
});

export const Group: StoryFn<RadioButtonSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        selectedProduct: undefined,
      },
      scope: {
        products: [
          { id: 1, name: "Product 1" },
          { id: 2, name: "Product 2" },
          { id: 3, name: "Product 3" },
        ],
      },
    });
    return { args, context };
  },
  template,
});
Group.args = {
  id: "radioButton",
  component: "vc-radio-button-group",
  property: "selectedProduct",
  options: "products",
  optionValue: "name",
  optionLabel: "name",
};

export const StringGroup: StoryFn<RadioButtonSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        selectedProduct: undefined,
      },
      scope: {
        products: ["Product 1", "Product 2", "Product 3"],
      },
    });
    return { args, context };
  },
  template,
});
StringGroup.args = {
  id: "radioButton",
  component: "vc-radio-button-group",
  property: "selectedProduct",
  options: "products",
};

export const WithLabel = StringGroup.bind({});
WithLabel.args = {
  label: "Select one product",
};

export const WithTooltip = StringGroup.bind({});
WithTooltip.args = {
  label: "Select one product",
  tooltip: "This is tooltip!",
};

export const Disabled: StoryFn<RadioButtonSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        selectedProduct: undefined,
      },
      scope: {
        products: ["Product 1"],
        disabledFn: computed(() => true),
      },
    });
    return { args, context };
  },
  template,
});
Disabled.args = {
  disabled: {
    method: "disabledFn",
  },
};

export const Binary: StoryFn<RadioButtonSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        selectedProduct: true,
      },
      scope: {
        products: ["Product 1"],
      },
    });
    return { args, context };
  },
  template,
});
Binary.args = {
  binary: true,
};

export const WithVisibilityMethod: StoryFn<RadioButtonSchema> = (args) => ({
  components: { page },
  setup: () => {
    const isVisible = ref(false);
    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    const context = reactive({
      item: {
        selectedProduct: true,
      },
      scope: {
        products: ["Product 1"],
        visibilityFn: isVisible,
      },
    });
    return { args, context, toggle };
  },
  template: templateWithVisibilityToggle,
});
WithVisibilityMethod.args = {
  visibility: {
    method: "visibilityFn",
  },
};

export const HorizontalSeparator = Template.bind({});
HorizontalSeparator.args = {
  horizontalSeparator: true,
};

export const WithUpdateMethod: StoryFn<RadioButtonSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        selectedProduct: true,
      },
      scope: {
        products: ["Product 1", "Product 2", "Product 3"],
        updateFn: (value: string) => alert(`Value updated to: ${value}`),
      },
    });
    return { args, context };
  },
  template,
});
WithUpdateMethod.args = {
  update: {
    method: "updateFn",
  },
};

export const WithRequiredRule = Template.bind({});
WithRequiredRule.args = {
  label: "Select one product",
  rules: {
    required: true,
  },
};
