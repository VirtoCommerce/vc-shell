/**
 * Custom Layout component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcLayoutCustom from "./vc-layout-custom.vue";

export default {
  title: "layouts/vc-layout-custom",
  component: VcLayoutCustom,
};

const Template: Story = (args) => ({
  components: { VcLayoutCustom },
  setup() {
    return { args };
  },
  template: `<vc-layout-custom v-bind="args"></vc-layout-custom>`,
});

export const LayoutCustom = Template.bind({});
LayoutCustom.storyName = "vc-layout-custom";
LayoutCustom.args = {
  menuItems: [
    {
      id: 1,
      title: "Catalog",
      icon: "folder",
      to: "/catalog",
    },
    {
      id: 2,
      title: "Contacts",
      icon: "address-card",
      to: "/contacts",
    },
    {
      id: 3,
      title: "Marketing",
      icon: "flag",
      to: "/marketing",
    },
    {
      id: 4,
      title: "Thumbnails",
      icon: "image",
      to: "/thumbnails",
    },
    {
      id: 5,
      title: "Stores",
      icon: "archive",
      to: "/stores",
    },
  ],

  toolbarItems: [
    {
      id: "settings",
      icon: "cog",
      title: "Settings",
    },
    {
      id: "help",
      icon: "life-ring",
      title: "Help",
    },
    {
      id: "bell",
      icon: "bell",
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
