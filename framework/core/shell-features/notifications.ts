import { NotificationDropdown } from "../../shared/components";
import type { ShellFeature } from "../types/shell-feature";

export const notificationsFeature: ShellFeature = {
  id: "notifications",
  appBarWidgets: [
    {
      id: "notification-dropdown",
      component: NotificationDropdown,
      icon: "lucide-bell",
      order: 10,
    },
  ],
  mobileButtons: [
    {
      id: "notification-dropdown",
      component: NotificationDropdown,
      icon: "lucide-bell",
      order: 10,
    },
  ],
};
