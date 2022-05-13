<template>
  <VcPopup
    :title="$t('SETTINGS.TEAM.PAGES.DETAILS.POPUP.ERROR.TITLE')"
    @close="$emit('close')"
    variant="small"
  >
    <div class="flex flex-col">
      <div class="px-[40px] py-[28px] flex flex-row items-center">
        <VcIcon
          icon="fas fa-exclamation-circle"
          size="xxl"
          class="text-[#FF4A4A]"
        ></VcIcon>
        <div
          class="ml-3"
          v-html="
            $t('SETTINGS.TEAM.PAGES.DETAILS.POPUP.ERROR.MESSAGE.USER_EXIST', {
              email: email,
            })
          "
        ></div>
      </div>
      <div class="flex my-4 mx-5">
        <VcButton class="ml-auto" @click="$emit('close')">{{
          $t("SETTINGS.TEAM.PAGES.DETAILS.POPUP.ERROR.BUTTONS.OK")
        }}</VcButton>
      </div>
    </div>
  </VcPopup>
</template>

<script lang="ts" setup>
defineProps({
  email: {
    type: String,
    default: "",
  },
});
defineEmits(["close"]);
</script>
