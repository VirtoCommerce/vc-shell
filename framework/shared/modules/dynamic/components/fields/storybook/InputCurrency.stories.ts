import { reactive, ref } from "vue";
import { template, templateWithVisibilityToggle } from "./common/templates";
import page from "./pages/DynamicRender";
import { Meta, StoryFn } from "@storybook/vue3";
import { InputCurrencySchema } from "../../..";
import * as _ from "lodash-es";
import { SchemaBaseArgTypes } from "./common/args";

export default {
  title: "DynamicViews/molecules/VcInputCurrency",
  component: page,
  args: {
    id: "inputCurrencyId",
    component: "vc-input-currency",
    property: "mockedProperty",
    optionProperty: "currency",
    options: "currencies",
  },
  argTypes: {
    ..._.omit(SchemaBaseArgTypes, ["multilanguage"]),
    component: {
      description: "Component type.",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "vc-input-currency",
        },
        defaultValue: {
          summary: "vc-input-currency",
        },
      },
    },
    options: {
      description: `List of currency options to be displayed in the dropdown.
      Array should be defined in the blade \`scope\``,
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "array",
        },
      },
    },
    optionProperty: {
      description: "Name of property that holds currency value.",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "string",
        },
      },
    },
    optionValue: {
      description: "Property of optionProperty which holds the `value`",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "string",
        },
        defaultValue: {
          summary: "id",
        },
      },
    },
    optionLabel: {
      description: "Property of optionProperty which holds the `label`",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "string",
        },
        defaultValue: {
          summary: "title",
        },
      },
    },
    clearable: {
      description: "Whether the input-currency is clearable or not.",
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
    hint: {
      description: "Hint text to be displayed below the input.",
      table: {
        type: {
          summary: "string",
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
} satisfies Meta<InputCurrencySchema>;

export const Template: StoryFn<InputCurrencySchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: 1234,
        currency: "USD",
      },
      scope: {
        currencies: [
          { id: "USD", title: "USD" },
          { id: "EUR", title: "EUR" },
          { id: "GBP", title: "GBP" },
        ],
      },
    });

    return { args, context };
  },
  template,
});

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: "Input Currency Label",
};

export const WithTooltip = WithLabel.bind({});
WithTooltip.args = {
  label: "Input Currency Label",
  tooltip: "Input Currency Tooltip",
};

export const WithHint = Template.bind({});
WithHint.args = {
  label: "Input Currency Label",
  hint: "Input Currency Hint",
};

export const WithPlaceholder: StoryFn<InputCurrencySchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: null,
        currency: "USD",
      },
      scope: {
        currencies: [
          { id: "USD", title: "USD" },
          { id: "EUR", title: "EUR" },
          { id: "GBP", title: "GBP" },
        ],
      },
    });
    return { args, context };
  },
  template,
});
WithPlaceholder.args = {
  label: "Input Currency Label",
  placeholder: "Input Currency Placeholder",
};

export const WithValidation = WithPlaceholder.bind({});
WithValidation.args = {
  label: "Input Currency Label",
  placeholder: "Input Currency Placeholder",
  rules: { required: true },
};

export const WithDisabled: StoryFn<InputCurrencySchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: 1234,
        currency: "USD",
      },
      scope: {
        currencies: [
          { id: "USD", title: "USD" },
          { id: "EUR", title: "EUR" },
          { id: "GBP", title: "GBP" },
        ],
        disabledFn: true,
      },
    });
    return { args, context };
  },
  template,
});
WithDisabled.args = {
  label: "Input Currency Label",
  disabled: { method: "disabledFn" },
};

export const WithVisibilityMethod: StoryFn<InputCurrencySchema> = (args) => ({
  components: { page },
  setup() {
    const isVisible = ref(false);
    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    const context = reactive({
      item: {
        mockedProperty: 1234,
        currency: "USD",
      },
      scope: {
        currencies: [
          { id: "USD", title: "USD" },
          { id: "EUR", title: "EUR" },
          { id: "GBP", title: "GBP" },
        ],
        visibilityFn: isVisible,
      },
    });
    return { args, context, toggle };
  },
  template: templateWithVisibilityToggle,
});
WithVisibilityMethod.args = {
  label: "Input Currency Label",
  visibility: { method: "visibilityFn" },
};

export const WithUpdateMethod: StoryFn<InputCurrencySchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: null,
        currency: "USD",
      },
      scope: {
        currencies: [
          { id: "USD", title: "USD" },
          { id: "EUR", title: "EUR" },
          { id: "GBP", title: "GBP" },
        ],
        updateFn: (value: string) => alert(`Value updated to: ${value}`),
      },
    });
    return { args, context };
  },
  template,
});
WithUpdateMethod.args = {
  label: "Input Currency Label",
  update: { method: "updateFn" },
};

export const WithClearable = Template.bind({});
WithClearable.args = {
  label: "Input Currency Label",
  clearable: true,
};

export const WithHorizontalSeparator = Template.bind({});
WithHorizontalSeparator.args = {
  label: "Input Currency Label",
  horizontalSeparator: true,
};
