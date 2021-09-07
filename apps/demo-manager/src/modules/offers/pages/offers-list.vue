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
    <vc-table :empty="empty"> </vc-table>
  </vc-blade>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useI18n, useBlade } from "@virtoshell/core";

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

  setup(props) {
    const { t } = useI18n();
    const { openBlade } = useBlade();

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
        id: "batchArchive",
        title: t("OFFERS.PAGES.LIST.TOOLBAR.BULK_ARCHIVE"),
        icon: "fas fa-archive",
        disabled: true,
      },
    ];

    const empty = {
      image: "/assets/empty-product.png",
      text: "There are no offers yet",
      action: "Add offer",
      clickHandler: () => {
        openBlade(props.uid, "offers-add");
      },
    };

    return {
      bladeToolbar,
      empty,
    };
  },
});
</script>
