/**
 * Workspace Layout component.
 * @author Iurii A Taranov <me@flanker72.ru>
 */
import { Story } from "@storybook/vue3";
import VcLayoutWorkspace from "./vc-layout-workspace.vue";
import VcNav from "../../organisms/vc-nav/vc-nav.vue";
import VcButton from "../../atoms/vc-button/vc-button.vue";

export default {
  title: "layouts/vc-layout-workspace",
  component: VcLayoutWorkspace,
};

const Template: Story = (args) => ({
  components: { VcLayoutWorkspace, VcNav, VcButton },
  setup() {
    return { args };
  },
  template: `
      <vc-layout-workspace v-bind="args">
         <template #banner>
            <div>This is banner</div>
            <vc-button variant="special" title="Button"></vc-button>
         </template>

         <template #left>
            <vc-nav :items="menuItems"></vc-nav>
         </template>
      </vc-layout-workspace>
   `,
});

export const LayoutWorkspace = Template.bind({});
LayoutWorkspace.storyName = "vc-layout-workspace";
LayoutWorkspace.args = {
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
