<template>
  <VcPopup @close="$emit('close')" variant="small" :title="title">
    <div class="vc-padding_m">
      <slot name="description">{{
        $t("IMPORT.PAGES.IMPORTING.CONFIRMATION_POPUP.CONFIRMATION")
      }}</slot>

      <div
        class="vc-flex vc-flex-justify_center vc-flex-align_center vc-padding-top_s"
      >
        <span v-if="$isDesktop.value" class="vc-flex-grow_1"></span>
        <VcButton
          variant="primary"
          :outline="true"
          class="vc-margin-right_m"
          @click="$emit('close')"
        >
          {{ $t("IMPORT.PAGES.IMPORTING.CONFIRMATION_POPUP.NO") }}
        </VcButton>
        <VcButton variant="primary" @click="$emit('confirm')">
          {{ $t("IMPORT.PAGES.IMPORTING.CONFIRMATION_POPUP.YES") }}
        </VcButton>
      </div>
    </div>
  </VcPopup>
</template>

<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
});
</script>

<style lang="less" scoped></style>
