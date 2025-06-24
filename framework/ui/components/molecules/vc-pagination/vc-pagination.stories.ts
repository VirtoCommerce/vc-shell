import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3";
import { VcPagination } from "./";

/**
 * `VcPagination` is a navigation component that enables users to browse through multiple pages of content.
 * It provides a simple and intuitive way to navigate between pages with first, previous, next, and last page controls.
 */
const meta = {
  title: "molecules/VcPagination",
  component: VcPagination,
  tags: ["autodocs"],
  args: {
    pages: 10,
    currentPage: 1,
  },
  argTypes: {
    pages: {
      description: "Total number of pages",
      control: "number",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1" },
        category: "Content",
      },
    },
    currentPage: {
      description: "Current active page",
      control: "number",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1" },
        category: "State",
      },
    },
    expanded: {
      description: "Whether to show more page numbers (not used in current implementation)",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
        category: "Display",
      },
    },
    variant: {
      description: "Visual style variant",
      control: "select",
      options: ["default", "minimal"],
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
        category: "Appearance",
      },
    },
    onItemClick: {
      description: "Event emitted when a page is selected",
      table: {
        category: "Events",
        type: { summary: "(page: number) => void" },
      },
      action: "itemClick",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcPagination component provides navigation controls for multi-page content:

- Shows the current page and allows navigation to other pages
- Adapts to available space with responsive design (shows fewer pages on mobile)
- Includes first, previous, next, and last page controls
- Automatically disables controls when at the first or last page
- Emits events when pages are selected
`,
      },
    },
  },
} satisfies Meta<typeof VcPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default pagination with a few pages
 */
export const Default: Story = {
  args: {
    pages: 5,
    currentPage: 1,
  },
  render: (args) => ({
    components: { VcPagination },
    setup() {
      const currentPage = ref(args.currentPage);

      const handleItemClick = (page: number) => {
        currentPage.value = page;
        args.onItemClick?.(page);
      };

      return {
        args,
        currentPage,
        handleItemClick,
      };
    },
    template: `
      <div style="padding: 20px;">
        <VcPagination
          :pages="args.pages"
          :currentPage="currentPage"
          @itemClick="handleItemClick"
        />
      </div>
    `,
  }),
};

/**
 * Pagination with many pages showing the middle section
 */
export const ManyPages: Story = {
  args: {
    pages: 20,
    currentPage: 7,
  },
  render: (args) => ({
    components: { VcPagination },
    setup() {
      const currentPage = ref(args.currentPage);

      const handleItemClick = (page: number) => {
        currentPage.value = page;
        args.onItemClick?.(page);
      };

      return {
        args,
        currentPage,
        handleItemClick,
      };
    },
    template: `
      <div style="padding: 20px;">
        <VcPagination
          :pages="args.pages"
          :currentPage="currentPage"
          @itemClick="handleItemClick"
        />
      </div>
    `,
  }),
};

/**
 * Pagination at the first page with disabled previous/first page controls
 */
export const FirstPage: Story = {
  args: {
    pages: 10,
    currentPage: 1,
  },
  render: (args) => ({
    components: { VcPagination },
    setup() {
      const currentPage = ref(args.currentPage);

      const handleItemClick = (page: number) => {
        currentPage.value = page;
        args.onItemClick?.(page);
      };

      return {
        args,
        currentPage,
        handleItemClick,
      };
    },
    template: `
      <div style="padding: 20px;">
        <VcPagination
          :pages="args.pages"
          :currentPage="currentPage"
          @itemClick="handleItemClick"
        />
      </div>
    `,
  }),
};

/**
 * Pagination at the last page with disabled next/last page controls
 */
export const LastPage: Story = {
  args: {
    pages: 10,
    currentPage: 10,
  },
  render: (args) => ({
    components: { VcPagination },
    setup() {
      const currentPage = ref(args.currentPage);

      const handleItemClick = (page: number) => {
        currentPage.value = page;
        args.onItemClick?.(page);
      };

      return {
        args,
        currentPage,
        handleItemClick,
      };
    },
    template: `
      <div style="padding: 20px;">
        <VcPagination
          :pages="args.pages"
          :currentPage="currentPage"
          @itemClick="handleItemClick"
        />
      </div>
    `,
  }),
};

/**
 * Interactive example with current page display
 */
export const Interactive: Story = {
  render: () => ({
    components: { VcPagination },
    setup() {
      const pages = 15;
      const currentPage = ref(5);

      const handleItemClick = (page: number) => {
        currentPage.value = page;
      };

      return {
        pages,
        currentPage,
        handleItemClick,
      };
    },
    template: `
      <div style="padding: 20px;">
        <h3 class="tw-mb-4 tw-text-lg">Current Page: {{ currentPage }} of {{ pages }}</h3>
        <VcPagination
          :pages="pages"
          :currentPage="currentPage"
          @itemClick="handleItemClick"
        />
      </div>
    `,
  }),
};
