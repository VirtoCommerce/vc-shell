import type { Meta, StoryObj } from "@storybook/vue3";
import { VcEditor } from "./";
import { ref } from "vue";

const meta = {
  title: "molecules/VcEditor",
  component: VcEditor,
  tags: ["autodocs"],
  args: {
    assetsFolder: "uploads",
    placeholder: "Start typing here...",
  },
  argTypes: {
    modelValue: {
      description: "Content of the editor",
      control: "text",
      table: {
        type: { summary: "string" },
        category: "Model",
      },
    },
    label: {
      description: "Label text for the editor",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    placeholder: {
      description: "Placeholder text when editor is empty",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    required: {
      description: "Whether the editor is required",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    disabled: {
      description: "Whether the editor is disabled",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    tooltip: {
      description: "Tooltip text for the editor label",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    errorMessage: {
      description: "Error message to display",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    assetsFolder: {
      description: "Folder path for uploaded assets",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "uploads" },
      },
    },
    multilanguage: {
      description: "Whether the editor supports multiple languages",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    currentLanguage: {
      description: "Current selected language code",
      control: "text",
      table: {
        type: { summary: "string" },
      },
    },
    maxlength: {
      description: "Maximum number of characters allowed",
      control: "number",
      table: {
        type: { summary: "number" },
      },
    },
    toolbar: {
      description: "Custom toolbar configuration",
      control: "object",
      table: {
        type: { summary: "ToolbarNames[]" },
      },
    },
    "onUpdate:modelValue": {
      description: "Emitted when content changes",
      action: "updated",
      table: {
        type: { summary: "(value: string) => void" },
        category: "Events",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcEditor component is a rich Markdown editor built on top of tiptap with additional features:

- Full Markdown support with live preview
- Image upload functionality
- Customizable toolbar
- Error handling and validation

This component is ideal for content management, blog posts, documentation, and any other rich text editing needs.
        `,
      },
    },
  },
} satisfies Meta<typeof VcEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { VcEditor },
    setup() {
      const content = ref("");
      return { args, content };
    },
    template: '<vc-editor v-bind="args" v-model="content"></vc-editor>',
  }),
};

export const WithLabel: Story = {
  args: {
    label: "Description",
  },
  render: (args) => ({
    components: { VcEditor },
    setup() {
      const content = ref("");
      return { args, content };
    },
    template: '<vc-editor v-bind="args" v-model="content"></vc-editor>',
  }),
};

export const Required: Story = {
  args: {
    label: "Required Field",
    required: true,
  },
  render: (args) => ({
    components: { VcEditor },
    setup() {
      const content = ref("");
      return { args, content };
    },
    template: '<vc-editor v-bind="args" v-model="content"></vc-editor>',
  }),
};

export const WithError: Story = {
  args: {
    label: "Description",
    errorMessage: "This field is required",
  },
  render: (args) => ({
    components: { VcEditor },
    setup() {
      const content = ref("");
      return { args, content };
    },
    template: '<vc-editor v-bind="args" v-model="content"></vc-editor>',
  }),
};

export const Disabled: Story = {
  args: {
    label: "Disabled Editor",
    disabled: true,
    modelValue: "# This editor is disabled\n\nYou cannot edit this content.",
  },
  render: (args) => ({
    components: { VcEditor },
    setup() {
      const content = ref(args.modelValue);
      return { args, content };
    },
    template: '<vc-editor v-bind="args" v-model="content"></vc-editor>',
  }),
};

export const WithTooltip: Story = {
  args: {
    label: "Content",
    tooltip: "Enter the main content for your article here",
  },
  render: (args) => ({
    components: { VcEditor },
    setup() {
      const content = ref("");
      return { args, content };
    },
    template: '<vc-editor v-bind="args" v-model="content"></vc-editor>',
  }),
};

export const WithInitialContent: Story = {
  args: {
    label: "Editor with content",
    modelValue:
      "# Hello World\n\nThis is a **markdown** editor with _initial content_.\n\n- List item 1\n- List item 2\n- List item 3",
  },
  render: (args) => ({
    components: { VcEditor },
    setup() {
      const content = ref(args.modelValue);
      return { args, content };
    },
    template: '<vc-editor v-bind="args" v-model="content"></vc-editor>',
  }),
};

export const CustomToolbar: Story = {
  args: {
    label: "Editor with custom toolbar",
    toolbar: ["bold", "italic", "title", "link", "image", "preview"],
  },
  render: (args) => ({
    components: { VcEditor },
    setup() {
      const content = ref("");
      return { args, content };
    },
    template: '<vc-editor v-bind="args" v-model="content"></vc-editor>',
  }),
};
