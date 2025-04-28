import { Meta, StoryFn } from "@storybook/vue3";
import { SchemaBaseArgTypes } from "./common/args";
import * as _ from "lodash-es";
import page from "./pages/DynamicRender";
import { template, templateWithVisibilityToggle } from "./common/templates";
import { computed, reactive, ref } from "vue";
import { StatusSchema } from "../../..";

export default {
  title: "DynamicViews/molecules/VcStatus",
  component: page,
  args: {
    id: "statusFieldId",
    component: "vc-status",
    content: "Success status",
    variant: "success",
  },
  argTypes: {
    ..._.pick(SchemaBaseArgTypes, ["id", "visibility", "horizontalSeparator"]),
    component: {
      description: "Component type for status.",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "vc-status",
        },
        defaultValue: {
          summary: "vc-status",
        },
      },
    },
    outline: {
      description: "Whether the status is outlined or not.",
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "true",
        },
      },
    },
    extend: {
      description: `Whether the status is extendable or not.`,
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "false",
        },
      },
    },
    variant: {
      description: "Status variant.",
      table: {
        type: {
          summary: "info | warning | danger | success | light-danger",
        },
        defaultValue: {
          summary: "info",
        },
      },
    },
    icon: {
      description: "Status icon.",
      control: "text",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    iconSize: {
      description: "Status icon size.",
      control: "radio",
      options: ["xs", "s", "m", "l", "xl", "xxl", "xxxl"],
      table: {
        type: {
          summary: `xs | s | m | l | xl | xxl | xxxl`,
        },
        defaultValue: {
          summary: "m",
        },
      },
    },
    iconVariant: {
      description: "Status icon variant.",
      control: "radio",
      options: ["warning", "danger", "success"],
      table: {
        type: {
          summary: "warning | danger | success",
        },
      },
    },
    title: {
      description: `Status title.
      Supports i18n keys.`,
      table: {
        type: {
          summary: "string",
        },
      },
    },
    content: {
      description: `Used to display the content of the status. It can be a \`string\` or an \`object with a method property\`.
      Method property could be a function or \`computed property\` or \`ref\`, returning a \`string\` value.
      Method should be defined in the blade \`scope\`.
      `,
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "{ method: string } | string",
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
} satisfies Meta<StatusSchema>;

export const Template: StoryFn<StatusSchema> = (args) => ({
  components: { page },
  setup() {
    return { args };
  },
  template,
});

export const ContentAsMethod: StoryFn<StatusSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      scope: {
        mockedMethod: () => "I am status content",
      },
    });
    return { args, context };
  },
  template,
});
ContentAsMethod.args = {
  content: { method: "mockedMethod" },
};

export const ContentAsComputed: StoryFn<StatusSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      scope: {
        mockedComputed: computed(() => "I am status content"),
      },
    });
    return { args, context };
  },
  template,
});
ContentAsComputed.args = {
  content: { method: "mockedComputed" },
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  icon: "material-check",
};

export const ExtendedWithTitle = Template.bind({});
ExtendedWithTitle.args = {
  extend: true,
  title: "Extended status",
  icon: "material-check",
};

export const WithVisibilityMethod: StoryFn<StatusSchema> = (args) => ({
  components: { page },
  setup() {
    const isVisible = ref(false);
    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    const context = reactive({
      scope: {
        visibilityFn: isVisible,
      },
    });
    return { args, context, toggle };
  },
  template: templateWithVisibilityToggle,
});
