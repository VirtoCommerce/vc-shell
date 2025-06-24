import page from "./pages/DynamicRender";
import { SchemaBaseArgTypes } from "./common/args";
import { Meta, StoryFn } from "@storybook/vue3";
import _ from "lodash";
import { reactive, ref } from "vue";
import { RatingSchema } from "../../..";
import { template, templateWithVisibilityToggle } from "./common/templates";

export default {
  title: "DynamicViews/molecules/VcRating",
  component: page,
  args: {
    id: "RatingFieldId",
    component: "vc-rating",
    property: "mockedProperty",
  },
  argTypes: {
    ..._.pick(SchemaBaseArgTypes, [
      "id",
      "property",
      "label",
      "visibility",
      "tooltip",
      "horizontalSeparator",
      "placeholder",
    ]),
    component: {
      description: "Component type.",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "vc-rating",
        },
        defaultValue: {
          summary: "vc-rating",
        },
      },
    },
    max: {
      description: "Maximal rating size.",
      control: {
        type: "number",
      },
    },
    type: {
      description: "Rating component display variant.",
      control: {
        type: "select",
        options: ["text", "stars", "star-and-text"],
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
} satisfies Meta<RatingSchema>;

export const Template: StoryFn<RatingSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: 5,
      },
    });
    return { args, context };
  },
  template,
});

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: "Rating label",
};

export const WithTooltip = WithLabel.bind({});
WithTooltip.args = {
  label: "Rating label",
  tooltip: "Rating tooltip",
};

export const WithVisibilityMethod: StoryFn<RatingSchema> = (args) => ({
  components: { page },
  setup() {
    const isVisible = ref(false);
    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    const context = reactive({
      item: {
        mockedProperty: 5,
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

export const WithHorizontalSeparator = Template.bind({});
WithHorizontalSeparator.args = {
  label: "Rating label",
  horizontalSeparator: true,
};

export const TextType = Template.bind({});
TextType.args = {
  label: "Rating label",
  type: "text",
};

export const StarsAndTextType = Template.bind({});
StarsAndTextType.args = {
  label: "Rating label",
  type: "star-and-text",
};
