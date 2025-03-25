<template>
  <div
    ref="bladeRef"
    class="vc-blade"
    :class="[
      $attrs.class,
      {
        'vc-blade--mobile': $isMobile.value,
        'vc-blade--expanded': expanded,
        'vc-blade--maximized': blade.maximized,
      },
    ]"
    :style="{ width: typeof width === 'number' ? `${width}px` : width }"
  >
    <!-- Init blade header -->
    <VcBladeHeader
      v-if="!($isMobile.value && blades.length === 1 && !$slots['actions'])"
      class="vc-blade__header"
      :closable="closable"
      :icon="icon"
      :title="title"
      :subtitle="subtitle"
      :modified="typeof modified !== 'undefined' ? modified : undefined"
      @close="$emit('close')"
      @expand="$emit('expand')"
      @collapse="$emit('collapse')"
    >
      <template #prepend>
        <component
          :is="backButton"
          v-if="backButton && $isMobile.value"
          class="vc-blade__back-button"
        />

        <div
          v-if="blade.breadcrumbs?.length && $isDesktop.value"
          class="vc-blade__breadcrumbs"
        >
          <VcBreadcrumbs :items="blade.breadcrumbs">
            <template #trigger="{ click, isActive }">
              <VcButton
                text
                :icon="VertDotsIcon"
                icon-size="m"
                class="vc-blade__breadcrumbs-button"
                :class="{
                  'vc-blade__breadcrumbs-button--active': isActive,
                }"
                @click="click"
              />
            </template>
          </VcBreadcrumbs>
        </div>
      </template>

      <template
        v-if="$slots['actions']"
        #actions
      >
        <slot name="actions"></slot>
      </template>
    </VcBladeHeader>

    <!-- Show error message -->
    <template v-if="blade.error">
      <div class="vc-blade__error">
        <VcIcon
          size="s"
          icon="fas fa-exclamation-triangle"
        />
        <div class="vc-blade__error-text">{{ blade.error }}</div>
        <VcButton
          text
          class="vc-blade__error-button"
          @click="open()"
        >
          {{ t("COMPONENTS.ORGANISMS.VC_BLADE.SEE_DETAILS") }}
        </VcButton>
      </div>
    </template>

    <!-- Unsaved changes -->
    <template v-if="typeof modified !== 'undefined' ? modified : false">
      <div class="vc-blade__unsaved-changes">
        <VcIcon
          size="s"
          icon="fas fa-info-circle"
        />
        <div class="vc-blade__unsaved-changes-text">
          {{ t("COMPONENTS.ORGANISMS.VC_BLADE.UNSAVED_CHANGES") }}
        </div>
      </div>
    </template>

    <!-- Set up blade toolbar -->
    <VcBladeToolbar
      class="vc-blade__toolbar"
      :items="toolbarItems"
    >
      <template #widgets-container>
        <VcWidgetContainer :blade-id="blade?.id ?? ''" />
      </template>
    </VcBladeToolbar>

    <div
      ref="contentRef"
      class="vc-blade__content"
    >
      <div
        class="vc-blade__main"
        :class="{ 'vc-blade__main--mobile': $isMobile.value }"
      >
        <div
          class="vc-blade__slot"
          :class="{
            'vc-blade__slot--desktop': $isDesktop.value,
            'vc-blade__slot--mobile': $isMobile.value,
          }"
        >
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toValue, inject, useSlots, defineComponent, h } from "vue";
import { IBladeToolbar } from "../../../../core/types";
import { usePopup, useBladeNavigation } from "../../../../shared";
import { useI18n } from "vue-i18n";
import { default as VcBladeHeader } from "./_internal/vc-blade-header/vc-blade-header.vue";
import { default as VcBladeToolbar } from "./_internal/vc-blade-toolbar/vc-blade-toolbar.vue";
import { VcButton, VcIcon, VcLink } from "../../";
import vcPopupError from "../../../../shared/components/common/popup/vc-popup-error.vue";
import { BladeInstance, BLADE_BACK_BUTTON } from "../../../../injection-keys";
import { default as VcWidgetContainer } from "./_internal/vc-blade-widget-container/vc-widget-container.vue";
import VertDotsIcon from "../../atoms/vc-icon/icons/VertDotsIcon.vue";
import { FALLBACK_BLADE_ID } from "../../../../core/constants";

export interface Props {
  icon?: string;
  title?: string;
  subtitle?: string;
  width?: number | string;
  expanded?: boolean;
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

const slots = defineSlots<{
  actions: void;
  default: void;
  /**
   * @deprecated
   * Use `useWidgets` composable instead
   * @example
   * // Register widget in blade:
   * const blade = inject(BladeInstance);
   * const widgetService = useWidgets();
   * widgetService.registerWidget({
   *   id: "widget-id",
   *   component: () => import("./MyWidget.vue"),
   *   props: {
   *     myProp: '123',
   *    },
   *   events: {
   *     "onChangeProp": (val: unknown) => {
   *       console.log(val);
   *     },
   *   },
   * }, blade.id);
   *
   * // Clear widgets on blade unmount:
   * onBeforeUnmount(() => {
   *   if (blade?.value.id) {
   *     widgetService.clearBladeWidgets(blade.value.id);
   *   }
   * });
   */
  widgets: void;
  backButton: void;
}>();

const emit = defineEmits<Emits>();

const blade = inject(
  BladeInstance,
  computed(() => ({
    id: FALLBACK_BLADE_ID,
    error: undefined,
    expandable: false,
    maximized: false,
    navigation: undefined,
    breadcrumbs: undefined,
  })),
);

const backButton = inject(BLADE_BACK_BUTTON);

const { t } = useI18n({ useScope: "global" });
const { blades } = useBladeNavigation();

const bladeRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);

const { open } = usePopup({
  component: vcPopupError,
  slots: {
    default: computed(() => toValue(blade.value.error)),
    header: defineComponent({
      render: () =>
        h("div", [
          t("COMPONENTS.ORGANISMS.VC_BLADE.ERROR_POPUP.TITLE"),
          " ",
          h(
            VcLink,
            { onClick: () => navigator.clipboard.writeText(toValue(blade.value.error) ?? "") },
            `(${t("COMPONENTS.ORGANISMS.VC_BLADE.ERROR_POPUP.COPY_ERROR")})`,
          ),
        ]),
    }),
  },
});
</script>

<style lang="scss">
:root {
  --blade-background-color: var(--additional-50);
  --blade-color-error: var(--danger-500);
  --blade-color-unsaved-changes: var(--secondary-600);

  --blade-border-color: var(--neutrals-200);
  --blade-icon-color: var(--secondary-400);
  --blade-icon-hover-color: var(--secondary-500);

  --blade-widgets-width: 50px;
  --blade-widgets-width-expanded: 120px;

  --blade-shadow-color: var(--primary-700);
  --blade-shadow: 2px 2px 8px rgb(from var(--blade-shadow-color) r g b / 14%);

  --blade-text-color: var(--additional-50);

  --blade-widgets-bg-color: var(--neutrals-100);
  --blade-widgets-more-color: var(--neutrals-600);
}

.vc-blade {
  @apply tw-relative tw-flex tw-shrink-0 tw-flex-col tw-overflow-hidden tw-transition-[width] tw-duration-200;
  @apply tw-bg-[color:var(--blade-background-color)] tw-border tw-border-solid tw-border-[--blade-border-color];

  &__back-button {
    @apply tw-mr-[14px];
  }

  &--mobile {
    @apply tw-w-full #{!important};
  }

  &--expanded {
    @apply tw-w-full tw-shrink #{!important};
  }

  &--maximized {
    @apply tw-absolute tw-z-[2] tw-top-0 tw-bottom-0 tw-left-0 tw-shrink #{!important};
    width: -webkit-fill-available !important;
    width: -moz-available !important;
  }

  &__header {
    @apply tw-shrink-0;

    &--hidden {
      @apply tw-hidden;
    }
  }

  &__error {
    @apply tw-text-[color:var(--blade-text-color)] tw-p-2 tw-flex tw-flex-row tw-items-center tw-bg-[color:var(--blade-color-error)];
  }

  &__error-text {
    @apply tw-line-clamp-1 tw-w-full tw-mx-2;
  }

  &__error-button {
    @apply tw-shrink-0 tw-opacity-80  hover:tw-opacity-100 hover:tw-text-[color:var(--blade-text-color)];
    @apply tw-text-[color:var(--blade-text-color)] #{!important};
  }

  &__unsaved-changes {
    @apply tw-text-[color:var(--blade-text-color)] tw-px-2 tw-py-1 tw-flex tw-flex-row tw-items-center tw-bg-[color:var(--blade-color-unsaved-changes)];
  }

  &__unsaved-changes-text {
    @apply tw-line-clamp-1 tw-w-full tw-ml-2;
  }

  &__toolbar {
    @apply tw-shrink-0;

    &--hidden {
      @apply tw-hidden;
    }
  }

  &__content {
    @apply tw-flex-1 tw-overflow-auto;
  }

  &__main {
    @apply tw-flex tw-flex-row tw-h-full;

    &--mobile {
      @apply tw-flex-col;
    }
  }

  &__slot {
    @apply tw-flex tw-flex-auto tw-flex-col;

    &--desktop {
      @apply tw-w-0;
    }

    &--mobile {
      @apply tw-h-0;
    }
  }

  &__widget-more {
    @apply tw-flex tw-flex-col tw-items-center tw-justify-center tw-bg-[color:var(--blade-widgets-bg-color)] tw-px-2 tw-text-xs tw-gap-1 tw-text-[color:var(--blade-widgets-more-color)];
  }

  &__widgets {
    @apply tw-flex tw-flex-row;
  }

  &__breadcrumbs {
    @apply tw-mr-[10px];

    &-button {
      @apply tw-text-[color:var(--blade-header-breadcrumbs-button-color)] tw-cursor-pointer hover:tw-text-[color:var(--blade-header-breadcrumbs-button-color-hover)] #{!important};

      &--active {
        @apply tw-text-[color:var(--blade-header-breadcrumbs-button-color-hover)] #{!important};
      }
    }
  }

  // &__widgets {
  //   @apply tw-flex;

  //   &--desktop {
  //     @apply tw-border-l tw-border-solid tw-border-l-[color:var(--blade-border-color)];
  //   }

  //   &--not-expanded {
  //     @apply tw-w-12 tw-flex-col;
  //   }

  //   &--expanded {
  //     @apply tw-w-32 tw-flex-col;
  //   }

  //   &--mobile {
  //     @apply tw-w-auto tw-border-t tw-border-solid tw-border-t-[color:var(--blade-border-color)] tw-flex-row;
  //   }
  // }

  // &__widget-container {
  //   @apply tw-flex tw-overflow-y-auto tw-flex-row;

  //   // &--desktop {
  //   //   @apply tw-flex-col tw-overflow-x-clip;
  //   // }

  //   // &--mobile {
  //   //   @apply tw-flex-row;
  //   // }
  // }

  &__widget-toggle {
    @apply tw-flex;

    &--desktop {
      @apply tw-flex-col tw-justify-end tw-max-h-14 tw-h-full tw-mt-auto;
    }

    &--mobile {
      @apply tw-w-12 tw-max-w-12 tw-bg-[color:var(--blade-background-color)] tw-items-center tw-justify-center tw-px-4 tw-ml-auto tw-mt-0;
    }
  }

  &__toggle-icon {
    @apply tw-flex-auto tw-items-center tw-self-center tw-justify-self-center tw-text-[color:var(--blade-icon-color)] tw-cursor-pointer hover:tw-text-[color:var(--blade-icon-hover-color)];
    @apply tw-flex #{!important};
  }

  &__toggle-icon--desktop {
  }

  &__spacer {
    @apply tw-flex-1;
  }

  &__toolbar-container-inner {
    @apply tw-flex-1 tw-justify-end;

    &:empty {
      @apply tw-hidden;
    }
  }

  &__breadcrumbs-button {
    @apply tw-p-0 #{!important};
  }
}

.vc-app_mobile .vc-blade {
  @apply tw-m-0 tw-rounded-none;
}

.vc-app_mobile .vc-blade__widgets {
  @apply tw-flex tw-flex-row;
}
</style>
