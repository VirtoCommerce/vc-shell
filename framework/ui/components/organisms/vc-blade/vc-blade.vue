<template>
  <div
    class="vc-blade tw-relative tw-flex tw-shrink-0 tw-flex-col tw-bg-[color:var(--blade-background-color)] tw-rounded-[var(--blade-border-radius)] [box-shadow:var(--blade-shadow)] tw-my-4 tw-mx-2 tw-overflow-hidden tw-transition-[width] tw-duration-200"
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
      <div
        class="tw-text-[color:var(--blade-text-color)] tw-p-2 tw-flex tw-flex-row tw-items-center tw-bg-[color:var(--blade-color-error)]"
      >
        <VcIcon
          size="s"
          icon="fas fa-exclamation-triangle"
        />
        <div class="tw-line-clamp-1 tw-w-full tw-mx-2">{{ error }}</div>
        <VcButton
          text
          class="tw-shrink-0 tw-opacity-80 tw-text-[color:var(--blade-text-color)] hover:!tw-opacity-100 hover:!tw-text-[color:var(--blade-text-color)]"
          @click="open()"
        >
          {{ t("COMPONENTS.ORGANISMS.VC_BLADE.SEE_DETAILS") }}
        </VcButton>
      </div>
    </template>

    <!-- Unsaved changes -->
    <template v-if="typeof modified !== 'undefined' ? modified : false">
      <div
        class="tw-text-[color:var(--blade-text-color)] tw-px-2 tw-py-1 tw-flex tw-flex-row tw-items-center tw-bg-[color:var(--blade-color-unsaved-changes)]"
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

    <div class="tw-flex-1 tw-overflow-auto">
      <div
        class="tw-flex tw-flex-row tw-h-full"
        :class="{
          'tw-flex-col': $isMobile.value,
        }"
      >
        <div
          class="tw-flex tw-flex-auto tw-flex-col"
          :class="{
            'tw-w-0': $isDesktop.value,
            'tw-h-0': $isMobile.value,
          }"
        >
          <slot></slot>
        </div>

        <div
          v-show="$slots['widgets'] && !isWidgetContainerEmpty"
          ref="widgetsRef"
          class="vc-blade__widgets tw-flex"
          :class="{
            'tw-border-l tw-border-solid tw-border-l-[color:var(--blade-border-color)]': $isDesktop.value,
            'tw-w-[var(--blade-widgets-width)] tw-flex-col': $isDesktop.value && !isExpanded,
            'tw-w-[var(--blade-widgets-width-expanded)] tw-flex-col': $isDesktop.value && isExpanded,
            'tw-w-auto tw-border-t tw-border-solid tw-border-t-[color:var(--blade-border-color)] tw-flex-row':
              $isMobile.value,
          }"
        >
          <div
            ref="widgetsContainerRef"
            class="vc-blade__widget-container tw-flex tw-overflow-y-auto"
            :class="{
              'tw-flex-col tw-overflow-x-clip': $isDesktop.value,
              'tw-flex-row': $isMobile.value,
            }"
          >
            <slot
              name="widgets"
              :is-expanded="isExpanded"
            ></slot>
          </div>

          <div
            class="tw-flex tw-flex-auto"
            :class="{
              'tw-flex-col tw-justify-end': $isDesktop.value,
              'tw-w-12 tw-max-w-12 tw-bg-[--blade-background-color] tw-items-center tw-justify-center tw-px-4 tw-ml-auto':
                $isMobile.value,
            }"
          >
            <VcIcon
              class="tw-self-center tw-justify-self-center tw-text-[color:var(--blade-icon-color)] tw-cursor-pointer hover:tw-text-[color:var(--blade-icon-hover-color)]"
              :class="{
                'tw-mb-4': $isDesktop.value,
              }"
              :icon="`fas fa-chevron-${$isDesktop.value ? (isExpanded ? 'right' : 'left') : isExpanded ? 'up' : 'down'}`"
              @click="toggleWidgets"
            ></VcIcon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, Ref, reactive, useAttrs, toRefs, toValue, ref, onMounted, onUpdated } from "vue";
import { IBladeToolbar } from "../../../../core/types";
import { usePopup } from "./../../../../shared";
import { useI18n } from "vue-i18n";
import VcBladeHeader from "./_internal/vc-blade-header/vc-blade-header.vue";
import VcBladeToolbar from "./_internal/vc-blade-toolbar/vc-blade-toolbar.vue";
import { VcButton, VcIcon } from "./../../";
import vcPopupError from "../../../../shared/components/common/popup/vc-popup-error.vue";
import { useLocalStorage } from "@vueuse/core";

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
  widgets: void;
}>();

defineEmits<Emits>();
const attrs = useAttrs();
const { maximized, error }: { maximized?: Ref<boolean>; error?: Ref<string> } = toRefs(reactive(attrs));
const { t } = useI18n({ useScope: "global" });
const widgetsRef = ref();
const widgetsContainerRef = ref();

const isExpanded = useLocalStorage("VC_BLADE_WIDGETS_IS_EXPANDED", true);

const toggleWidgets = () => {
  isExpanded.value = !isExpanded.value;
};
const isWidgetContainerEmpty = ref(false);

const checkEmpty = (el: HTMLElement) => {
  const isEmpty = !el.innerText.trim() && Array.from(el.children).every((node) => node.nodeType === Node.COMMENT_NODE);
  isWidgetContainerEmpty.value = isEmpty;
};

onMounted(() => {
  if (widgetsRef.value) {
    checkEmpty(widgetsContainerRef.value);
  }
});

onUpdated(() => {
  if (widgetsRef.value) {
    checkEmpty(widgetsContainerRef.value);
  }
});

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
  --blade-background-color: var(--additional-50);
  --blade-border-radius: 6px;
  --blade-color-error: var(--danger-500);
  --blade-color-unsaved-changes: var(--secondary-300);

  --blade-border-color: var(--neutrals-200);
  --blade-icon-color: var(--secondary-400);
  --blade-icon-hover-color: var(--secondary-500);

  --blade-widgets-width: 50px;
  --blade-widgets-width-expanded: 120px;

  --blade-shadow-color: var(--primary-700);
  --blade-shadow: 2px 2px 8px rgb(from var(--blade-shadow-color) r g b / 14%);

  --blade-text-color: var(--additional-50);
}

.vc-app_mobile .vc-blade {
  @apply tw-m-0 tw-rounded-none;
}

.vc-app_mobile .vc-blade__widgets {
  @apply tw-flex tw-flex-row;
}
</style>
