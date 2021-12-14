<template>
  <div class="vc-file-upload-notification__uploaded-wrap vc-flex vc-flex-row">
    <div
      class="vc-file-upload-notification__uploaded-icon-wrap vc-margin-top_xs"
    >
      <img
        v-if="uploadStatus.status"
        src="../../../../../assets/icons/vc-file-upload/vc-file-upload-notification/success.svg"
        alt="success"
      />
      <img
        v-else
        src="../../../../../assets/icons/vc-file-upload/vc-file-upload-notification/failure.svg"
        alt="failure"
      />
    </div>
    <div class="vc-file-upload-notification__uploaded-info vc-margin-left_m">
      <p
        class="
          vc-file-upload-notification__uploaded-file-name
          vc-font-weight_normal
          vc-font-size_l
        "
      >
        {{ uploadStatus.file_name }}
      </p>
      <p class="vc-file-upload-notification__uploaded-file-size">
        {{ uploadStatus.size }} Mb
      </p>
      <div
        class="
          vc-file-upload-notification__uploaded-actions
          vc-margin-top_l
          vc-flex vc-flex-row
        "
      >
        <vc-button
          v-for="(action, i) in filteredActions"
          :key="i"
          @click="action.clickHandler"
          :variant="action.variant"
          :outline="action.outline"
          :small="true"
        >
          {{ action.name }}
        </vc-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from "vue";

interface INotificationActions {
  name: string;
  clickHandler(): void;
  outline: boolean;
  variant: string;
  isVisible?: boolean;
}

export default defineComponent({
  name: "VcUploadNotification",
  props: {
    uploadActions: {
      type: Array as PropType<INotificationActions[]>,
      default: () => [],
    },

    uploadStatus: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const filteredActions = computed(() =>
      props.uploadActions.filter((action) => action.isVisible)
    );

    return {
      filteredActions,
    };
  },
});
</script>
<style lang="less" scoped>
.vc-file-upload-notification {
  &__uploaded-wrap {
    background: #ffffff;
    border: 1px solid #eaedf3;
    box-sizing: border-box;
    border-radius: 3px;
    padding: 8px 28px 10px;
  }

  &__uploaded-icon-wrap {
    width: 30px;
  }

  &__uploaded-info {
  }

  &__uploaded-file-name {
    color: var(--basic-black-color);
    margin: 0 0 2px;
  }

  &__uploaded-file-size {
    color: #999999;
    margin: 0;
  }

  &__uploaded-actions {
    gap: 7px;
  }
}
</style>
