import { SwitchSchema } from "../../..";
import { Meta, StoryFn } from "@storybook/vue3";
import { SchemaBaseArgTypes } from "./common/args";
import * as _ from "lodash-es";
import page from "./pages/DynamicRender";
import { template, templateWithVisibilityToggle } from "./common/templates";
import { reactive, ref } from "vue";

export default {
  title: "DynamicViews/molecules/VcSwitch",
  component: page,
  args: {
    id: "switchFieldId",
    component: "vc-switch",
    property: "mockedProperty",
  },
  argTypes: {
    ..._.omit(SchemaBaseArgTypes, ["placeholder", "multilanguage"]),
    component: {
      description: "Component type.",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "vc-switch",
        },
        defaultValue: {
          summary: "vc-switch",
        },
      },
    },
    trueValue: {
      description: "Value when switch is on.",
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
      description: "Value when switch is off.",
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
} as Meta<SwitchSchema>;

export const Template: StoryFn<SwitchSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: true,
      },
    });
    return { args, context };
  },
  template,
});

export const InvertedValues = Template.bind({});
InvertedValues.args = {
  trueValue: false,
  falseValue: true,
};

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: "Switch label",
};

export const WithTooltip = WithLabel.bind({});
WithTooltip.args = {
  tooltip: "Switch tooltip",
};

export const WithValidation = Template.bind({});
WithValidation.args = {
  label: "Switch label",
  rules: {
    required: true,
  },
};

export const WithDisabled: StoryFn<SwitchSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: true,
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
  label: "Switch label",
  disabled: {
    method: "disabledFn",
  },
};

export const WithVisibilityMethod: StoryFn<SwitchSchema> = (args) => ({
  components: { page },
  setup() {
    const isVisible = ref(false);
    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    const context = reactive({
      item: {
        mockedProperty: true,
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
  label: "Switch label",
  visibility: {
    method: "visibilityFn",
  },
};

export const WithUpdateMethod: StoryFn<SwitchSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: true,
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
  label: "Switch label",
  update: {
    method: "updateFn",
  },
};

export const WithHorizontalSeparator = Template.bind({});
WithHorizontalSeparator.args = {
  label: "Switch label",
  horizontalSeparator: true,
};
