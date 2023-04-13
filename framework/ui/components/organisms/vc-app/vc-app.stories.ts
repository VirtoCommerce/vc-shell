import type { Meta, StoryObj } from "@storybook/vue3";
import { VcApp } from "./";

const meta: Meta<typeof VcApp> = {
  title: "organisms/VcApp",
  component: VcApp,
};

export default meta;
type Story = StoryObj<typeof VcApp>;

export const Primary: Story = {
  render: (args) => ({
    components: { VcApp },
    setup() {
      return { args };
    },
    template: '<vc-app v-bind="args"></vc-app>',
  }),
  args: {
    menuItems: [
      {
        title: "Dashboard",
        icon: "fas fa-home",
        isVisible: true,
      },
      {
        title: "Orders",
        icon: "fas fa-file-alt",
        isVisible: true,
      },
      {
        title: "Products",
        icon: "fas fa-box-open",
        isVisible: true,
      },
      {
        title: "Offers",
        icon: "fas fa-file-invoice",
        isVisible: true,
      },
      {
        title: "Import",
        icon: "fas fa-file-import",
        isVisible: true,
      },
      {
        title: "Logout",
        icon: "fas fa-sign-out-alt",
      },
    ],
    toolbarItems: [
      { id: "1", icon: "fas fa-globe", title: "Language selector" },
      { id: "2", icon: "fas fa-bell", title: "Notifications", isAccent: true },
    ],
    isReady: true,
    isAuthorized: true,
    version: "0.0.100",
    logo: "images/main-logo.svg",
  },
};
