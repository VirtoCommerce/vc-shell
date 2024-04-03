import { template, templateWithVisibilityToggle } from "./common/templates";
import { Meta, StoryFn } from "@storybook/vue3";
import { reactive, ref } from "vue";
import page from "./pages/DynamicRender";
import * as _ from "lodash-es";
import { SchemaBaseArgTypes } from "./common/args";
import { CardSchema } from "../../..";

export default {
  title: "DynamicViews/atoms/VcCard",
  component: page,
  args: {
    id: "cardId",
    component: "vc-card",
    label: "Card Title",
    fields: [
      {
        id: "fieldId",
        component: "vc-input",
        label: "Input field",
        placeholder: "Enter text here",
        property: "mockedProperty",
      },
    ],
  },
  argTypes: {
    ..._.pick(SchemaBaseArgTypes, ["id", "disabled", "visibility"]),
    component: {
      description: "Component type.",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "vc-card",
        },
        defaultValue: {
          summary: "vc-card",
        },
      },
    },
    fields: {
      description: "Array of control schemas for the fields in the card.",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "ControlSchema[]",
        },
      },
    },
    collapsible: {
      description: "Whether the card is collapsible or not.",
      control: "boolean",
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
    collapsed: {
      description: "Whether the card is collapsed or not.",
      control: "boolean",
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
    removePadding: {
      description: "Remove padding from card.",
      control: "boolean",
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
    action: {
      description: "Action button to be displayed in card.",
      table: {
        type: {
          summary: "ButtonSchema",
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
} satisfies Meta<CardSchema>;

export const Template: StoryFn<CardSchema> = (args) => ({
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

export const EmptyCard = Template.bind({});
EmptyCard.args = {
  fields: [],
};

export const Collapsible = Template.bind({});
Collapsible.args = {
  collapsible: true,
};

export const Collapsed = Template.bind({});
Collapsed.args = {
  collapsed: true,
  collapsible: true,
};

export const WithoutPadding = Template.bind({});
WithoutPadding.args = {
  removePadding: true,
};

export const WithAction = Template.bind({});
WithAction.args = {
  action: {
    id: "actionId",
    component: "vc-button",
    content: "Action",
    method: "runFn",
    small: true,
    variant: "danger",
  },
};

export const WithVisibilityMethod: StoryFn<CardSchema> = (args) => ({
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
