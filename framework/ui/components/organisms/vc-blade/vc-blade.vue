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
    <BladeHeader
      v-if="!($isMobile.value && blades.length === 1 && !$slots['actions'])"
      class="vc-blade__header"
      :closable="closable"
      :icon="icon"
      :title="title"
      :subtitle="subtitle"
      :modified="modified"
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
          <VcBreadcrumbs :items="blade.breadcrumbs" collapsed>
            <template #trigger="{ click, isActive }">
              <VcButton
                text
                icon="lucide-ellipsis-vertical"
                icon-size="xl"
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
    </BladeHeader>

    <BladeStatusBanners :modified="modified" />

    <!-- Set up blade toolbar -->
    <BladeToolbar
      class="vc-blade__toolbar"
      :items="toolbarItems"
    >
      <template #widgets-container>
        <WidgetContainer :blade-id="blade?.id ?? ''" />
      </template>
    </BladeToolbar>

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
import { ref, inject } from "vue";
import { IBladeToolbar } from "@core/types";
import { useBladeNavigation } from "@shared";
import BladeHeader from "@ui/components/organisms/vc-blade/_internal/BladeHeader.vue";
import BladeToolbar from "@ui/components/organisms/vc-blade/_internal/BladeToolbar.vue";
import BladeStatusBanners from "@ui/components/organisms/vc-blade/_internal/BladeStatusBanners.vue";
import { VcButton } from "@ui/components/atoms/vc-button";
import { BladeInstance, BLADE_BACK_BUTTON } from "@framework/injection-keys";
import WidgetContainer from "@ui/components/organisms/vc-blade/_internal/widgets/WidgetContainer.vue";
import { DEFAULT_BLADE_INSTANCE } from "@ui/components/organisms/vc-blade/constants";

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
  toolbarItems: () => [],
  modified: undefined,
});

const slots = defineSlots<{
  actions(): void;
  default(): void;
  /**
   * @deprecated
   * Use `useWidgets` composable instead
   * @example
   * // Register widget in blade:
   * const blade = useBlade();
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
  widgets(): void;
}>();

const emit = defineEmits<Emits>();

const blade = inject(BladeInstance, DEFAULT_BLADE_INSTANCE);

const backButton = inject(BLADE_BACK_BUTTON);

const { blades } = useBladeNavigation();

const bladeRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
</script>

<style lang="scss">
:root {
  --blade-background-color: var(--additional-50);
  --blade-color-error: var(--danger-500);
  --blade-color-unsaved-changes: var(--secondary-600);
  --blade-border-color: var(--neutrals-200);
  --blade-shadow-color: var(--primary-700);
  --blade-shadow: 2px 2px 8px rgb(from var(--blade-shadow-color) r g b / 14%);
  --blade-text-color: var(--additional-50);
}

.vc-blade {
  @apply tw-relative tw-flex tw-shrink-0 tw-flex-col tw-overflow-hidden;
  @apply tw-bg-[color:var(--blade-background-color)] tw-border tw-border-solid tw-border-[--blade-border-color];
  // Use shared transition timing for synchronized animations with AI panel
  transition: width var(--app-panel-transition-duration, 0.3s) var(--app-panel-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));

  &__back-button {
    @apply tw-mr-[14px];
  }

  &--mobile {
    @apply tw-w-full !important;
  }

  &--expanded {
    @apply tw-w-full tw-shrink !important;
  }

  &--maximized {
    @apply tw-absolute tw-z-[2] tw-top-0 tw-bottom-0 tw-left-0 tw-shrink !important;
    width: -webkit-fill-available !important;
    width: -moz-available !important;
    width: stretch !important;
  }

  &__header {
    @apply tw-shrink-0;

    &--hidden {
      @apply tw-hidden;
    }
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
    @apply tw-flex tw-flex-auto tw-flex-col tw-relative;

    &--desktop {
      @apply tw-w-0;
    }

    &--mobile {
      @apply tw-h-0;
    }
  }

  &__breadcrumbs {
    @apply tw-mr-[10px];

    &-button {
      @apply tw-text-[color:var(--blade-header-breadcrumbs-button-color)] tw-cursor-pointer hover:tw-text-[color:var(--blade-header-breadcrumbs-button-color-hover)] !important;

      &--active {
        @apply tw-text-[color:var(--blade-header-breadcrumbs-button-color-hover)] !important;
      }
    }
  }

}

.vc-app--mobile .vc-blade {
  @apply tw-m-0 tw-rounded-none;
}
</style>
