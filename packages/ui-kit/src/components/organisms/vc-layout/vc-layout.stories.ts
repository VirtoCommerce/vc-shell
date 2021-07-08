/**
 * Layout component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from '@storybook/vue3';
import VcLayout from "./vc-layout.vue";

export default {
  title: "organisms/vc-layout",
  component: VcLayout,
};

const Template: Story = (args) => ({
  components: { VcLayout },
  setup() { return { args } },
  template: `
      <vc-layout v-bind="args">
         <template #banner>
            <div>This is banner</div>
            <vc-button variant="special" title="Button"></vc-button>
         </template>

         <template #left>
            <vc-drawer :items="menuItems"></vc-drawer>
         </template>
      </vc-layout>
   `,
});

export const Layout = Template.bind({});
Layout.storyName = "vc-layout";
Layout.args = {
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
