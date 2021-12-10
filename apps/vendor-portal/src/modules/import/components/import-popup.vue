<template>
  <vc-popup
    :title="$t('IMPORT.PAGES.IMPORTING.POPUP.TITLE')"
    @close="$emit('close')"
    class="import-popup"
    :fullscreen="false"
  >
    <div class="vc-flex vc-flex-row vc-flex-justify_space-between">
      <div class="vc-padding_xl vc-flex vc-flex-align_center">
        <p class="import-popup__description">
          {{ t("IMPORT.PAGES.IMPORTING.POPUP.DESCRIPTION") }}
        </p>
      </div>
      <div
        class="vc-padding_xl vc-flex vc-flex-align_center import-popup__counter"
      >
        <p class="import-popup__count">
          {{ t("IMPORT.PAGES.IMPORTING.POPUP.PREVIEW_COUNT") }}:
          <span class="import-popup__digits">10</span>
          {{ t("IMPORT.PAGES.IMPORTING.POPUP.PREVIEW_OF") }}
          <span class="import-popup__digits">{{ count }}</span>
        </p>
      </div>
    </div>
    <vc-table
      :columns="columns"
      :items="items"
      :header="false"
      :scrolling="true"
    ></vc-table>
    <div class="import-popup__footer vc-padding_xl vc-flex">
      <vc-button :outline="true" @click="$emit('close')">{{
        t("IMPORT.PAGES.IMPORTING.POPUP.CANCEL")
      }}</vc-button>
      <vc-button>{{ t("IMPORT.PAGES.IMPORTING.POPUP.IMPORT") }}</vc-button>
    </div>
  </vc-popup>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useI18n } from "@virtoshell/core";

export default defineComponent({
  name: "import-popup",
  props: {
    columns: {
      type: Array,
      default: () => [],
    },

    items: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    const { t } = useI18n();
    const count = 125600;

    return {
      t,
      count,
    };
  },
});
</script>

<style lang="less" scoped>
.import-popup {
  ::v-deep .vc-popup__content {
    display: flex;
    flex-direction: column;
  }

  &__description {
    margin: 0;
    color: var(--basic-black-color);
    line-height: var(--line-height-l);
  }

  &__counter {
    border-left: 1px solid #e3e7ec;
  }

  &__count {
    font-size: var(--font-size-l);
    line-height: var(--line-height-xl);
    color: var(--basic-black-color);
    margin: 0;
  }

  &__digits {
    color: var(--primary-color);
  }

  &__footer {
    gap: 25px;
  }
}
</style>
