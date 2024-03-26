import { Meta, StoryFn } from "@storybook/vue3";
import { ImageSchema } from "../../..";
import { template, templateWithVisibilityToggle } from "./common/templates";
import page from "./pages/DynamicRender";
import { ref, reactive } from "vue";
import * as _ from "lodash-es";
import { SchemaBaseArgTypes } from "./common/args";

export default {
  title: "DynamicViews/atoms/VcImage",
  component: page,
  args: {
    id: "imageId",
    component: "vc-image",
    property: "mockedProperty",
    size: "xxl",
  },
  argTypes: {
    ..._.pick(SchemaBaseArgTypes, ["id", "property", "visibility"]),
    component: {
      description: "Component type.",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "vc-image",
        },
        defaultValue: {
          summary: "vc-image",
        },
      },
    },
    aspect: {
      description: "Aspect ratio of the image.",
      control: "radio",
      options: ["1x1", "16x9", "4x3", "3x2"],
      table: {
        type: {
          summary: "1x1 | 16x9 | 4x3 | 3x2",
        },
        defaultValue: {
          summary: "1x1",
        },
      },
    },
    size: {
      description: "Size of the image.",
      control: "radio",
      options: ["auto", "xs", "s", "m", "l", "xl", "xxl"],
      table: {
        type: {
          summary: "auto | xs | s | m | l | xl | xxl",
        },
        defaultValue: {
          summary: "auto",
        },
      },
    },
    background: {
      description: "Size of the element's background image. Accepts auto, cover, contain CSS background-size value.",
      control: "radio",
      options: ["auto", "contain", "cover"],
      table: {
        type: {
          summary: "auto | contain | cover",
        },
        defaultValue: {
          summary: "cover",
        },
      },
    },
    rounded: {
      description: "Rounded image.",
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
    bordered: {
      description: "Bordered image.",
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
  },
  parameters: {
    docs: {
      canvas: {
        sourceState: "none",
      },
    },
  },
} satisfies Meta<ImageSchema>;

export const Template: StoryFn<ImageSchema> = (args) => ({
  props: args,
  components: { page },
  setup() {
    const context = {
      item: {
        mockedProperty: "https://picsum.photos/200",
      },
    };

    return {
      args,
      context,
    };
  },
  template,
});

export const Rounded = Template.bind({});
Rounded.args = {
  rounded: true,
};

export const Bordered = Template.bind({});
Bordered.args = {
  bordered: true,
};

export const Aspect16x9 = Template.bind({});
Aspect16x9.args = {
  aspect: "16x9",
};

export const Aspect4x3 = Template.bind({});
Aspect4x3.args = {
  aspect: "4x3",
};

export const Aspect3x2 = Template.bind({});
Aspect3x2.args = {
  aspect: "3x2",
};

export const ExtraSmall = Template.bind({});
ExtraSmall.args = {
  size: "xs",
};

export const WithVisibilityMethod: StoryFn<ImageSchema> = (args) => ({
  props: args,
  components: { page },
  setup() {
    const isVisible = ref(false);
    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    const context = reactive({
      item: {
        mockedProperty: "https://picsum.photos/200",
      },
      scope: {
        visibilityMethod: isVisible,
      },
    });

    return {
      args,
      context,
      toggle,
    };
  },
  template: templateWithVisibilityToggle,
});
WithVisibilityMethod.args = {
  visibility: {
    method: "visibilityMethod",
  },
};
