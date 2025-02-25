import { Meta, StoryFn, setup } from "@storybook/vue3";
import { MultivalueSchema } from "../../..";
import { SchemaBaseArgTypes } from "./common/args";
import { template, templateWithVisibilityToggle } from "./common/templates";
import page from "./pages/DynamicRender";
import { reactive, ref } from "vue";
import { VcIcon } from "../../../../../../ui/components/atoms/vc-icon";

const customTemplateComponent = {
  props: ["context", "slotName"],
  template: `
  <template v-if="slotName === 'option'">
    <div class="tw-flex tw-flex-col">
      <h2>ID - {{context.item.id}}</h2>
      <p>Title - {{context.item.title}}</p>
    </div>
  </template>
  <template v-else-if="slotName === 'selected-item'">
    <div class="tw-flex tw-flex-row tw-gap-3 tw-items-center">
      <VcIcon icon="fas fa-check" class="tw-text-green-500" />
      {{ context.value }}
      </div>
  </template>
  `,
};

setup((app) => {
  app.component("CustomMultivalue", customTemplateComponent);
});

export default {
  title: "DynamicViews/molecules/VcMultivalue",
  component: page,
  args: {
    id: "multivalueFieldId",
    component: "vc-multivalue",

    property: "mockedProperty",
  },
  argTypes: {
    ...SchemaBaseArgTypes,
    component: {
      description: "Component type.",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "vc-multivalue",
        },
        defaultValue: {
          summary: "vc-multivalue",
        },
      },
    },
    optionValue: {
      description: "Property which holds the `value`",
      type: {
        required: true,
        name: "string",
      },
      control: "text",
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
      description: "Property which holds the `label`",
      type: {
        required: true,
        name: "string",
      },
      control: "text",
      table: {
        type: {
          summary: "string",
        },
        defaultValue: {
          summary: "title",
        },
      },
    },
    options: {
      description: "Array with multivalue dictionary. Array should be defined in the blade `scope`.",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    multivalue: {
      description: "Whether the select is multivalue or not.",
      control: "boolean",
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
    variant: {
      description: "Multivalue type",
      control: "radio",
      options: ["number", "integer", "text"],
      table: {
        type: {
          summary: "number | integer | text",
        },
        defaultValue: {
          summary: "text",
        },
      },
    },
    customTemplate: {
      description: `Name of custom template to display data in multivalue.
        Component should be registered globally.
        Supported slots:
        \n1) \`selected-item\` - selected item
        \n2) \`option\` - options in dropdown list
        \nComponent should have the following props:
        \n1) \`context\` - object with the following properties:
        \n - \`item\` - selected item
        \n - \`value\` - selected value
        \n - \`remove\` - function to remove the option
        \n2) \`slotName\` - name of the slot to render`,
      table: {
        type: {
          summary: "{ component: string }",
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
} satisfies Meta<MultivalueSchema>;

export const Template: StoryFn<MultivalueSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: undefined,
      },
      scope: {},
    });
    return { args, context };
  },
  template,
});
Template.args = {
  placeholder: "Write something and press Enter",
};

export const WithHint = Template.bind({});
WithHint.args = {
  placeholder: "Write something and press Enter",
  hint: "I am a hint",
};

export const NumberInput: StoryFn<MultivalueSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: undefined,
      },
      scope: {},
    });
    return { args, context };
  },
  template,
});
NumberInput.args = {
  variant: "number",
  placeholder: "Write something and press Enter",
};

export const Multivalue: StoryFn<MultivalueSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: undefined,
      },
      scope: {
        mockedOptionsArray: [
          { id: "1", title: "Option 1" },
          { id: "2", title: "Option 2" },
          { id: "3", title: "Option 3" },
        ],
      },
    });
    return { args, context };
  },
  template,
});
Multivalue.args = {
  multivalue: true,
  options: "mockedOptionsArray",
};

export const CustomTemplate: StoryFn<MultivalueSchema> = (args) => ({
  components: { page, VcIcon },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: [{ id: "1", title: "Option 1" }],
      },
      scope: {
        mockedOptionsArray: [
          { id: "1", title: "Option 1" },
          { id: "2", title: "Option 2" },
          { id: "3", title: "Option 3" },
        ],
      },
    });
    return { args, context };
  },
  template,
});
CustomTemplate.storyName = "Custom template for dropdown item and selected item";
CustomTemplate.args = {
  options: "mockedOptionsArray",
  multivalue: true,
  customTemplate: { component: "custom-multivalue" },
};

export const WithLabel: StoryFn<MultivalueSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: [],
      },
      scope: {},
    });
    return { args, context };
  },
  template,
});

WithLabel.args = {
  label: "Input label",
};

export const WithValidation = WithLabel.bind({});
WithValidation.args = {
  label: "Input label",
  placeholder: "Enter a number",
  rules: {
    required: true,
  },
};

export const WithTooltip = WithLabel.bind({});

WithTooltip.args = {
  label: "Input label",
  tooltip: "I am a tooltip",
};

export const WithDisabled: StoryFn<MultivalueSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: [],
      },
      scope: {
        disabledFn: true,
      },
    });
    return { args, context };
  },
  template,
});
WithDisabled.args = {
  label: "Input label",
  disabled: {
    method: "disabledFn",
  },
};

export const WithPlaceholder = WithLabel.bind({});
WithPlaceholder.args = {
  label: "Input label",
  placeholder: "I am a placeholder",
};

export const WithVisibilityMethod: StoryFn<MultivalueSchema> = (args) => ({
  components: { page },
  setup() {
    const isVisible = ref(false);
    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    const context = reactive({
      item: {
        mockedProperty: [],
      },
      scope: {
        visibilityFn: isVisible,
      },
    });
    return { args, context, toggle };
  },
  template: templateWithVisibilityToggle,
});
WithVisibilityMethod.args = {
  label: "Input label",
  visibility: {
    method: "visibilityFn",
  },
};

export const WithUpdateMethod: StoryFn<MultivalueSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: [],
      },
      scope: {
        updateFn: (value: string) => alert(`Value updated to: ${JSON.stringify(value, null, 2)}`),
      },
    });
    return { args, context };
  },
  template,
});
WithUpdateMethod.args = {
  label: "Input label",
  update: {
    method: "updateFn",
  },
};

export const WithHorizontalSeparator = Template.bind({});
WithHorizontalSeparator.args = {
  label: "Input label",
  horizontalSeparator: true,
};
