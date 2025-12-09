<template>
  <div class="tw-w-full tw-flex tw-flex-col tw-grow tw-basis-0">
    <render></render>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, inject, h, toRef, VNode, nextTick, TransitionGroup } from "vue";
import { RouterView, useRoute } from "vue-router";
import { BladeVNode, IParentCallArgs, useBladeNavigation } from "./../../../../../shared";
import { ErrorInterceptor } from "./../../../error-interceptor";
import { useBreadcrumbs } from "./../../../../../core/composables/useBreadcrumbs";
import { VcBladeView } from "./../vc-blade-view/vc-blade-view";
import { watchDebounced } from "@vueuse/core";
import VcMobileBackButton from "./_internal/vc-mobile-back-button.vue";
import { AiAgentServiceKey } from "./../../../../../injection-keys";

const { blades, closeBlade, onParentCall, clearBladeError } = useBladeNavigation();
const { breadcrumbs, push, remove } = useBreadcrumbs();
const route = useRoute();

// Inject AI Agent service to check if panel is expanded
const aiAgentService = inject(AiAgentServiceKey, undefined);
const isAiPanelExpanded = computed(() => aiAgentService?.isExpanded.value ?? false);

const quantity = computed(() => {
  return (
    blades.value.filter((x) => x.props.navigation.isVisible || typeof x.props.navigation.isVisible === "undefined")
      .length || 0
  );
});

const isMobile = inject("isMobile") as Ref<boolean>;

// Calculate how many blades to show based on AI panel state
// When AI panel is expanded, show only 1 blade (it takes 50% with AI panel taking other 50%)
const visibleBladesCount = computed(() => {
  if (isMobile.value) return 1;
  if (isAiPanelExpanded.value) return 1;
  return 2;
});

watchDebounced(
  blades,
  (newVal) => {
    breadcrumbs.value.forEach((breadcrumb) => breadcrumb && remove([breadcrumb.id]));

    newVal.forEach((blade) => {
      push({
        id: blade.props.navigation.idx.toString(),
        title: toRef(blade.props.navigation.instance ?? { title: "" }, "title"),
        clickHandler: async (id) => {
          if (blade.props.navigation.isVisible === false) {
            blade.props.navigation.isVisible = true;
          }
          const isPrevented = await closeBlade(parseInt(id) + 1);
          return !isPrevented;
        },
      });
    });
  },
  {
    deep: true,
    immediate: true,
    flush: "post",
    debounce: 10,
  },
);

const render = () => {
  if (!(route.matched[1]?.components?.default as BladeVNode)?.type?.isBlade) {
    return h(RouterView);
  }

  return h("div", { class: "vc-blade-navigation__container" }, [
    h(
      TransitionGroup,
      {
        name: "blade-slide",
        tag: "div",
        class: "vc-blade-navigation__blades",
      },
      () =>
        blades.value?.reduce(
          (arr, bladeVNode, index) => {
            if (bladeVNode.type.isBlade) {
              const hiddenQuantity = blades.value.filter(
                (x) => x.props.navigation.isVisible === false && x.props.navigation.idx < index,
              ).length;

              const isVisible =
                (bladeVNode.props.navigation.isVisible ||
                  typeof bladeVNode.props.navigation.isVisible === "undefined") &&
                index >= quantity.value - visibleBladesCount.value;

              // Only render visible blades for TransitionGroup animation
              if (isVisible) {
                const filteredBreadcrumbs = breadcrumbs.value.slice(0, index);
                arr.push(
                  h(
                    ErrorInterceptor,
                    {
                      key: `blade_${bladeVNode.type?.name}_${index}`,
                      capture: true,
                    },
                    {
                      default: ({
                        error: interceptorError,
                        reset: resetInterceptor,
                      }: Parameters<InstanceType<typeof ErrorInterceptor>["$slots"]["default"]>["0"]) => {
                        const bladeNavigation = bladeVNode.props.navigation;
                        const activeError = computed(() => interceptorError || bladeNavigation.error?.value);
                        const handleResetError = () => {
                          if (interceptorError) {
                            resetInterceptor();
                          }
                          if (bladeNavigation.error?.value) {
                            clearBladeError(bladeNavigation.idx);
                          }
                        };

                        return h(
                          VcBladeView,
                          {
                            key: `${bladeVNode.type?.name}_${index}` || `blade_${index}`,
                            blade: bladeVNode,
                            expandable: quantity.value > 1,
                            error: activeError.value,
                            "onReset:error": handleResetError,
                            breadcrumbs: filteredBreadcrumbs,
                            backButton:
                              quantity.value > 1
                                ? h(VcMobileBackButton, {
                                    breadcrumbs: filteredBreadcrumbs,
                                    onBack: () => {
                                      closeBlade(index);
                                    },
                                  })
                                : undefined,
                          },
                          {
                            default: ({ Component }: { Component: BladeVNode }) => {
                              return h(Component, {
                                closable: index >= 1,
                                expanded: index - hiddenQuantity === quantity.value - 1,
                                "onClose:blade": () => {
                                  if (index === 0) return;
                                  closeBlade(index);
                                },
                                "onParent:call": async (args: IParentCallArgs) => {
                                  await nextTick(async () => {
                                    // Use the centralized onParentCall with the current blade index
                                    await onParentCall(args, index);
                                  });
                                },
                                onVnodeUnmounted: resetInterceptor,
                              });
                            },
                          },
                        );
                      },
                    },
                  ),
                );
              }
            }

            return arr;
          },
          [] as unknown as VNode[],
        ),
    ),
  ]);
};
</script>

<style lang="scss">
:root {
  --blade-navigation-bg-color: var(--additional-50);
  --blade-navigation-shadow-color: var(--additional-950);
  --blade-navigation-shadow: 2px 2px 8px rgb(from var(--blade-navigation-shadow-color) r g b / 7%);
  --blade-navigation-border-radius: var(--blade-border-radius);
}

.vc-blade-navigation__container {
  @apply tw-overflow-hidden tw-flex tw-grow tw-basis-0 tw-relative;
  // Use shared transition timing for synchronized animations with AI panel
  transition: width var(--app-panel-transition-duration, 0.3s) var(--app-panel-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
}

.vc-blade-navigation__blades {
  @apply tw-flex tw-grow tw-basis-0 tw-h-full tw-relative;
}

// Blade slide animation
.blade-slide-enter-active,
.blade-slide-leave-active {
  transition:
    transform var(--app-panel-transition-duration, 0.3s) var(--app-panel-transition-timing, cubic-bezier(0.4, 0, 0.2, 1)),
    opacity var(--app-panel-transition-duration, 0.3s) var(--app-panel-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
}

.blade-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.blade-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.blade-slide-enter-to,
.blade-slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}

// Ensure proper stacking during animation
.blade-slide-leave-active {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
}

// Move animation for existing blades when new one enters
.blade-slide-move {
  transition: transform var(--app-panel-transition-duration, 0.3s) var(--app-panel-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
}
</style>
