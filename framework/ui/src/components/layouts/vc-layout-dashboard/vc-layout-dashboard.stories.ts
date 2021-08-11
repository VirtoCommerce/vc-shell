/**
 * Dashboard Layout component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcLayoutDashboard from "./vc-layout-dashboard.vue";

export default {
  title: "layouts/vc-layout-dashboard",
  component: VcLayoutDashboard,
};

const Template: Story = (args) => ({
  components: { VcLayoutDashboard },
  setup() {
    return { args };
  },
  template: `<vc-layout-dashboard v-bind="args"></vc-layout-dashboard>`,
});

export const LayoutDashboard = Template.bind({});
LayoutDashboard.storyName = "vc-layout-dashboard";
LayoutDashboard.args = {
  menuItems: [
    {
      id: 1,
      title: "Catalog",
      icon: "fas fa-folder",
      to: "/catalog",
    },
    {
      id: 2,
      title: "Contacts",
      icon: "fas fa-address-card",
      to: "/contacts",
    },
    {
      id: 3,
      title: "Marketing",
      icon: "fas fa-flag",
      to: "/marketing",
    },
    {
      id: 4,
      title: "Thumbnails",
      icon: "fas fa-image",
      to: "/thumbnails",
    },
    {
      id: 5,
      title: "Stores",
      icon: "fas fa-archive",
      to: "/stores",
    },
  ],

  toolbarItems: [
    {
      id: "settings",
      icon: "fas fa-cog",
      title: "Settings",
    },
    {
      id: "help",
      icon: "fas fa-life-ring",
      title: "Help",
    },
    {
      id: "bell",
      icon: "fas fa-bell",
      accent: true,
      title: "Notifications",
    },
  ],

  account: {
    avatar: "/images/avatar.jpg",
    name: "Iurii A Taranov",
    role: "Administrator",
  },
};
