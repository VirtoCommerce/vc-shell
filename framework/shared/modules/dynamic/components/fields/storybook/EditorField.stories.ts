import { Meta, StoryFn } from "@storybook/vue3";
import EditorField from "../EditorField";
import { template, templateWithVisibilityToggle } from "./common/templates";
import page from "./pages/DynamicRender";
import { nextTick, reactive, ref } from "vue";
import * as _ from "lodash-es";
import { SchemaBaseArgTypes } from "./common/args";
import { EditorSchema } from "../../..";

export default {
  title: "DynamicViews/molecules/VcEditor",
  component: page,
  args: {
    id: "EditorId",
    component: "vc-editor",
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
          summary: "vc-field",
        },
        defaultValue: {
          summary: "vc-field",
        },
      },
    },
    assetsFolder: {
      description: "Assets folder for the editor image uploads.",
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
  },
  parameters: {
    docs: {
      canvas: {
        sourceState: "none",
      },
    },
  },
} satisfies Meta<EditorSchema>;

export const Template: StoryFn<EditorSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        id: "some-alpha-num-id",
        mockedProperty: "I am an editor",
      },
    });
    return { args, context };
  },
  template,
});

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: "Editor label",
};

export const WithTooltip = WithLabel.bind({});
WithTooltip.args = {
  label: "Editor label",
  tooltip: "I am a tooltip",
};

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  label: "Editor label",
  placeholder: "I am a placeholder",
};

export const WithValidation: StoryFn<EditorSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        id: "some-alpha-num-id",
        mockedProperty: null,
      },
    });
    return { args, context };
  },
  template,
});
WithValidation.args = {
  label: "Editor label",
  rules: { required: true },
  placeholder: "I am a placeholder",
};

export const WithDisabled: StoryFn<EditorSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        id: "some-alpha-num-id",
        mockedProperty: "I am an editor",
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
  label: "Editor label",
  disabled: {
    method: "disabledFn",
  },
};

export const WithVisibilityMethod: StoryFn<EditorSchema> = (args) => ({
  components: { page },
  setup() {
    const isVisible = ref(false);
    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    const context = reactive({
      item: {
        id: "some-alpha-num-id",
        mockedProperty: "I am an editor",
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
  label: "Editor label",
  visibility: {
    method: "visibilityFn",
  },
};

export const WithUpdateMethod: StoryFn<EditorSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        id: "some-alpha-num-id",
        mockedProperty: undefined,
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
  label: "Editor label",
  update: {
    method: "updateFn",
  },
};

export const WithHorizontalSeparator = Template.bind({});
WithHorizontalSeparator.args = {
  label: "Editor label",
  horizontalSeparator: true,
};
