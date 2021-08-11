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
