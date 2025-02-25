import { Meta, StoryFn } from "@storybook/vue3";
import { reactive, ref } from "vue";
import page from "./pages/DynamicRender";
import { template, templateWithVisibilityToggle } from "./common/templates";
import * as _ from "lodash-es";
import { SchemaBaseArgTypes } from "./common/args";
import { FieldSchema } from "../../..";

export default {
  title: "DynamicViews/molecules/VcField",
  component: page,
  args: {
    id: "ContentFieldId",
    component: "vc-field",
    property: "mockedProperty",
    variant: "text",
  },
  argTypes: {
    ..._.pick(SchemaBaseArgTypes, ["id", "property", "label", "visibility", "tooltip", "horizontalSeparator"]),
    component: {
      description: "Component type.",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "vc-field",
        },
        defaultValue: {
          summary: "vc-field",
        },
      },
    },
    variant: {
      description: "Field variant.",
      control: "radio",
      options: ["date-ago", "date", "link", "text", "email"],
      table: {
        type: {
          summary: "date-ago | date | link | text | email",
        },
        defaultValue: {
          summary: "text",
        },
      },
    },
    copyable: {
      description: "Whether the field is copyable or not.",
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
    orientation: {
      description: "Field orientation.",
      control: "radio",
      options: ["horizontal", "vertical"],
      table: {
        type: {
          summary: "horizontal | vertical",
        },
        defaultValue: {
          summary: "vertical",
        },
      },
    },
    aspectRatio: {
      description: `Field columns aspect ratio.
      Uses CSS flex-grow property.`,
      control: "object",
      table: {
        type: {
          summary: "[number, number]",
        },
        defaultValue: {
          summary: "[1, 1]",
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
} satisfies Meta<FieldSchema>;

export const Template: StoryFn<FieldSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        mockedProperty: "I am a content field",
      },
    });
    return { args, context };
  },
  template,
});

export const WithLabel: StoryFn<FieldSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        mockedProperty: "I am a content field",
      },
    });
    return { args, context };
  },
  template,
});
WithLabel.args = {
  label: "Field label",
};

export const WithTooltip = WithLabel.bind({});
WithTooltip.args = {
  label: "Field label",
  tooltip: "Field tooltip",
};

export const WithHorizontalOrientation = WithLabel.bind({});
WithHorizontalOrientation.storyName = "Horizontal Orientation";
WithHorizontalOrientation.args = {
  label: "Field label",
  orientation: "horizontal",
};

export const WithAspectRatio = WithLabel.bind({});
WithAspectRatio.storyName = "Horizontal Orientation With Aspect Ratio 1:2";
WithAspectRatio.args = {
  label: "Field label",
  orientation: "horizontal",
  aspectRatio: [1, 2],
};

export const CopyableLink: StoryFn<FieldSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        mockedProperty: "https://virtocommerce.com/",
      },
    });
    return { args, context };
  },
  template,
});
CopyableLink.args = {
  label: "Field label",
  variant: "link",
  copyable: true,
};

export const DateAgo: StoryFn<FieldSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        mockedProperty: new Date("01.01.2024"),
      },
    });
    return { args, context };
  },
  template,
});
DateAgo.args = {
  label: "Field label",
  variant: "date-ago",
};

export const SimpleDate: StoryFn<FieldSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        mockedProperty: new Date(),
      },
    });
    return { args, context };
  },
  template,
});
SimpleDate.storyName = "Date";
SimpleDate.args = {
  label: "Field label",
  variant: "date",
};

export const Email: StoryFn<FieldSchema> = (args) => ({
  components: { page },
  setup: () => {
    const context = reactive({
      item: {
        mockedProperty: "mail@seller.net",
      },
    });
    return { args, context };
  },
  template,
});
Email.args = {
  label: "Field label",
  variant: "email",
};

export const WithVisibilityMethod: StoryFn<FieldSchema> = (args) => ({
  components: { page },
  setup: () => {
    const isVisible = ref(false);
    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    const context = reactive({
      item: {
        mockedProperty: "I am a content field",
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
  label: "Field label",
  visibility: { method: "visibilityFn" },
};

export const WithHorizontalSeparator = Template.bind({});
WithHorizontalSeparator.args = {
  label: "Field label",
  horizontalSeparator: true,
};
