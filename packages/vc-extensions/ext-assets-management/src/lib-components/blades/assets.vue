<template>
  <vc-blade
    icon="image"
    title="Assets"
    width="500"
    :closable="false"
    :toolbarItems="toolbarItems"
  ></vc-blade>
</template>

<script>
  import { VcBlade } from "@virtocommerce/vc-ui-kit";
  import { defineComponent } from "@vue/composition-api";

  export default defineComponent({
    components: { VcBlade },

    setup() {
      return {
        toolbarItems: [
          { id: 1, icon: "sync-alt", title: "Refresh" },
          { id: 2, icon: "Folder", title: "New Folder" },
          { id: 3, icon: "upload", title: "Upload" },
          { id: 4, icon: "trash", title: "Delete", disabled: true },
        ],
      };
    },
  });
</script>
