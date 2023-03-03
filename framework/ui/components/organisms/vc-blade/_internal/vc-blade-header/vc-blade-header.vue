<template>
  <div
    class="tw-shrink-0 tw-h-[var(--blade-header-height)] tw-bg-[color:var(--blade-header-background-color)] tw-flex tw-items-center tw-py-0 tw-px-4 tw-border-solid tw-border-b tw-border-b-[color:#eaedf3]"
  >
    <div
      v-if="icon"
      class="tw-text-[color:var(--blade-header-icon-color)] tw-mr-3"
    >
      <VcIcon
        :icon="icon"
        size="xxl"
      ></VcIcon>
    </div>

    <div class="tw-overflow-hidden tw-grow tw-basis-0">
      <div
        class="tw-text-[color:var(--blade-header-title-color)] tw-text-lg tw-truncate"
        :class="{
          '!tw-text-[length:var(--blade-header-title-font-size)] tw-font-medium': !subtitle,
        }"
      >
        {{ title }}
      </div>
      <div
        v-if="subtitle"
        class="tw-text-[color:var(--blade-header-subtitle-color)] tw-text-xs tw-mt-1"
      >
        {{ subtitle }}
      </div>
    </div>

    <div v-if="$slots['actions']">
      <slot name="actions"></slot>
    </div>

    <div
      v-if="!$isMobile.value"
      class="tw-flex tw-items-center"
    >
      <template v-if="expandable">
        <div
          v-if="expanded"
          class="tw-text-[color:var(--blade-header-button-color)] tw-ml-4 tw-cursor-pointer hover:tw-text-[color:var(--blade-header-button-color-hover)]"
          @click="onCollapse"
        >
          <VcIcon
            icon="fas fa-window-minimize"
            size="s"
          ></VcIcon>
        </div>
        <div
          v-else
          class="vc-blade-header__button"
          @click="onExpand"
        >
          <VcIcon
            icon="fas fa-window-maximize"
            size="s"
          ></VcIcon>
        </div>
      </template>
      <div
        v-if="closable"
        class="tw-text-[color:var(--blade-header-button-color)] tw-ml-4 tw-cursor-pointer hover:tw-text-[color:var(--blade-header-button-color-hover)]"
        @click="onClose"
      >
        <VcIcon icon="fas fa-times"></VcIcon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "./../../../../../../ui/components";

export interface Props {
  expandable?: boolean | undefined;
  expanded?: boolean | undefined;
  closable?: boolean | undefined;
  title?: string | undefined;
  subtitle?: string | undefined;
  icon?: string | undefined;
}
const props = withDefaults(defineProps<Props>(), {
  expandable: false,
  expanded: false,
  closable: false,
});

const emit = defineEmits(["close", "expand", "collapse"]);

function onExpand(): void {
  if (props.expandable) {
    emit("expand");
  }
}

function onCollapse(): void {
  if (props.expandable) {
    emit("collapse");
  }
}

function onClose(): void {
  if (props.closable) {
    emit("close");
  }
}
</script>

<style lang="scss">
:root {
  --blade-header-height: 50px;
  --blade-header-background-color: #ffffff;

  --blade-header-button-color: #a1c0d4;
  --blade-header-button-color-hover: #7ea8c4;

  --blade-header-icon-color: #a1c0d4;

  --blade-header-title-font-size: 19px;
  --blade-header-title-color: #2e3d4e;

  --blade-header-subtitle-color: #a1c0d4;
}
</style>
