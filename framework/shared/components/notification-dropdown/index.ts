import _NotificationDropdown from "@shared/components/notification-dropdown/notification-dropdown.vue";

export const NotificationDropdown = _NotificationDropdown as typeof _NotificationDropdown;

// Declare globally
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    NotificationDropdown: typeof NotificationDropdown;
  }
}
