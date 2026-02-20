import { defineComponent, provide } from "vue";
import type { PropType } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import NotificationDropdown from "@shared/components/notification-dropdown/notification-dropdown.vue";
import { NotificationTemplate } from "@shared/components/notification-template";
import { useNotifications } from "@core/composables/useNotifications";
import { NotificationTemplatesKey } from "@framework/injection-keys";
import { PushNotification } from "@core/api/platform";
import type { NotificationTemplateConstructor } from "@core/types";

function seedStoryNotifications() {
  const { addNotification } = useNotifications();

  addNotification(
    new PushNotification({
      id: "story-notification-1",
      notifyType: "OfferCreatedDomainEvent",
      title: "Offer #1024 changed status",
      description: "Published successfully",
      isNew: false,
      created: new Date(Date.now() - 1000 * 60 * 3),
    }),
  );

  addNotification(
    new PushNotification({
      id: "story-notification-2",
      notifyType: "SystemMessage",
      title: "Catalog synchronization finished",
      description: "12 products were updated.",
      isNew: false,
      created: new Date(Date.now() - 1000 * 60 * 40),
    }),
  );
}

const OfferNotificationTemplate = defineComponent({
  name: "OfferNotificationTemplate",
  components: { NotificationTemplate },
  props: {
    notification: {
      type: Object as PropType<PushNotification>,
      required: true,
    },
  },
  template: `
    <NotificationTemplate
      :title="notification.title ?? ''"
      :notification="notification"
    >
      <p class="tw-m-0 tw-text-xs tw-text-success-600">
        Offer event: {{ notification.description }}
      </p>
    </NotificationTemplate>
  `,
}) as NotificationTemplateConstructor;

OfferNotificationTemplate.notifyType = "OfferCreatedDomainEvent";

const meta = {
  title: "Shared/NotificationDropdown",
  component: NotificationDropdown,
  tags: ["autodocs"],
  decorators: [
    () => ({
      setup() {
        seedStoryNotifications();
      },
      template: `
        <div class="tw-w-[420px] tw-rounded-lg tw-border tw-border-solid tw-border-neutrals-200 tw-bg-additional-50 tw-p-2">
          <story />
        </div>
      `,
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Shell notification dropdown backed by `useNotifications()`. Story seeds shared notification state and demonstrates default/fallback and custom notify-type templates.",
      },
    },
  },
} satisfies Meta<typeof NotificationDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultTemplateResolution: Story = {};

export const WithCustomTemplate: Story = {
  render: () => ({
    components: { NotificationDropdown },
    setup() {
      provide(NotificationTemplatesKey, [OfferNotificationTemplate]);
    },
    template: `<NotificationDropdown />`,
  }),
};
