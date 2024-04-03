import { Meta, StoryFn } from "@storybook/vue3";
import { InputSchema } from "../../..";
import { SchemaBaseArgTypes } from "./common/args";
import page from "./pages/DynamicRender";
import { template, templateWithVisibilityToggle } from "./common/templates";
import { reactive, ref } from "vue";

export default {
  title: "DynamicViews/molecules/VcInput",
  component: page,
  args: {
    id: "inputFieldId",
    component: "vc-input",
    property: "mockedProperty",
    variant: "text",
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
          summary: "vc-input",
        },
        defaultValue: {
          summary: "vc-input",
        },
      },
    },
    variant: {
      description: "Field variant.",
      control: "radio",
      options: ["number", "text", "password", "email", "tel", "url", "time", "date", "datetime-local"],
      table: {
        type: {
          summary: "number | text | password | email | tel | url | time | date | datetime-local",
        },
        defaultValue: {
          summary: "text",
        },
      },
    },
    clearable: {
      description: "Whether the input is clearable or not.",
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "false",
        },
      },
    },
    prepend: {
      description: "Schema of component to be displayed before the input.",
      table: {
        type: {
          summary: "ControlSchema",
        },
      },
    },
    append: {
      description: "Schema of component to be displayed after the input.",
      table: {
        type: {
          summary: "ControlSchema",
        },
      },
    },
    appendInner: {
      description: "Schema of component to be displayed inside the input after the value.",
      table: {
        type: {
          summary: "ControlSchema",
        },
      },
    },
    prependInner: {
      description: "Schema of component to be displayed inside the input before the value.",
      table: {
        type: {
          summary: "ControlSchema",
        },
      },
    },
    maxlength: {
      description: "Maximum number of characters that can be entered.",
      control: "number",
      table: {
        type: {
          summary: "number",
        },
        defaultValue: {
          summary: 1024,
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
} satisfies Meta<InputSchema>;

export const Template: StoryFn<InputSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: "I am input field",
      },
    });
    return { args, context };
  },
  template,
});

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: "Input label",
};

export const WithTooltip = WithLabel.bind({});
WithTooltip.args = {
  label: "Input label",
  tooltip: "Input tooltip",
};

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  label: "Input label",
  placeholder: "Input placeholder",
};

export const WithPrepend: StoryFn<InputSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: "I am input field",
      },
      scope: {
        btnClick: () => alert("Button clicked!"),
      },
    });
    return { args, context };
  },
  template,
});
WithPrepend.args = {
  label: "Input label",
  prepend: {
    component: "vc-button",
    id: "prependButtonId",
    content: "Prepend",
    method: "btnClick",
  },
};

export const WithAppend = WithPrepend.bind({});
WithAppend.args = {
  label: "Input label",
  append: {
    component: "vc-button",
    id: "appendButtonId",
    content: "Append",
    method: "btnClick",
  },
};

export const WithPrependInner = WithPrepend.bind({});
WithPrependInner.args = {
  label: "Input label",
  prependInner: {
    component: "vc-button",
    id: "prependInnerButtonId",
    content: "Prepend Inner",
    method: "btnClick",
  },
};

export const WithAppendInner = WithPrepend.bind({});
WithAppendInner.args = {
  label: "Input label",
  appendInner: {
    component: "vc-button",
    id: "appendInnerButtonId",
    content: "Append Inner",
    method: "btnClick",
  },
};

export const WithClearable = Template.bind({});
WithClearable.args = {
  label: "Input label",
  clearable: true,
};

export const WithDisabled: StoryFn<InputSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: "I am input field",
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
  disabled: { method: "disabledFn" },
};

export const WithVisibilityMethod: StoryFn<InputSchema> = (args) => ({
  components: { page },
  setup() {
    const isVisible = ref(false);
    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    const context = reactive({
      item: {
        mockedProperty: "I am input field",
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
  visibility: { method: "visibilityFn" },
};

export const WithUpdateMethod: StoryFn<InputSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: "I am input field",
      },
      scope: {
        updateFn: (value: string) => alert(`Value updated to: ${value}`),
      },
    });
    return { args, context };
  },
  template,
});
WithUpdateMethod.args = {
  label: "Input label",
  update: { method: "updateFn" },
};

export const WithValidation: StoryFn<InputSchema> = (args) => ({
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
WithValidation.args = {
  label: "Input label",
  placeholder: "Enter a number",
  rules: {
    required: true,
    numeric: true,
  },
};

export const WithHorizontalSeparator = Template.bind({});
WithHorizontalSeparator.args = {
  label: "Input label",
  horizontalSeparator: true,
};
