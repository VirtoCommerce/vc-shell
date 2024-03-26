import { Meta, StoryFn } from "@storybook/vue3";
import Checkbox from "../Checkbox";
import { computed, reactive, ref } from "vue";
import page from "./pages/DynamicRender";
import { template, templateWithVisibilityToggle } from "./common/templates";
import * as _ from "lodash-es";
import { SchemaBaseArgTypes } from "./common/args";
import { CheckboxSchema } from "../../..";

export default {
  title: "DynamicViews/atoms/VcCheckbox",
  component: page,
  args: {
    id: "checkboxId",
    component: "vc-checkbox",
    content: "Checkbox text",
    property: "mockedProperty",
  },
  argTypes: {
    ..._.omit(SchemaBaseArgTypes, ["multilanguage", "placeholder"]),
    component: {
      description: "Component type.",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "vc-checkbox",
        },
        defaultValue: {
          summary: "vc-checkbox",
        },
      },
    },
    content: {
      description: `Checkbox text content.
      Supports i18n keys.`,
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
    trueValue: {
      description: "Value when checkbox is checked.",
      table: {
        type: {
          summary: "any",
        },
        defaultValue: {
          summary: "true",
        },
      },
    },
    falseValue: {
      description: "Value when checkbox is unchecked.",
      table: {
        type: {
          summary: "any",
        },
        defaultValue: {
          summary: "false",
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
} satisfies Meta<CheckboxSchema>;

export const Template: StoryFn<CheckboxSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        mockedProperty: true,
      },
    });

    return { args, context };
  },
  template,
});

export const Disabled: StoryFn<CheckboxSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        mockedProperty: false,
      },
      scope: {
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

export const Checked: StoryFn<CheckboxSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        mockedProperty: true,
      },
    });
    return { args, context };
  },
  template,
});

export const WithVisibilityMethod: StoryFn<CheckboxSchema> = (args) => ({
  components: { page },
  setup: () => {
    const isVisible = ref(false);
    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    const context = reactive({
      item: {
        mockedProperty: false,
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
  visibility: {
    method: "visibilityFn",
  },
};

export const HorizontalSeparator = Template.bind({});
HorizontalSeparator.args = {
  horizontalSeparator: true,
};

export const WithUpdateMethod: StoryFn<CheckboxSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        mockedProperty: false,
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
  update: {
    method: "updateFn",
  },
};

export const WithRequiredRule = Template.bind({});
WithRequiredRule.args = {
  rules: {
    required: true,
  },
};
