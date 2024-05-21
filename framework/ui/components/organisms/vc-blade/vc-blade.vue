<template>
  <div
    class="vc-blade tw-relative tw-flex tw-shrink-0 tw-flex-col tw-bg-[color:var(--blade-background-color)] tw-rounded-[var(--blade-border-radius)] tw-shadow-[2px_2px_8px_rgba(54,84,117,0.14)] tw-my-4 tw-mx-2 tw-overflow-hidden tw-transition-[width] tw-duration-200"
    :class="[
      $attrs.class,
      {
        '!tw-w-full': $isMobile.value,
        '!tw-w-full !tw-shrink': expanded,
        '!tw-absolute !tw-z-[2] !tw-top-0 !tw-bottom-0 !tw-left-0 ![width:-webkit-fill-available] !tw-shrink':
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
      :expandable="expandable"
      :closable="closable"
      :icon="icon"
      :title="title"
      :subtitle="subtitle"
      :modified="typeof modified !== 'undefined' ? modified : undefined"
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

    <!-- Show error message -->
    <template v-if="error">
      <div class="tw-text-white tw-p-2 tw-flex tw-flex-row tw-items-center tw-bg-[color:var(--blade-color-error)]">
        <VcIcon
          size="s"
          icon="fas fa-exclamation-triangle"
        />
        <div class="tw-line-clamp-1 tw-w-full tw-mx-2">{{ error }}</div>
        <VcButton
          text
          class="tw-shrink-0 tw-opacity-80 tw-text-white hover:!tw-opacity-100 hover:!tw-text-white"
          @click="open()"
          >{{ t("COMPONENTS.ORGANISMS.VC_BLADE.SEE_DETAILS") }}</VcButton
        >
      </div>
    </template>

    <!-- Unsaved changes -->
    <template v-if="typeof modified !== 'undefined' ? modified : false">
      <div
        class="tw-text-white tw-px-2 tw-py-1 tw-flex tw-flex-row tw-items-center tw-bg-[color:var(--blade-color-unsaved-changes)]"
      >
        <VcIcon
          size="s"
          icon="fas fa-info-circle"
        />
        <div class="tw-line-clamp-1 tw-w-full tw-ml-2">{{ t("COMPONENTS.ORGANISMS.VC_BLADE.UNSAVED_CHANGES") }}</div>
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

<script lang="ts" setup>
import { computed, Ref, reactive, useAttrs, toRefs, toValue } from "vue";
import { IBladeToolbar } from "../../../../core/types";
import { usePopup } from "./../../../../shared";
import { useI18n } from "vue-i18n";
import VcBladeHeader from "./_internal/vc-blade-header/vc-blade-header.vue";
import VcBladeToolbar from "./_internal/vc-blade-toolbar/vc-blade-toolbar.vue";
import { VcButton, VcIcon } from "./../../";
import vcPopupError from "../../../../shared/components/common/popup/vc-popup-error.vue";

export interface Props {
  icon?: string;
  title?: string;
  subtitle?: string;
  width?: number | string;
  expanded?: boolean;
  expandable?: boolean;
  closable?: boolean;
  toolbarItems?: IBladeToolbar[];
  modified?: boolean;
}

export interface Emits {
  (event: "close"): void;
  (event: "expand"): void;
  (event: "collapse"): void;
}

defineOptions({
  inheritAttrs: false,
});

withDefaults(defineProps<Props>(), {
  width: "30%",
  closable: true,
  expandable: true,
  toolbarItems: () => [],
  modified: undefined,
});

defineSlots<{
  actions: void;
  default: void;
}>();

defineEmits<Emits>();
const attrs = useAttrs();
const { maximized, error }: { maximized?: Ref<boolean>; error?: Ref<string> } = toRefs(reactive(attrs));
const { t } = useI18n({ useScope: "global" });

const { open } = usePopup({
  component: vcPopupError,
  props: {
    title: t("COMPONENTS.ORGANISMS.VC_BLADE.ERROR_POPUP.TITLE"),
  },
  slots: {
    default: computed(() => toValue(error)),
  },
});
</script>

<style lang="scss">
:root {
  --blade-background-color: #ffffff;
  --blade-border-radius: 6px;
  --blade-color-error: #f14e4e;
  --blade-color-unsaved-changes: #82a6bd;
  --blade-color-unsaved-changes: #82a6bd;
}

.vc-app_mobile .vc-blade {
  @apply tw-m-0 tw-rounded-none;
}
</style>
