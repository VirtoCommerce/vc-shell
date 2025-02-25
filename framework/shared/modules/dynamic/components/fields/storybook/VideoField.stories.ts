import { Meta, StoryFn } from "@storybook/vue3";
import { VideoSchema } from "../../..";
import { template, templateWithVisibilityToggle } from "./common/templates";
import page from "./pages/DynamicRender";
import * as _ from "lodash-es";
import { SchemaBaseArgTypes } from "./common/args";
import { reactive, ref } from "vue";

export default {
  title: "DynamicViews/atoms/VcVideo",
  component: page,
  args: {
    id: "videoFieldId",
    component: "vc-video",
    property: "mockedProperty",
  },
  argTypes: {
    ..._.pick(SchemaBaseArgTypes, ["id", "property", "label", "visibility", "tooltip"]),
    component: {
      description: "Component type.",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "vc-video",
        },
        defaultValue: {
          summary: "vc-video",
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
} satisfies Meta<VideoSchema>;

export const Template: StoryFn<VideoSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: "https://www.youtube.com/embed/PeXX-V-dwpA",
      },
    });
    return { args, context };
  },
  template,
});

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: "Video label",
};

export const WithTooltip = Template.bind({});
WithTooltip.args = {
  label: "Video label",
  tooltip: "Video tooltip",
};

export const WithVisibility: StoryFn<VideoSchema> = (args) => ({
  components: { page },
  setup() {
    const isVisible = ref(false);
    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    const context = reactive({
      item: {
        mockedProperty: "https://www.youtube.com/embed/PeXX-V-dwpA",
      },
      scope: {
        visibilityFn: isVisible,
      },
    });
    return { args, context, toggle };
  },
  template: templateWithVisibilityToggle,
});
WithVisibility.args = {
  visibility: {
    method: "visibilityFn",
  },
};
