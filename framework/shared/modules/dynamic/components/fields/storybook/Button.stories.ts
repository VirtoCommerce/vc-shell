import { template, templateWithVisibilityToggle } from "./common/templates";
import { Meta, StoryFn } from "@storybook/vue3";
import { computed, reactive, ref } from "vue";
import page from "./pages/DynamicRender";
import * as _ from "lodash-es";
import { SchemaBaseArgTypes } from "./common/args";
import { ButtonSchema } from "../../..";

export default {
  title: "DynamicViews/atoms/VcButton",
  component: page,
  args: {
    id: "buttonId",
    component: "vc-button",
    content: "I am a button",
    method: "runFn",
  },
  argTypes: {
    ..._.pick(SchemaBaseArgTypes, ["id", "disabled", "visibility"]),
    variant: {
      description: "Button variant.",
      control: "radio",
      options: ["primary", "warning", "danger"],
      table: {
        type: {
          summary: "primary | warning | danger",
        },
        defaultValue: {
          summary: "primary",
        },
      },
    },
    content: {
      description: `Button inner text.
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
    component: {
      description: `Component type.`,
      control: "text",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "vc-button",
        },
        defaultValue: {
          summary: "vc-button",
        },
      },
    },
    small: {
      description: "Small sized button.",
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
    raised: {
      description: "Raised button.",
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
    text: {
      description: "Button as text without overlay.",
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
    outline: {
      description: "Outlined button.",
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
    icon: {
      description: "Button icon.",
      control: "text",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    iconSize: {
      description: "Size of the button icon.",
      control: "radio",
      options: ["s", "m", "xs", "l", "xl", "xxl", "xxxl"],
      table: {
        type: {
          summary: "s | m | xs | l | xl | xxl | xxxl",
        },
        defaultValue: {
          summary: "s",
        },
      },
    },
    method: {
      description: `Method to be called when the button is clicked.
      Method should be defined in the blade \`scope\``,
      type: {
        required: true,
        name: "string",
      },
      control: "text",
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
} satisfies Meta<ButtonSchema>;

export const Template: StoryFn<ButtonSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      scope: {
        runFn: () => alert("Button click"),
      },
    });
    return { args, context };
  },
  template,
});

export const Disabled: StoryFn<ButtonSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      scope: {
        runFn: () => alert("Button click"),
        disabledFn: computed(() => true),
      },
    });
    return { args, context };
  },
  template,
});
Disabled.args = {
  disabled: { method: "disabledFn" },
};

export const WithVisibilityMethod: StoryFn<ButtonSchema> = (args) => ({
  components: { page },
  setup: () => {
    const isVisible = ref(false);
    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    const context = reactive({
      scope: {
        runFn: () => alert("Button click"),
        visibilityFn: isVisible,
      },
    });
    return { args, context, toggle };
  },
  template: templateWithVisibilityToggle,
});
WithVisibilityMethod.args = {
  visibility: { method: "visibilityFn" },
};

export const Small = Template.bind({});
Small.args = {
  small: true,
};

export const Text = Template.bind({});
Text.args = {
  text: true,
};

export const Icon = Template.bind({});
Icon.args = {
  icon: "fas fa-truck-moving",
};

export const IconSize = Template.bind({});
IconSize.args = {
  icon: "fas fa-truck-moving",
  iconSize: "xxl",
};

export const Raised = Template.bind({});
Raised.args = {
  raised: true,
};

export const Warning = Template.bind({});
Warning.args = {
  variant: "warning",
};

export const Danger = Template.bind({});
Danger.args = {
  variant: "danger",
};

export const Outline = Template.bind({});
Outline.args = {
  outline: true,
};
