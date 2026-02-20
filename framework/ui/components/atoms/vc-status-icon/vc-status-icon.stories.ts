import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { VcStatusIcon } from "@ui/components/atoms/vc-status-icon";

/**
 * `VcStatusIcon` is a component that displays a visual status indicator using icons.
 * It provides a simple way to represent success or error states.
 */
const meta: Meta<typeof VcStatusIcon> = {
  title: "Atoms/VcStatusIcon",
  component: VcStatusIcon,
  tags: ["autodocs"],
  argTypes: {
    status: {
      description: "Whether to show success status (true) or error status (false)",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "undefined" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcStatusIcon component provides a visual indicator of status:

- Shows a green check icon for success states
- Shows a blue/info X icon for error/failure states
- Simple boolean prop \`status\` controls which icon is displayed
- Uses Font Awesome icons by default
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VcStatusIcon>;

/**
 * Success status (green check icon)
 */
export const Success: Story = {
  render: (args) => ({
    components: { VcStatusIcon },
    setup() {
      return { args };
    },
    template: '<vc-status-icon v-bind="args"></vc-status-icon>',
  }),
  args: {
    status: true,
  },
};

/**
 * Error status (blue X icon)
 */
export const Error: Story = {
  render: (args) => ({
    components: { VcStatusIcon },
    setup() {
      return { args };
    },
    template: '<vc-status-icon v-bind="args"></vc-status-icon>',
  }),
  args: {
    status: false,
  },
};

/**
 * Both status icons side by side
 */
export const BothStatuses: Story = {
  render: () => ({
    components: { VcStatusIcon },
    template: `
      <div class="tw-flex tw-items-center tw-gap-8">
        <div class="tw-flex tw-flex-col tw-items-center">
          <vc-status-icon :status="true"></vc-status-icon>
          <span class="tw-mt-2 tw-text-sm">Success</span>
        </div>
        <div class="tw-flex tw-flex-col tw-items-center">
          <vc-status-icon :status="false"></vc-status-icon>
          <span class="tw-mt-2 tw-text-sm">Error</span>
        </div>
      </div>
    `,
  }),
};

/**
 * Status icons used within a context
 */
export const InContext: Story = {
  render: () => ({
    components: { VcStatusIcon },
    setup() {
      const items = [
        { id: 1, name: "Database connection", status: true },
        { id: 2, name: "API integration", status: false },
        { id: 3, name: "User authentication", status: true },
        { id: 4, name: "File upload service", status: true },
      ];

      return { items };
    },
    template: `
      <div class="tw-p-4 tw-border tw-border-gray-200 tw-rounded tw-bg-white">
        <h3 class="tw-text-lg tw-font-medium tw-mb-4">System Status</h3>
        <div class="tw-space-y-2">
          <div
            v-for="item in items"
            :key="item.id"
            class="tw-flex tw-justify-between tw-items-center tw-p-2 tw-border-b tw-border-gray-100"
          >
            <span>{{ item.name }}</span>
            <div class="tw-flex tw-items-center">
              <span class="tw-mr-2 tw-text-sm">{{ item.status ? 'Online' : 'Offline' }}</span>
              <vc-status-icon :status="item.status"></vc-status-icon>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};
