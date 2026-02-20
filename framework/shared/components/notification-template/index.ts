import _NotificationTemplate from "@shared/components/notification-template/notification-template.vue";

export const NotificationTemplate = _NotificationTemplate as typeof _NotificationTemplate;

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    NotificationTemplate: typeof NotificationTemplate;
  }
}
