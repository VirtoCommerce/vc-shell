<template>
  <vc-blade
    :uid="uid"
    :title="$t('OFFERS.PAGES.LIST.TITLE')"
    :width="600"
    :expanded="expanded"
    :closable="closable"
    @close="$closeBlade(uid)"
    @expand="$expandBlade(uid)"
    @collapse="$collapseBlade(uid)"
    :toolbarItems="bladeToolbar"
  >
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useI18n } from "@virtoshell/core";

export default defineComponent({
  props: {
    uid: {
      type: String,
      default: undefined,
    },

    expanded: {
      type: Boolean,
      default: true,
    },

    closable: {
      type: Boolean,
      default: true,
    },
  },

  setup() {
    const { t } = useI18n();
    const expanded = ref(true);

    const bladeToolbar = [
      {
        id: "refresh",
        title: t("OFFERS.PAGES.LIST.TOOLBAR.REFRESH"),
        icon: "fas fa-sync-alt",
      },
      {
        id: "add",
        title: t("OFFERS.PAGES.LIST.TOOLBAR.ADD"),
        icon: "fas fa-plus",
      },
      {
        id: "batchDelete",
        title: t("OFFERS.PAGES.LIST.TOOLBAR.BULK_DELETE"),
        icon: "fas fa-trash",
        disabled: true,
      },
    ];

    return {
      bladeToolbar,
    };
  },
});
</script>
