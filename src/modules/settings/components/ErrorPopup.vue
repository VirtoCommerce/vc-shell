<template>
  <VcPopup
    :title="$t('SETTINGS.TEAM.PAGES.DETAILS.POPUP.ERROR.TITLE')"
    @close="$emit('close')"
    variant="small"
  >
    <div class= "tw-flex tw-flex-col">
      <div class="tw-px-[40px] tw-py-[28px] tw-flex tw-flex-row tw-items-center">
        <VcIcon
          icon="fas fa-exclamation-circle"
          size="xxl"
          class="tw-text-[#FF4A4A]"
        ></VcIcon>
        <div
          class="tw-ml-3"
          v-html="
            $t('SETTINGS.TEAM.PAGES.DETAILS.POPUP.ERROR.MESSAGE.USER_EXIST', {
              email: email,
            })
          "
        ></div>
      </div>
      <div class= "tw-flex tw-my-4 tw-mx-5">
        <VcButton class="tw-ml-auto" @click="$emit('close')">{{
          $t("SETTINGS.TEAM.PAGES.DETAILS.POPUP.ERROR.BUTTONS.OK")
        }}</VcButton>
      </div>
    </div>
  </VcPopup>
</template>

<script lang="ts" setup>
export interface Props {
  email: string;
}

withDefaults(defineProps<Props>(), {
  email: "",
});
defineEmits(["close"]);
</script>
