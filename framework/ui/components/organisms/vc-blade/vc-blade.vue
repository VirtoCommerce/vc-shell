<template>
  <div
    class="vc-blade tw-relative tw-flex tw-shrink-0 tw-flex-col tw-bg-[color:var(--blade-background-color)] tw-rounded-[var(--blade-border-radius)] tw-shadow-[2px_2px_8px_rgba(126,142,157,0.14)] tw-my-4 tw-mx-2 tw-overflow-hidden tw-transition-[width] tw-duration-200"
    :class="[
      $attrs.class,
      {
        '!tw-w-full': $isMobile.value,
        '!tw-w-full !tw-shrink': expanded,
        '!tw-absolute !tw-z-[2] !tw-top-0 !tw-bottom-0 !tw-left-0 ![width:-webkit-fill-available] !tw-mx-4 !tw-shrink':
          maximized,
      },
    ]"
    :style="{ width: typeof width === 'number' ? `${width}px` : width }"
  >
    <!-- Init blade header -->
    <VcBladeHeader
      v-if="!$isMobile.value || closable"
      class="tw-shrink-0"
      :maximized="maximized"
      :expandable="isExpandable"
      :closable="closable"
      :icon="icon"
      :title="title"
      :subtitle="subtitle"
      @close="$emit('close')"
      @expand="$emit('expand')"
      @collapse="$emit('collapse')"
    >
      <template
        v-if="$slots['actions']"
        #actions
      >
        <slot name="actions"></slot>
      </template>
    </VcBladeHeader>

    <template v-if="$slots['error']">
      <div class="tw-text-white tw-p-2 tw-flex tw-flex-row tw-items-center tw-bg-[color:var(--blade-color-error)]">
        <VcIcon
          size="s"
          icon="fas fa-exclamation-triangle"
        />
        <div class="tw-line-clamp-1 tw-w-full tw-mx-2"><slot name="error"></slot></div>
        <VcButton
          variant="onlytext"
          class="tw-shrink-0 tw-opacity-80 tw-text-white hover:!tw-opacity-100 hover:!tw-text-white"
          @click="open()"
          >{{ $t("COMPONENTS.ORGANISMS.VC_BLADE.SEE_DETAILS") }}</VcButton
        >
      </div>
    </template>

    <!-- Set up blade toolbar -->
    <VcBladeToolbar
      class="tw-shrink-0"
      :items="toolbarItems"
    ></VcBladeToolbar>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, useSlots, h } from "vue";
import { IBladeToolbar } from "../../../../core/types";
import { IBladeContainer, usePopup } from "./../../../../shared";
import { useI18n } from "vue-i18n";

export default defineComponent({
  inheritAttrs: false,
});
</script>

<script lang="ts" setup>
import VcBladeHeader from "./_internal/vc-blade-header/vc-blade-header.vue";
import VcBladeToolbar from "./_internal/vc-blade-toolbar/vc-blade-toolbar.vue";
import { VcButton, VcIcon, VcPopup } from "./../../";

export interface Props {
  icon?: string;
  title?: string;
  subtitle?: string;
  width?: number | string;
  expanded?: boolean;
  maximized?: boolean;
  expandable?: boolean;
  closable?: boolean;
  toolbarItems?: IBladeToolbar[];
  onClose?: () => void;
  blades?: IBladeContainer[];
}

export interface Emits {
  (event: "close"): void;
  (event: "expand"): void;
  (event: "collapse"): void;
}

const props = withDefaults(defineProps<Props>(), {
  width: "30%",
  closable: true,
  expandable: true,
  toolbarItems: () => [],
});

defineEmits<Emits>();
const { t } = useI18n({ useScope: "global" });
const slots = useSlots();
const errorSlot = computed(() => slots.error && slots.error());

const { open } = usePopup({
  component: VcPopup,
  props: {
    type: "error",
    variant: "small",
    title: t("COMPONENTS.ORGANISMS.VC_BLADE.ERROR_POPUP.TITLE"),
  },
  slots: {
    default: h(
      "div",
      h(() => errorSlot.value)
    ),
  },
});

const isExpandable = computed(() => {
  if (!props.expandable) {
    return props.expandable;
  }
  return props.blades?.length !== 0;
});
</script>

<style lang="scss">
:root {
  --blade-background-color: #ffffff;
  --blade-border-radius: 6px;
  --blade-color-error: #f14e4e;
}

.vc-app_mobile .vc-blade {
  @apply tw-m-0 tw-rounded-none;
}
</style>
