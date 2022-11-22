/**
 * App component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcApp from "./vc-app.vue";

export default {
  title: "organisms/vc-app",
  component: VcApp,
  parameters: {
    backgrounds: {
      default: "default",
      values: [
        {
          name: "default",
          value:
            "linear-gradient(180deg, #E4F5FB 5.06%, #E8F3F2 100%), linear-gradient(0deg, #E8F2F3, #E8F2F3), #EEF2F8;",
        },
      ],
    },
  },
};

const Template: Story = (args) => ({
  components: { VcApp },
  setup() {
    return { args };
  },
  template: '<vc-app v-bind="args"></vc-app>',
});

export const App = Template.bind({});
App.storyName = "vc-app";
App.args = {
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
    { id: 1, icon: "fas fa-globe", title: "Language selector" },
    { id: 2, icon: "fas fa-bell", title: "Notifications", isAccent: true },
  ],
  isReady: true,
  isAuthorized: true,
  version: "0.0.100",
  logo: "images/main-logo.svg",
};
