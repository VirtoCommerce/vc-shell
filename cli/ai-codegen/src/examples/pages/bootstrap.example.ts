import { addMenuItem, registerDashboardWidget } from "@vc-shell/framework";
import { App, markRaw } from "vue";
// TODO: Import your dashboard widget components
import WelcomeWidget from "../components/dashboard-widgets/WelcomeWidget.vue";
import EntityDashboardCard from "../components/dashboard-widgets/EntityDashboardCard.vue";

/**
 * Bootstrap function to register dashboard and widgets
 * Called from main.ts after app initialization
 */
export function bootstrap(app: App) {
  // Add Dashboard to main menu
  addMenuItem({
    title: "ENTITIES.MENU.DASHBOARD",
    icon: "lucide-home",
    priority: 0,
    url: "/",
  });

  // Register Dashboard Widgets

  // Widget 1: Custom Welcome Widget
  // Custom widget with gradient background and image
  registerDashboardWidget({
    id: "welcome-widget",
    name: "Welcome",
    component: markRaw(WelcomeWidget),
    size: { width: 6, height: 6 }, // Grid size: 6 columns wide, 6 rows tall
    position: { x: 0, y: 0 }, // Top-left position
  });

  // Widget 2: Entity Dashboard Card (Standard Widget Pattern)
  // Uses DashboardWidgetCard component with VcTable
  registerDashboardWidget({
    id: "entities-widget",
    name: "Recent Entities",
    component: markRaw(EntityDashboardCard),
    size: { width: 6, height: 6 },
    position: { x: 6, y: 0 }, // Top-right position
  });
}
