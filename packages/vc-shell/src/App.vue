<template>
  <vc-layout :toolbarItems="toolbarItems" :account="account">
    <template #banner>
      <div>
        Running community edition, click to request a commercial license.
      </div>
      <vc-button variant="special" title="Purchase"></vc-button>
    </template>

    <template #left>
      <vc-drawer :items="menuItems" logo="/src/assets/logo.svg"></vc-drawer>
    </template>
  </vc-layout>
</template>

<script>
  import { VcLayout, VcButton, VcDrawer } from "@virtocommerce/vc-ui-kit";
  import { defineComponent, ref } from "@vue/composition-api";

  export default defineComponent({
    components: { VcLayout, VcButton, VcDrawer },

    setup() {
      const menuItems = ref([
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
      ]);

      const toolbarItems = ref([
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
      ]);

      const account = ref({
        avatar: "/images/avatar.jpg",
        name: "Iurii A Taranov",
        role: "Administrator",
      });

      return {
        menuItems,
        toolbarItems,
        account,
      };
    },
  });
</script>
