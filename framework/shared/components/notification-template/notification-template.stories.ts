import type { Meta, StoryObj } from "@storybook/vue3-vite";
import type { IPushNotification } from "@core/api/platform";
import NotificationTemplate from "@shared/components/notification-template/notification-template.vue";

const now = Date.now();

const makeNotification = (overrides: Partial<IPushNotification> = {}): IPushNotification => ({
  id: "notification-story",
  title: "Product was updated",
  description: "Status changed to Published",
  notifyType: "ProductCreatedDomainEvent",
  isNew: true,
  created: new Date(now - 2 * 60 * 1000),
  ...overrides,
});

const meta = {
  title: "Shared/NotificationTemplate",
  component: NotificationTemplate,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template: `
        <div class="tw-w-[420px] tw-rounded-lg tw-border tw-border-solid tw-border-neutrals-200 tw-bg-additional-50 tw-p-4">
          <story />
        </div>
      `,
    }),
  ],
  args: {
    title: "Product \"Winter Sneakers\" updated",
    notification: makeNotification(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Base template for push-notification rendering. Used by vendor-portal event components to display title, timestamp and optional details slot.",
      },
    },
  },
} satisfies Meta<typeof NotificationTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Recent: Story = {};

export const WithDetailsSlot: Story = {
  render: (args) => ({
    components: { NotificationTemplate },
    setup() {
      return { args };
    },
    template: `
      <NotificationTemplate v-bind="args">
        <p class="tw-m-0 tw-text-xs tw-text-neutrals-600">
          Seller profile: Sports & Outdoor. Click to open details blade.
        </p>
      </NotificationTemplate>
    `,
  }),
};

export const OneHourAgo: Story = {
  args: {
    title: "Offer approval required",
    notification: makeNotification({
      id: "notification-story-hour",
      created: new Date(now - 60 * 60 * 1000),
      description: "A manager needs to review this offer.",
    }),
  },
};

export const OldNotification: Story = {
  args: {
    title: "Order imported",
    notification: makeNotification({
      id: "notification-story-old",
      created: new Date(now - 4 * 24 * 60 * 60 * 1000),
      description: "Imported from external marketplace.",
    }),
  },
};

export const WithoutCreatedDate: Story = {
  args: {
    title: "Background sync completed",
    notification: makeNotification({
      id: "notification-story-no-date",
      created: undefined,
    }),
  },
};
