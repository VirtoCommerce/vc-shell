import { ref, defineComponent } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3";
import { VcToast } from ".";
import { notification } from "../../../../shared/components/notifications";

/**
 * `VcToast` is a component for displaying toast notifications to users.
 * It supports different types (success, error, warning, info) and configurable timeout behavior.
 */
const meta = {
  title: "molecules/VcToast",
  component: VcToast,
  tags: ["autodocs"],
  args: {
    content: "This is a notification message",
    type: "default",
    timeout: 5000,
    pauseOnHover: true,
  },
  argTypes: {
    content: {
      description: "The content to display in the notification. Can be a string or a component",
      control: "text",
      table: {
        type: { summary: "string | Component" },
        category: "Content",
      },
    },
    notificationId: {
      description: "Unique identifier for the notification",
      control: "text",
      table: {
        type: { summary: "number | string" },
        category: "Identification",
      },
    },
    updateId: {
      description: "ID used to trigger updates to the notification",
      control: "text",
      table: {
        type: { summary: "number | string" },
        category: "Identification",
      },
    },
    type: {
      description: "The type of notification which determines the icon and color",
      control: "select",
      options: ["default", "success", "error", "warning"],
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
        category: "Appearance",
      },
    },
    timeout: {
      description:
        "Duration in milliseconds before the notification auto-dismisses. Set to false to disable auto-dismiss",
      control: "number",
      table: {
        type: { summary: "number | boolean" },
        defaultValue: { summary: "5000" },
        category: "Behavior",
      },
    },
    pauseOnHover: {
      description: "Whether to pause the timeout when hovering over the notification",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
        category: "Behavior",
      },
    },
    limit: {
      description: "Maximum number of lines to display",
      control: "number",
      table: {
        type: { summary: "number" },
        category: "Content",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcToast component is used to display important messages to users.

Features:
- Multiple notification types (info, success, error, warning)
- Auto-dismiss with configurable timeout
- Pause timeout on hover
- Custom content support
- Animated transitions

## Using with the Notification Service

The component can be used directly as shown in the examples, but for application-wide notifications,
use the notification service:

\`\`\`js
import { notification } from "framework/shared/components/notifications";

// Show a notification
notification("Default notification message");

// Show a success notification
notification.success("Success message");

// Show an error notification
notification.error("Error message");

// Show a warning notification
notification.warning("Warning message");

// Update a notification
const id = notification("Initial message");
notification.update(id, {
  content: "Updated message",
  type: "success"
});

// Remove a specific notification
notification.remove(id);

// Remove all notifications
notification.clearAll();

// Set default position (top-center, top-right, top-left, bottom-center, bottom-right, bottom-left)
notification.setPosition("top-right");
\`\`\`
`,
      },
    },
  },
} satisfies Meta<typeof VcToast>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default notification with basic information
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcToast },
    setup() {
      return {
        args: { ...args, notificationId: 1 },
      };
    },
    template: `
      <div style="padding: 20px;">
        <VcToast v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Success notification for positive feedback
 */
export const Success: Story = {
  args: {
    content: "Operation completed successfully!",
    type: "success",
  },
  render: (args) => ({
    components: { VcToast },
    setup() {
      return {
        args: { ...args, notificationId: 2 },
      };
    },
    template: `
      <div style="padding: 20px;">
        <VcToast v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Error notification for error messages
 */
export const Error: Story = {
  args: {
    content: "An error occurred while processing your request.",
    type: "error",
  },
  render: (args) => ({
    components: { VcToast },
    setup() {
      return {
        args: { ...args, notificationId: 3 },
      };
    },
    template: `
      <div style="padding: 20px;">
        <VcToast v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Warning notification for warning messages
 */
export const Warning: Story = {
  args: {
    content: "Please note this action cannot be undone.",
    type: "warning",
  },
  render: (args) => ({
    components: { VcToast },
    setup() {
      return {
        args: { ...args, notificationId: 4 },
      };
    },
    template: `
      <div style="padding: 20px;">
        <VcToast v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Notification with no auto-dismiss
 */
export const NoTimeout: Story = {
  args: {
    content: "This notification will not auto-dismiss.",
    timeout: false,
  },
  render: (args) => ({
    components: { VcToast },
    setup() {
      return {
        args: { ...args, notificationId: 5 },
      };
    },
    template: `
      <div style="padding: 20px;">
        <VcToast v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Notification with very short timeout
 */
export const ShortTimeout: Story = {
  args: {
    content: "This notification will dismiss in 2 seconds.",
    timeout: 2000,
  },
  render: (args) => ({
    components: { VcToast },
    setup() {
      return {
        args: { ...args, notificationId: 6 },
      };
    },
    template: `
      <div style="padding: 20px;">
        <VcToast v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Notification with long content
 */
export const LongContent: Story = {
  args: {
    content:
      "This is a notification with very long content. It demonstrates how the component handles text that spans multiple lines. The notification should maintain its readability and structure even with longer messages. This helps ensure that important information is still conveyed effectively to the user.",
  },
  render: (args) => ({
    components: { VcToast },
    setup() {
      return {
        args: { ...args, notificationId: 7 },
      };
    },
    template: `
      <div style="padding: 20px;">
        <VcToast v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Using a custom component as content
 */
export const CustomContent: Story = {
  render: (args) => ({
    components: { VcToast },
    setup() {
      const CustomComponent = defineComponent({
        name: "CustomNotificationContent",
        template: `
          <div>
            <h3 class="tw-text-base tw-font-bold tw-mb-1">Custom Notification Title</h3>
            <p class="tw-text-sm tw-mb-2">This is a notification with custom component content.</p>
            <button class="tw-bg-primary-500 tw-text-white tw-px-2 tw-py-1 tw-rounded tw-text-xs">Take Action</button>
          </div>
        `,
      });

      return {
        args: {
          ...args,
          notificationId: 8,
          content: CustomComponent,
        },
      };
    },
    template: `
      <div style="padding: 20px;">
        <VcToast v-bind="args" />
      </div>
    `,
  }),
};

/**
 * Multiple notifications stacked
 */
export const MultipleNotifications: Story = {
  render: () => ({
    components: { VcToast },
    setup() {
      return {};
    },
    template: `
      <div style="padding: 20px; display: flex; flex-direction: column; gap: 10px;">
        <VcToast
          content="This is an info notification"
          type="default"
          :timeout="5000"
          :pauseOnHover="true"
          notificationId="n1"
        />
        <VcToast
          content="This is a success notification"
          type="success"
          :timeout="7000"
          :pauseOnHover="true"
          notificationId="n2"
        />
        <VcToast
          content="This is an error notification"
          type="error"
          :timeout="9000"
          :pauseOnHover="true"
          notificationId="n3"
        />
      </div>
    `,
  }),
};

/**
 * Using the notification service
 */
export const NotificationService: Story = {
  render: () => ({
    setup() {
      const showInfo = () => {
        notification("This is an info notification");
      };

      const showSuccess = () => {
        notification.success("Operation completed successfully!");
      };

      const showError = () => {
        notification.error("An error occurred while processing your request.");
      };

      const showWarning = () => {
        notification.warning("Please note this action cannot be undone.");
      };

      const showPersistent = () => {
        notification("This notification will not auto-dismiss.", { timeout: false });
      };

      const clearAll = () => {
        notification.clearAll();
      };

      const setTopRight = () => {
        notification.setPosition("top-right");
        notification.success("Position changed to top-right");
      };

      const setTopCenter = () => {
        notification.setPosition("top-center");
        notification.success("Position changed to top-center");
      };

      const setBottomRight = () => {
        notification.setPosition("bottom-right");
        notification.success("Position changed to bottom-right");
      };

      return {
        showInfo,
        showSuccess,
        showError,
        showWarning,
        showPersistent,
        clearAll,
        setTopRight,
        setTopCenter,
        setBottomRight,
      };
    },
    template: `
      <div style="padding: 20px;">
        <h3 class="tw-text-lg tw-font-bold tw-mb-3">Notification Service Demo</h3>
        <p class="tw-mb-4">Click the buttons to see different notifications in action.</p>

        <div class="tw-flex tw-flex-wrap tw-gap-2">
          <button @click="showInfo" class="tw-bg-info-500 tw-text-white tw-px-3 tw-py-2 tw-rounded">
            Show Info
          </button>
          <button @click="showSuccess" class="tw-bg-success-500 tw-text-white tw-px-3 tw-py-2 tw-rounded">
            Show Success
          </button>
          <button @click="showError" class="tw-bg-danger-500 tw-text-white tw-px-3 tw-py-2 tw-rounded">
            Show Error
          </button>
          <button @click="showWarning" class="tw-bg-warning-500 tw-text-white tw-px-3 tw-py-2 tw-rounded">
            Show Warning
          </button>
          <button @click="showPersistent" class="tw-bg-neutrals-500 tw-text-white tw-px-3 tw-py-2 tw-rounded">
            Show Persistent
          </button>
          <button @click="clearAll" class="tw-bg-secondary-500 tw-text-white tw-px-3 tw-py-2 tw-rounded">
            Clear All
          </button>
        </div>

        <h4 class="tw-text-md tw-font-bold tw-mt-6 tw-mb-3">Change Position</h4>
        <div class="tw-flex tw-flex-wrap tw-gap-2">
          <button @click="setTopCenter" class="tw-bg-primary-500 tw-text-white tw-px-3 tw-py-2 tw-rounded">
            Top Center
          </button>
          <button @click="setTopRight" class="tw-bg-primary-500 tw-text-white tw-px-3 tw-py-2 tw-rounded">
            Top Right
          </button>
          <button @click="setBottomRight" class="tw-bg-primary-500 tw-text-white tw-px-3 tw-py-2 tw-rounded">
            Bottom Right
          </button>
        </div>
      </div>
    `,
  }),
};

/**
 * Advanced notification service example with update and custom component
 */
export const AdvancedNotificationService: Story = {
  render: () => ({
    setup() {
      interface NotificationIds {
        updateExample?: string | number;
      }

      const notificationIds = ref<NotificationIds>({});

      const showUpdateExample = () => {
        const id = notification("Initial notification message...", {
          timeout: false,
        });
        notificationIds.value.updateExample = id;
      };

      const updateNotification = () => {
        if (notificationIds.value.updateExample) {
          notification.update(notificationIds.value.updateExample, {
            content: "Updated notification message!",
            type: "success",
            timeout: 5000,
          });
        } else {
          notification.warning("Please show the notification first");
        }
      };

      const showCustomComponent = () => {
        // Create a simple interactive component
        const InteractiveComponent = defineComponent({
          name: "InteractiveNotification",
          setup() {
            const handleClick = () => {
              notification.success("Button in notification was clicked!");
            };

            return { handleClick };
          },
          template: `
            <div>
              <h3 class="tw-text-base tw-font-bold tw-mb-1">Interactive Notification</h3>
              <p class="tw-text-sm tw-mb-2">This notification contains an interactive component.</p>
              <button @click="handleClick" class="tw-bg-primary-500 tw-text-white tw-px-2 tw-py-1 tw-rounded tw-text-xs">
                Click Me
              </button>
            </div>
          `,
        });

        notification(InteractiveComponent, {
          timeout: 10000,
          pauseOnHover: true,
        });
      };

      return {
        showUpdateExample,
        updateNotification,
        showCustomComponent,
      };
    },
    template: `
      <div style="padding: 20px;">
        <h3 class="tw-text-lg tw-font-bold tw-mb-3">Advanced Notification Service Demo</h3>

        <div class="tw-mb-6">
          <h4 class="tw-text-md tw-font-semibold tw-mb-2">Update Notification Example</h4>
          <div class="tw-flex tw-gap-2">
            <button @click="showUpdateExample" class="tw-bg-primary-500 tw-text-white tw-px-3 tw-py-2 tw-rounded">
              Show Notification
            </button>
            <button @click="updateNotification" class="tw-bg-success-500 tw-text-white tw-px-3 tw-py-2 tw-rounded">
              Update Notification
            </button>
          </div>
        </div>

        <div class="tw-mb-6">
          <h4 class="tw-text-md tw-font-semibold tw-mb-2">Custom Component Example</h4>
          <button @click="showCustomComponent" class="tw-bg-primary-500 tw-text-white tw-px-3 tw-py-2 tw-rounded">
            Show Interactive Notification
          </button>
        </div>
      </div>
    `,
  }),
};
