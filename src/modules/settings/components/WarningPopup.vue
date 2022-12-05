<template>
  <VcPopup
    :title="$t('SETTINGS.TEAM.PAGES.DETAILS.POPUP.ALERT.TITLE')"
    @close="$emit('close')"
    variant="small"
  >
    <div class="flex flex-col">
      <div class="px-[40px] py-[28px] flex flex-row items-center">
        <VcIcon
          icon="fas fa-exclamation-triangle"
          size="xxl"
          class="text-[#FFBB0D]"
        ></VcIcon>
        <div class="ml-3">
          {{
            $t("SETTINGS.TEAM.PAGES.DETAILS.POPUP.ALERT.MESSAGE.USER_DELETE")
          }}
        </div>
      </div>
      <div class="flex my-4 mx-5">
        <div class="ml-auto">
          <VcButton
            variant="onlytext"
            class="mr-5 text-[#FF4A4A]"
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
    (event: 'close'): void
    (event: 'delete'): void;
}
defineEmits<Emits>();
</script>
