<template>
  <VcPopup
    :title="$t('SETTINGS.TEAM.PAGES.DETAILS.POPUP.ALERT.TITLE')"
    @close="$emit('close')"
    variant="small"
  >
    <div class= "tw-flex tw-flex-col">
      <div class="tw-px-[40px] tw-py-[28px] tw-flex tw-flex-row tw-items-center">
        <VcIcon
          icon="fas fa-exclamation-triangle"
          size="xxl"
          class="tw-text-[#FFBB0D]"
        ></VcIcon>
        <div class="tw-ml-3">
          {{
            $t("SETTINGS.TEAM.PAGES.DETAILS.POPUP.ALERT.MESSAGE.USER_DELETE")
          }}
        </div>
      </div>
      <div class= "tw-flex tw-my-4 tw-mx-5">
        <div class="tw-ml-auto">
          <VcButton
            variant="onlytext"
            class="tw-mr-5 tw-text-[#FF4A4A]"
            @click="$emit('delete')"
            >{{
              $t("SETTINGS.TEAM.PAGES.DETAILS.POPUP.ALERT.BUTTONS.CONFIRM")
            }}</VcButton
          >
          <VcButton @click="$emit('close')">{{
            $t("SETTINGS.TEAM.PAGES.DETAILS.POPUP.ALERT.BUTTONS.CANCEL")
          }}</VcButton>
        </div>
      </div>
    </div>
  </VcPopup>
</template>

<script lang="ts" setup>
export interface Emits {
  (event: "close"): void;
  (event: "delete"): void;
}
defineEmits<Emits>();
</script>
