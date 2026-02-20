import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcEditor, type CustomToolbarButton, type CustomToolbarDropdown } from "@ui/components/molecules/vc-editor";
import { ref, defineComponent, h } from "vue";
import type { Editor } from "@tiptap/vue-3";

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
    toolbar: ["bold", "italic", "heading1", "heading2", "link", "image", "fontSize"],
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

export const WithCustomButtons: Story = {
  args: {
    label: "Editor with custom plugin buttons",
    customButtons: [
      {
        id: "clear-format",
        label: "Clear Format",
        icon: "lucide-remove-formatting",
        action: (editor: Editor) => {
          editor.chain().focus().clearNodes().unsetAllMarks().run();
        },
        isActive: () => false,
        group: "format",
        order: 1,
      } as CustomToolbarButton,
      {
        id: "highlight",
        label: "Highlight",
        icon: "lucide-highlighter",
        action: (editor: Editor) => {
          editor.chain().focus().toggleHighlight().run();
        },
        isActive: (editor: Editor) => editor.isActive('highlight'),
        group: "format",
        order: 2,
      } as CustomToolbarButton,
      {
        id: "text-align",
        label: "Text Align",
        options: [
          { value: 'left', label: 'Left', action: (editor: Editor) => editor.chain().focus().setTextAlign('left').run() },
          { value: 'center', label: 'Center', action: (editor: Editor) => editor.chain().focus().setTextAlign('center').run() },
          { value: 'right', label: 'Right', action: (editor: Editor) => editor.chain().focus().setTextAlign('right').run() },
          { value: 'justify', label: 'Justify', action: (editor: Editor) => editor.chain().focus().setTextAlign('justify').run() },
        ],
        getValue: (editor: Editor) => editor.getAttributes('paragraph').textAlign || 'left',
        group: "align",
        order: 1,
      } as CustomToolbarDropdown,
    ],
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

// Custom component example
const CustomEmojiButton = defineComponent({
  props: {
    editor: {
      type: Object as () => Editor,
      required: true,
    },
    disabled: Boolean,
  },
  setup(props) {
    const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'];
    const showPicker = ref(false);
    
    const insertEmoji = (emoji: string) => {
      props.editor.chain().focus().insertContent(emoji).run();
      showPicker.value = false;
    };
    
    return () => h('div', { class: 'emoji-picker', style: { position: 'relative' } }, [
      h('button', {
        class: 'vc-editor-button',
        disabled: props.disabled,
        onClick: () => showPicker.value = !showPicker.value,
        style: {
          padding: '0.25rem 0.5rem',
          borderRadius: '6px',
          border: 'none',
          background: 'transparent',
          cursor: props.disabled ? 'not-allowed' : 'pointer',
        }
      }, '😊'),
      showPicker.value && h('div', {
        class: 'emoji-picker-menu',
        style: {
          position: 'absolute',
          top: '100%',
          left: 0,
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '6px',
          padding: '0.5rem',
          display: 'flex',
          gap: '0.25rem',
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }
      }, emojis.map(emoji => 
        h('button', {
          onClick: () => insertEmoji(emoji),
          style: {
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '1.25rem',
            padding: '0.25rem',
          }
        }, emoji)
      ))
    ]);
  },
});

export const WithCustomComponent: Story = {
  args: {
    label: "Editor with custom component plugin",
    customButtons: [
      {
        id: "emoji",
        label: "Insert Emoji",
        icon: "lucide-smile",
        action: () => {}, // Not used when component is provided
        component: CustomEmojiButton,
        group: "insert",
        order: 1,
      } as CustomToolbarButton,
      {
        id: "word-count",
        label: "Word Count",
        icon: "lucide-file-text",
        action: (editor: Editor) => {
          const text = editor.getText();
          const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
          alert(`Word count: ${wordCount}`);
        },
        group: "tools",
        order: 1,
      } as CustomToolbarButton,
    ],
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

export const WithTipTapExtensions: Story = {
  args: {
    label: "Editor with custom TipTap extensions",
    extensions: [
      // Add any custom TipTap extensions here
      // For example: Highlight.configure({ multicolor: true })
    ],
  },
  render: (args) => ({
    components: { VcEditor },
    setup() {
      const content = ref("# Custom Extensions\n\nYou can add any TipTap extension to enhance the editor functionality.");
      return { args, content };
    },
    template: '<vc-editor v-bind="args" v-model="content"></vc-editor>',
  }),
};
