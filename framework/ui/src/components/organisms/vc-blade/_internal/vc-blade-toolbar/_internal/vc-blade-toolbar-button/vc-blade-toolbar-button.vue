<template>
  <div
    class="vc-blade-toolbar-button"
    :class="{ 'vc-blade-toolbar-button_disabled': disabled || isWaiting }"
    @click="onClick"
    :title="title"
  >
    <VcIcon
      class="vc-blade-toolbar-button__icon"
      :icon="icon"
      size="m"
    ></VcIcon>
    <div v-if="isExpanded" class="vc-blade-toolbar-button__title">
      {{ title }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  inheritAttrs: false,
});
</script>

<script lang="ts" setup>
import VcIcon from "../../../../../../atoms/vc-icon/vc-icon.vue";

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },

  isExpanded: {
    type: Boolean,
    default: true,
  },

  icon: {
    type: String,
    default: "fas fa-question-circle",
  },

  title: {
    type: String,
    default: undefined,
  },

  clickHandler: {
    type: Function,
    default: undefined,
  },
});
const emit = defineEmits(["click"]);

const isWaiting = ref(false);

async function onClick(): Promise<void> {
  console.debug("vc-blade-toolbar-item#onClick()");

  if (!props.disabled && !isWaiting.value) {
    if (props.clickHandler && typeof props.clickHandler === "function") {
      isWaiting.value = true;
      try {
        await props.clickHandler();
      } finally {
        isWaiting.value = false;
      }
    } else {
      emit("click");
    }
  }
}
</script>

<style lang="less">
:root {
  --blade-toolbar-button-title-color: #465769;
  --blade-toolbar-button-title-color-hover: #465769;
  --blade-toolbar-button-title-color-disabled: #9fa2a6;

  --blade-toolbar-button-icon-color: #319ed4;
  --blade-toolbar-button-icon-color-hover: #257fad;
  --blade-toolbar-button-icon-color-disabled: #d2d4d7;

  --blade-toolbar-button-background-color: var(
    --blade-toolbar-background-color
  );
  --blade-toolbar-button-background-color-hover: var(
    --blade-toolbar-background-color
  );
  --blade-toolbar-button-background-color-disabled: var(
    --blade-toolbar-background-color
  );
}

.vc-blade-toolbar-button {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 var(--padding-s);
  background-color: var(--blade-toolbar-button-background-color);
  box-sizing: border-box;
  cursor: pointer;

  &__title {
    font-size: var(--font-size-s);
    white-space: nowrap;
    margin-top: var(--margin-xs);
    color: var(--blade-toolbar-button-title-color);
  }

  &__icon {
    color: var(--blade-toolbar-button-icon-color);
  }

  &:hover {
    background-color: var(--blade-toolbar-button-background-color-hover);

    .vc-blade-toolbar-button__title {
      color: var(--blade-toolbar-button-title-color-hover);
    }

    .vc-blade-toolbar-button__icon {
      color: var(--blade-toolbar-button-icon-color-hover);
    }
  }

  &_disabled,
  &_disabled:hover {
    background-color: var(--blade-toolbar-button-background-color-disabled);
    cursor: default;

    .vc-blade-toolbar-button__title {
      color: var(--blade-toolbar-button-title-color-disabled);
    }

    .vc-blade-toolbar-button__icon {
      color: var(--blade-toolbar-button-icon-color-disabled);
    }
  }
}
</style>
