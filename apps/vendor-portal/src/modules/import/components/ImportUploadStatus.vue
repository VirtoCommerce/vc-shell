<template>
  <div class="vc-flex vc-flex-column vc-flex-grow_1">
    <div class="vc-flex vc-flex-row vc-flex-align_center">
      <div
        class="vc-file-upload-notification__success-img"
        v-if="isUploaded"
      ></div>
      <div class="vc-file-upload-notification__error-img" v-else></div>
      <div class="vc-flex vc-flex-column vc-flex-grow_1 vc-margin-left_m">
        <div class="vc-font-weight_normal vc-font-size_l">
          {{ uploadedFile.name }}
        </div>
        <VcHint> {{ uploadedFile.size }} Mb </VcHint>
      </div>
    </div>
    <div
      class="vc-flex vc-flex-row vc-flex-justify_space-between vc-margin-top_xl"
      v-if="filteredActions && filteredActions.length && !isStarted"
    >
      <div>
        <VcButton
          v-for="(action, i) in filteredActions.slice(0, 1)"
          :key="i"
          @click="action.clickHandler"
          :variant="action.variant"
          :outline="action.outline"
          :small="true"
          :disabled="action.disabled"
        >
          {{ action.name }}
        </VcButton>
      </div>
      <div class="vc-file-upload-notification__btn">
        <VcButton
          v-for="(action, i) in filteredActions.slice(1, 3)"
          :key="i"
          @click="action.clickHandler"
          :variant="action.variant"
          :outline="action.outline"
          :small="true"
          :disabled="action.disabled"
          class="vc-margin-left_m"
        >
          {{ action.name }}
        </VcButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from "vue";
import { INotificationActions } from "../../../types";

const props = defineProps({
  uploadActions: {
    type: Array as PropType<INotificationActions[]>,
    default: () => [],
  },

  uploadedFile: {
    type: Object,
    default: () => ({}),
  },

  isUploaded: {
    type: Boolean,
    default: false,
  },

  isStarted: {
    type: Boolean,
    default: false,
  },
});
const filteredActions = computed(() =>
  props.uploadActions.filter((action) => action.isVisible)
);
</script>
<style lang="less">
:root {
  --file-upload-success-img: url("data:image/svg+xml;utf8,<svg width='30' height='41' viewBox='0 0 30 41' fill='none' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' clip-rule='evenodd' d='M17.5 0V10.8906C17.5 11.9477 18.3438 12.8125 19.375 12.8125H30V39.0781C30 40.1432 29.1641 41 28.125 41H1.875C0.835938 41 0 40.1432 0 39.0781V1.92188C0 0.856836 0.835938 0 1.875 0H17.5ZM21.8047 0.560547L29.4531 8.4082C29.8047 8.76855 30 9.25703 30 9.76152V10.25H20V0H20.4766C20.9766 0 21.4531 0.200195 21.8047 0.560547ZM7.71966 25.7542L12.5947 30.7798C12.8875 31.0817 13.3624 31.0817 13.6553 30.7798L22.2803 21.8883C22.5732 21.5864 22.5732 21.0968 22.2803 20.7949L21.2197 19.7014C20.9268 19.3995 20.4519 19.3995 20.159 19.7014L13.125 26.9528L9.84096 23.5673C9.54808 23.2653 9.07318 23.2653 8.7803 23.5673L7.71966 24.6607C7.42678 24.9627 7.42678 25.4522 7.71966 25.7542Z' fill='%2387B563'/></svg>");
  --file-upload-error-img: url("data:image/svg+xml;utf8,<svg width='30' height='40' viewBox='0 0 30 40' fill='none' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' clip-rule='evenodd' d='M17.5 0V10.625C17.5 11.6562 18.3438 12.5 19.375 12.5H30V38.125C30 39.1641 29.1641 40 28.125 40H1.875C0.835938 40 0 39.1641 0 38.125V1.875C0 0.835938 0.835938 0 1.875 0H17.5ZM21.8047 0.546875L29.4531 8.20312C29.8047 8.55469 30 9.03125 30 9.52344V10H20V0H20.4766C20.9766 0 21.4531 0.195312 21.8047 0.546875ZM21.6337 21.0199L17.6536 25L21.6337 28.9801C22.1221 29.4689 22.1221 30.2607 21.6337 30.7491L20.7491 31.6337C20.2607 32.1221 19.4685 32.1221 18.9801 31.6337L15 27.6536L11.0199 31.6337C10.5315 32.1221 9.73926 32.1221 9.25085 31.6337L8.36631 30.7491C7.8779 30.2603 7.8779 29.4685 8.36631 28.9801L12.3464 25L8.36631 21.0199C7.8779 20.5311 7.8779 19.7393 8.36631 19.2509L9.25085 18.3663C9.73966 17.8779 10.5315 17.8779 11.0199 18.3663L15 22.3464L18.9801 18.3663C19.4689 17.8779 20.2607 17.8779 20.7491 18.3663L21.6337 19.2509C22.1221 19.7397 22.1221 20.5315 21.6337 21.0199Z' fill='%23F34747'/></svg>");
}
.vc-file-upload-notification {
  &__success-img,
  &__error-img {
    width: 30px;
    height: 41px;
    background-position: center;
    background-repeat: no-repeat;
  }

  &__success-img {
    background-image: var(--file-upload-success-img);
  }

  &__error-img {
    background-image: var(--file-upload-error-img);
  }

  &__btn {
    margin-left: auto;
  }
}
</style>
