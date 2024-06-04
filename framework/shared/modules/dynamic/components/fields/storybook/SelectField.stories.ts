import { StoryFn, Meta, setup } from "@storybook/vue3";
import { SchemaBaseArgTypes } from "./common/args";
import page from "./pages/DynamicRender";
import { SelectSchema } from "../../..";
import { reactive, ref } from "vue";
import { template, templateWithVisibilityToggle } from "./common/templates";
import { VcIcon } from "../../../../../../ui/components/atoms/vc-icon";

const customTemplateComponent = {
  props: ["context", "slotName"],
  template: `
  <template v-if="slotName === 'option'">
    <div class="tw-flex tw-flex-col">
      <h2>ID - {{context.opt.id}}</h2>
      <p>Title - {{context.opt.title}}</p>
    </div>
  </template>
  <template v-else-if="slotName === 'selected-item'">
    <div class="tw-flex tw-flex-row tw-gap-3 tw-items-center">
      <VcIcon icon="fas fa-check" class="tw-text-green-500" />
      {{context.opt.title}}
    </div>
  </template>
  `,
};

setup((app) => {
  app.component("CustomSelect", customTemplateComponent);
});

export default {
  title: "DynamicViews/molecules/VcSelect",
  component: page,
  args: {
    id: "selectFieldId",
    component: "vc-select",
    property: "mockedProperty",
    optionsMethod: "mockedOptionsArray",
  },
  argTypes: {
    ...SchemaBaseArgTypes,
    component: {
      description: "Component type for select.",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "vc-select",
        },
        defaultValue: {
          summary: "vc-select",
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
    optionsMethod: {
      description: `Method that is used to get select options.
      Method should be defined in the blade \`scope\` and could be:
      \n1) async method with the following arguments: (\`keyword: string\`, \`skip\`, \`ids?: string[]\`).
      \n2) any array
      \n3) composable returning array`,
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
    customTemplate: {
      description: `Name of custom template to display data in select.
      Component should be registered globally.
      Supported slots:
      \n1) \`selected-item\` - selected item
      \n2) \`option\` - options in dropdown list

      \nComponent should have the following props:
      \n1) \`context\` - object with the following properties:
      \n- \`index\` - index of the selected option
      \n- \`opt\` - option object
      \n- \`selected\` - boolean value indicating if the option is selected
      \n- \`toggleOption\` - function to toggle the option
      \n- \`removeAtIndex\` - function to remove the option at the index
      \n2) \`slotName\` - name of the slot to render`,
      table: {
        type: {
          summary: "{ component: string }",
        },
      },
    },
    clearable: {
      description: "Whether the select is clearable or not.",
      control: "boolean",
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "false",
        },
      },
    },
    emitValue: {
      description: `Update model with the value of the selected option instead of the whole option.
      \n Example:
      \nIf emitValue is \`true\` and the selected option is { id: 1, title: "Option 1" }, the model will be updated with 1.
      \nIf emitValue is \`false\`, the model will be updated with the whole option.`,
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "true",
        },
      },
    },
    searchable: {
      description: "Whether the select is searchable or not.",
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "false",
        },
      },
    },
    multiple: {
      description: "Select multiple values.",
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "false",
        },
      },
    },
    mapOptions: {
      description:
        "Try to map labels of model from 'options' Array; If you are using emit-value you will probably need to use map-options to display the label text in the select field rather than the value.",
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "true",
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
} satisfies Meta<SelectSchema>;

export const Template: StoryFn<SelectSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: 1,
      },
      scope: {
        mockedOptionsArray: [
          { id: 1, title: "Option 1" },
          { id: 2, title: "Option 2" },
          { id: 3, title: "Option 3" },
          { id: 4, title: "Option 4" },
        ],
      },
    });
    return { args, context };
  },
  template,
});

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: "Select label",
};

export const WithTooltip = WithLabel.bind({});
WithTooltip.args = {
  label: "Select label",
  tooltip: "Select tooltip",
};

export const WithHint = WithLabel.bind({});
WithHint.args = {
  hint: "Select hint",
};

export const WithPlaceholder: StoryFn<SelectSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: null,
      },
      scope: {
        mockedOptionsArray: [
          { id: 1, title: "Option 1" },
          { id: 2, title: "Option 2" },
          { id: 3, title: "Option 3" },
          { id: 4, title: "Option 4" },
        ],
      },
    });
    return { args, context };
  },
  template,
});
WithPlaceholder.args = {
  label: "Select label",
  placeholder: "Select item from dropdown",
};

export const WithValidation = Template.bind({});
WithValidation.args = {
  label: "Select label",
  rules: { required: true },
};

export const WithAsyncOptions: StoryFn<SelectSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: null,
      },
      scope: {
        mockedOptionsArray: async (keyword?: string, skip = 0, ids?: string[]) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                results: [
                  { title: "Option 1", label: "Option 1" },
                  { title: "Option 2", label: "Option 2" },
                  { title: "Option 3", label: "Option 3" },
                ],
                totalCount: 3,
              });
            }, 1000);
          }),
      },
    });
    return { args, context };
  },
  template,
});
WithAsyncOptions.args = {
  label: "Select label",
  optionLabel: "label",
  optionValue: "title",
};

export const WithObjectArrayOptions: StoryFn<SelectSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: null,
      },
      scope: {
        mockedOptionsArray: [
          { id: 1, title: "Option 1" },
          { id: 2, title: "Option 2" },
          { id: 3, title: "Option 3" },
          { id: 4, title: "Option 4" },
        ],
      },
    });
    return { args, context };
  },
  template,
});

export const WithStringArrayOptions: StoryFn<SelectSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: null,
      },
      scope: {
        mockedOptionsArray: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
    });
    return { args, context };
  },
  template,
});

export const EmitValueTrueProp: StoryFn<SelectSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: 1,
      },
      scope: {
        mockedOptionsArray: [
          { id: 1, title: "Option 1" },
          { id: 2, title: "Option 2" },
          { id: 3, title: "Option 3" },
          { id: 4, title: "Option 4" },
        ],
      },
    });
    return { args, context };
  },
  template,
});
EmitValueTrueProp.parameters = {
  docs: {
    description: {
      story: "The default emitValue === <b>true</b> returns the value of key defined in optionValue",
    },
  },
};

export const EmitValueFalseProp: StoryFn<SelectSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: { id: 1, title: "Option 1" },
      },
      scope: {
        mockedOptionsArray: [
          { id: 1, title: "Option 1" },
          { id: 2, title: "Option 2" },
          { id: 3, title: "Option 3" },
          { id: 4, title: "Option 4" },
        ],
      },
    });
    return { args, context };
  },
  template,
});
EmitValueFalseProp.args = {
  emitValue: false,
};
EmitValueFalseProp.parameters = {
  docs: {
    description: {
      story: "emitValue === <b>false</b> returns the complete object as the result",
    },
  },
};

export const MapOptionsTrueProp: StoryFn<SelectSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: 1,
      },
      scope: {
        mockedOptionsArray: [
          { value: 1, label: "Option 1" },
          { value: 2, label: "Option 2" },
          { value: 3, label: "Option 3" },
          { value: 4, label: "Option 4" },
        ],
      },
    });
    return { args, context };
  },
  template,
});
MapOptionsTrueProp.parameters = {
  docs: {
    description: {
      story:
        "The default mapOptions === <b>true</b> maps map labels of model from 'options' Array. If you are using emit-value you will probably need to use map-options to display the label text in the select field rather than the value.",
    },
  },
};

export const MapOptionsFalseProp: StoryFn<SelectSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: 1,
      },
      scope: {
        mockedOptionsArray: [
          { value: 1, label: "Option 1" },
          { value: 2, label: "Option 2" },
          { value: 3, label: "Option 3" },
          { value: 4, label: "Option 4" },
        ],
      },
    });
    return { args, context };
  },
  template,
});
MapOptionsFalseProp.args = {
  mapOptions: false,
};
MapOptionsFalseProp.parameters = {
  docs: {
    description: {
      story: "mapOptions === <b>false</b> will not map labels of model from 'options' Array",
    },
  },
};

export const Multiple: StoryFn<SelectSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: ["Option 1", "Option 2"],
      },
      scope: {
        mockedOptionsArray: [
          { id: 1, title: "Option 1" },
          { id: 2, title: "Option 2" },
          { id: 3, title: "Option 3" },
          { id: 4, title: "Option 4" },
        ],
      },
    });
    return { args, context };
  },
  template,
});
Multiple.args = {
  multiple: true,
};

export const Searchable: StoryFn<SelectSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: null,
      },
      scope: {
        mockedOptionsArray: [
          { id: 1, title: "Option 1" },
          { id: 2, title: "Option 2" },
          { id: 3, title: "Option 3" },
          { id: 4, title: "Option 4" },
        ],
      },
    });
    return { args, context };
  },
  template,
});
Searchable.args = {
  searchable: true,
};

export const WithDisabled: StoryFn<SelectSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: 1,
      },
      scope: {
        mockedOptionsArray: [
          { id: 1, title: "Option 1" },
          { id: 2, title: "Option 2" },
          { id: 3, title: "Option 3" },
          { id: 4, title: "Option 4" },
        ],
        disabledFn: true,
      },
    });
    return { args, context };
  },
  template,
});
WithDisabled.args = {
  disabled: {
    method: "disabledFn",
  },
};

export const WithClearable = Template.bind({});
WithClearable.args = {
  label: "Select label",
  clearable: true,
};

export const WithVisibilityMethod: StoryFn<SelectSchema> = (args) => ({
  components: { page },
  setup() {
    const isVisible = ref(false);
    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    const context = reactive({
      item: {
        mockedProperty: 1,
      },
      scope: {
        mockedOptionsArray: [
          { id: 1, title: "Option 1" },
          { id: 2, title: "Option 2" },
          { id: 3, title: "Option 3" },
          { id: 4, title: "Option 4" },
        ],
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

export const WithUpdateMethod: StoryFn<SelectSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: 1,
      },
      scope: {
        mockedOptionsArray: [
          { id: 1, title: "Option 1" },
          { id: 2, title: "Option 2" },
          { id: 3, title: "Option 3" },
          { id: 4, title: "Option 4" },
        ],
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

export const WithHorizontalSeparator = Template.bind({});

WithHorizontalSeparator.args = {
  label: "Select label",
  horizontalSeparator: true,
};

export const CustomTemplate: StoryFn<SelectSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: 1,
      },
      scope: {
        mockedOptionsArray: [
          { id: 1, title: "Option 1" },
          { id: 2, title: "Option 2" },
          { id: 3, title: "Option 3" },
          { id: 4, title: "Option 4" },
        ],
      },
    });
    return { args, context };
  },
  template,
});

CustomTemplate.storyName = "Custom template for dropdown item and selected item";
CustomTemplate.args = {
  label: "Select label",
  customTemplate: {
    component: "custom-select",
  },
};

export const CustomTemplateWithMultiple: StoryFn<SelectSchema> = (args) => ({
  components: { page, VcIcon },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: [1, 2],
      },
      scope: {
        mockedOptionsArray: [
          { id: 1, title: "Option 1" },
          { id: 2, title: "Option 2" },
          { id: 3, title: "Option 3" },
          { id: 4, title: "Option 4" },
        ],
      },
    });
    return { args, context };
  },
  template,
});

CustomTemplateWithMultiple.storyName = "Custom template for dropdown item and selected item with multiple values";
CustomTemplateWithMultiple.args = {
  label: "Select label",
  multiple: true,
  customTemplate: {
    component: "custom-select",
  },
};
