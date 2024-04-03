import { Meta, StoryFn } from "@storybook/vue3";
import { TextareaSchema } from "../../..";
import { SchemaBaseArgTypes } from "./common/args";
import page from "./pages/DynamicRender";
import { template, templateWithVisibilityToggle } from "./common/templates";
import { reactive, ref } from "vue";

export default {
  title: "DynamicViews/molecules/VcTextarea",
  component: page,
  args: {
    id: "textareaId",
    component: "vc-textarea",
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
          summary: "vc-textarea",
        },
        defaultValue: {
          summary: "vc-textarea",
        },
      },
    },
    clearable: {
      description: "Whether the textarea is clearable or not.",
      table: {
        type: {
          summary: "boolean",
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
          summary: "1024",
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
} satisfies Meta<TextareaSchema>;

export const Template: StoryFn<TextareaSchema> = (args) => ({
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

export const WithPlaceholder: StoryFn<TextareaSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: "",
      },
    });
    return { args, context };
  },
  template,
});
WithPlaceholder.args = {
  placeholder: "Textarea placeholder",
};

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: "Textarea label",
};

export const WithTooltip = Template.bind({});
WithTooltip.args = {
  label: "Textarea label",
  tooltip: "Textarea tooltip",
};

export const WithValidation: StoryFn<TextareaSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: null,
      },
    });
    return { args, context };
  },
  template,
});
WithValidation.args = {
  label: "Textarea label",
  placeholder: "Enter text here",
  rules: {
    required: true,
  },
};

export const WithDisabled: StoryFn<TextareaSchema> = (args) => ({
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
  label: "Textarea label",
  disabled: {
    method: "disabledFn",
  },
};

export const WithClearable = Template.bind({});
WithClearable.args = {
  label: "Textarea label",
  clearable: true,
};

export const WithVisibilityMethod: StoryFn<TextareaSchema> = (args) => ({
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
  label: "Textarea label",
  visibility: { method: "visibilityFn" },
};

export const WithUpdateMethod: StoryFn<TextareaSchema> = (args) => ({
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
  label: "Textarea label",
  update: {
    method: "updateFn",
  },
};

export const WithHorizontalSeparator = Template.bind({});
WithHorizontalSeparator.args = {
  label: "Textarea label",
  horizontalSeparator: true,
};
