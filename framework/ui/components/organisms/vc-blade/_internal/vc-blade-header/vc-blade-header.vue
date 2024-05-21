<template>
  <div
    class="tw-shrink-0 tw-h-[var(--blade-header-height)] tw-bg-[color:var(--blade-header-background-color)] tw-flex tw-items-center tw-py-0 tw-px-4 tw-border-solid tw-border-b tw-border-b-[color:#eaedf3]"
  >
    <div
      v-if="typeof modified !== 'undefined'"
      ref="tooltipIconRef"
      :class="{
        '!tw-bg-[color:var(--blade-not-edited)]': !modified,
        '!tw-bg-[color:var(--blade-edited)]': modified,
      }"
      class="tw-block tw-w-[7px] tw-h-[7px] tw-rounded-full tw-z-[1] tw-mr-2"
      @mouseenter="tooltipVisible = true"
      @mouseleave="tooltipVisible = false"
    >
      <teleport to="body">
        <span
          v-if="tooltipVisible"
          ref="tooltipRef"
          :style="floatingStyles"
          class="tw-absolute tw-z-10 tw-bg-white tw-border tw-border-solid tw-border-[color:#eef0f2] tw-shadow-[1px_1px_8px_rgba(126,142,157,0.25)] tw-rounded-[3px] tw-text-[color:#8e9daa] tw-font-normal tw-py-1 tw-px-2 tw-ml-4"
        >
          {{
            modified
              ? $t("COMPONENTS.ORGANISMS.VC_BLADE_HEADER.UNSAVED_CHANGES")
              : $t("COMPONENTS.ORGANISMS.VC_BLADE_HEADER.NO_CHANGES")
          }}
        </span>
      </teleport>
    </div>

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
        class="tw-text-[color:var(--blade-header-title-color)] tw-text-lg/[23px] tw-truncate"
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
          v-if="maximized"
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
          class="tw-text-[color:var(--blade-header-button-color)] tw-ml-4 tw-cursor-pointer hover:tw-text-[color:var(--blade-header-button-color-hover)]"
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
import { VcIcon } from "./../../../../";
import { ref } from "vue";
import { useFloating, shift } from "@floating-ui/vue";

export interface Props {
  expandable?: boolean;
  maximized?: boolean;
  closable?: boolean;
  title?: string;
  subtitle?: string;
  icon?: string;
  modified?: boolean;
}
const props = defineProps<Props>();

const emit = defineEmits(["close", "expand", "collapse"]);

const tooltipVisible = ref(false);
const tooltipIconRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const { floatingStyles } = useFloating(tooltipIconRef, tooltipRef, {
  placement: "bottom-start",
  middleware: [shift()],
});

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

  --blade-not-edited: #87b563;

  --blade-edited: #f89406;
}
</style>
