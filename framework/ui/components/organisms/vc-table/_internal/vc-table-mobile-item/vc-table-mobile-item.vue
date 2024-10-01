<template>
  <div
    ref="container"
    v-on-click-outside="reset"
    v-touch:hold="handleHold"
    class="vc-table-mobile"
    @click="handleClick"
    @contextmenu.prevent
  >
    <div
      ref="target"
      class="vc-table-mobile__item"
      :class="{ animated: !isSwiping, 'vc-table-mobile__item_selected': isSelected }"
    >
      <div
        v-if="anySelected"
        class="vc-table-mobile__checkbox-container"
      >
        <VcCheckbox
          :model-value="unref(isSelected ?? false)"
          :disabled="disabledSelection?.includes(items[index])"
          size="m"
        ></VcCheckbox>
      </div>
      <div class="vc-table-mobile__content">
        <!-- Left swipe actions -->
        <div
          v-if="leftSwipeActions && leftSwipeActions.length && direction === 'right'"
          class="vc-table-mobile__swipe-actions vc-table-mobile__swipe-actions_left"
          :style="{ width: actionsWidth }"
        >
          <div
            class="vc-table-mobile__action"
            :class="`vc-table-mobile__item-action_${leftSwipeActions[0].type}`"
            @click.stop="leftSwipeActions?.[0].clickHandler(items[index] as T, index)"
            @touchstart.stop
          >
            <VcIcon :icon="leftSwipeActions[0].icon" />
            <div class="vc-table-mobile__action-title">
              {{ leftSwipeActions[0].title }}
            </div>
          </div>
        </div>
        <div
          class="vc-table-mobile__slot"
          :style="{ transform: `translateX(${left})` }"
        >
          <slot></slot>
        </div>
        <!-- Item actions -->
        <div
          v-if="rightSwipeActions && rightSwipeActions.length && direction === 'left'"
          class="vc-table-mobile__swipe-actions vc-table-mobile__swipe-actions_right"
          :style="{ width: actionsWidth }"
          @touchstart.stop
        >
          <div
            v-for="(action, idx) in rightSwipeActions.slice(0, rightSwipeActions.length > 2 ? 1 : 2)"
            :key="`rightSwipeAction-${idx}`"
            class="vc-table-mobile__action"
            :class="`vc-table-mobile__item-action_${action.type}`"
            @click.stop="action.clickHandler(items[index] as T, index)"
          >
            <VcIcon :icon="action.icon" />
            <div class="vc-table-mobile__action-title">
              {{ action.title }}
            </div>
          </div>

          <!-- Other available actions -->
          <template v-if="rightSwipeActions.length > 2">
            <div
              class="vc-table-mobile__action vc-table-mobile__action_more"
              @click.stop="isActionsPopupVisible = true"
            >
              <VcIcon icon="fas fa-ellipsis-h" />
              <div class="vc-table-mobile__action-title">
                {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.MORE") }}
              </div>
            </div>

            <!-- Actions popup -->
            <teleport
              v-if="isActionsPopupVisible"
              to="body"
            >
              <div class="vc-table-mobile__actions-popup-overlay">
                <div class="vc-table-mobile__actions-popup">
                  <div class="vc-table-mobile__actions-popup-header">
                    <span class="vc-table-mobile__actions-popup-title">
                      {{ t("COMPONENTS.ORGANISMS.VC_TABLE.ALL_ACTIONS") }}
                    </span>
                    <VcIcon
                      class="vc-table-mobile__actions-popup-close"
                      icon="fas fa-times-circle"
                      size="xl"
                      @click="isActionsPopupVisible = false"
                    ></VcIcon>
                  </div>

                  <div class="vc-table-mobile__actions-popup-content">
                    <div
                      v-for="(itemAction, i) in itemActions"
                      :key="i"
                      class="vc-table-mobile__actions-popup-action"
                      @click="itemAction.clickHandler(items[index] as T, index)"
                    >
                      <VcIcon
                        :icon="itemAction.icon"
                        size="xl"
                      ></VcIcon>
                      <div class="vc-table-mobile__actions-popup-action-title">
                        {{ itemAction.title }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </teleport>
          </template>
        </div>
      </div>
    </div>
    <div class="vc-table-mobile__spacer"></div>
  </div>
</template>

<script lang="ts" setup generic="T extends TableItem | string">
import { Ref, computed, ref, watch, unref } from "vue";
import { IActionBuilderResult } from "../../../../../../core/types";
import { useI18n } from "vue-i18n";
import { useSwipe } from "@vueuse/core";
import { vOnClickOutside } from "@vueuse/components";

export interface Emits {
  (event: "swipeStart", id: string): void;
  (event: "click"): void;
  (event: "select"): void;
}
export interface TableItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
  actions?: IActionBuilderResult[];
}

const props = defineProps<{
  items: T[];
  actionBuilder?: (item: T) => IActionBuilderResult[] | undefined;
  swipingItem?: string;
  isSelected?: boolean;
  index: number;
  selection?: T[];
  disabledSelection?: (TableItem | string)[];
}>();

const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: "global" });

const isActionsPopupVisible = ref(false);
const itemActions: Ref<IActionBuilderResult<T>[] | undefined> = ref([]);
const target = ref<HTMLElement | null>(null);
const container = ref<HTMLElement | null>(null);
const containerWidth = computed(() => container.value?.offsetWidth);
const left = ref("0");
const anySelected = computed(() => props.selection && props.selection.length > 0);

const actionsWidth = ref("0");

const { isSwiping, lengthX } = useSwipe(target, {
  threshold: 0,
  onSwipeStart() {
    getActions();
    const item = props.items[props.index];
    if (typeof item !== "string") {
      emit("swipeStart", item.id);
    }
    if (containerWidth.value) {
      reset();
    }
  },
  onSwipe() {
    if (containerWidth.value) {
      if (lengthX.value < 0 && leftSwipeActions.value && leftSwipeActions.value.length) {
        left.value = `${Math.abs(lengthX.value)}px`;
      } else if (lengthX.value > 0 && rightSwipeActions.value && rightSwipeActions.value.length) {
        left.value = `${-lengthX.value}px`;
      }

      actionsWidth.value = `${Math.abs(lengthX.value)}px`;
    }
  },
  onSwipeEnd() {
    if (containerWidth.value && Math.abs(lengthX.value) / containerWidth.value >= 0.1) {
      if (lengthX.value < 0 && leftSwipeActions.value && leftSwipeActions.value.length) {
        left.value = "80px";
      } else if (lengthX.value > 0 && rightSwipeActions.value && rightSwipeActions.value.length) {
        left.value = "-80px";
      }

      actionsWidth.value = "80px";
    } else {
      reset();
    }
  },
});

const rightSwipeActions = computed(
  () =>
    (props.selection?.length === 0 &&
      itemActions.value &&
      itemActions.value.length &&
      itemActions.value.filter((actions: IActionBuilderResult) => actions.position === "right")) ||
    undefined,
);
const leftSwipeActions = computed(
  () =>
    (props.selection?.length === 0 &&
      itemActions.value &&
      itemActions.value.length &&
      itemActions.value.filter((actions: IActionBuilderResult) => actions.position === "left")) ||
    undefined,
);

watch(
  () => props.swipingItem,
  (newVal) => {
    const item = props.items[props.index];
    if (typeof item !== "string" && newVal !== item.id) {
      left.value = "0";
      actionsWidth.value = "0";
    }
  },
);

function reset() {
  left.value = "0";
  actionsWidth.value = "0";
}

const direction = computed(() => {
  if (lengthX.value < 0) {
    return "right";
  }
  return "left";
});

function getActions() {
  if (!(itemActions.value && itemActions.value.length)) {
    if (props.actionBuilder && typeof props.actionBuilder === "function") {
      itemActions.value = props.actionBuilder(props.items[props.index]);
    }
  }
}

function handleHold() {
  emit("select");
}

function handleClick() {
  if (anySelected.value) {
    emit("select");
    return;
  }
  emit("click");
}
</script>

<style lang="scss">
:root {
  --table-mobile-checkbox-border-color: var(--secondary-200);
  --table-mobile-background-color: var(--additional-50);
  --table-mobile-action-bg: var(--secondary-400);
  --table-mobile-border-color: var(--secondary-200);
  --table-mobile-action-text-color: var(--additional-50);
  --table-mobile-action-popup-overlay: var(--neutrals-100);
  --table-mobile-action-popup-bg: var(--additional-50);
  --table-mobile-action-popup-shadow-color: var(--secondary-200);
  --table-mobile-action-popup-shadow: 1px 1px 22px var(--table-mobile-action-popup-shadow-color);
  --table-mobile-action-popup-border-color: var(--base-border-color, var(--neutrals-200));
  --table-mobile-action-popup-title-color: var(--neutrals-700);
  --table-mobile-action-popup-icon-color: var(--secondary-600);
  --table-mobile-action-popup-action-text-color: var(--primary-500);
  --table-mobile-action-success: var(--success-400);
  --table-mobile-action-danger: var(--danger-500);
  --table-mobile-action-selected: var(--secondary-100);
}

.vc-table-mobile {
  @apply tw-select-none tw-block tw-overflow-visible;

  &__item {
    @apply tw-w-full tw-h-full tw-flex-shrink-0 tw-bg-[--table-mobile-background-color] tw-flex tw-flex-row;

    &.animated {
      transition: transform 0.3s ease;
    }

    &.vc-table-mobile__item_selected {
      @apply tw-bg-[--table-mobile-action-selected]  #{!important};
    }
  }

  &__checkbox-container {
    @apply tw-pl-4 tw-flex tw-items-center tw-justify-center tw-border-b tw-border-solid tw-border-b-[color:var(--table-mobile-checkbox-border-color)];
  }

  &__content {
    @apply tw-flex-auto tw-flex tw-flex-col tw-relative tw-w-full;
  }

  &__swipe-actions {
    @apply tw-flex-shrink-0 tw-flex tw-flex-col [justify-content:stretch] tw-bg-[--table-mobile-action-bg] tw-absolute tw-top-0 tw-bottom-0;

    &_left {
    }

    &_right {
      @apply tw-right-0;
    }
  }

  &__action {
    @apply tw-flex tw-grow tw-basis-[1] tw-flex-col tw-justify-center tw-items-center tw-text-[color:var(--table-mobile-action-text-color)];
  }

  &__action-title {
    @apply tw-mt-1 tw-text-lg tw-text-center;
  }

  &__item-action_success {
    @apply tw-bg-[--table-mobile-action-success];
  }

  &__item-action_danger {
    @apply tw-bg-[--table-mobile-action-danger];
  }

  &__item_selected {
    @apply tw-bg-[--table-mobile-action-selected] #{!important};
  }

  &__slot {
    @apply tw-flex tw-flex-col tw-border-b tw-border-solid tw-border-b-[color:var(--table-mobile-border-color)] tw-grow;
  }

  &__action_more {
    @apply tw-text-[--table-mobile-action-text-color];
  }

  &__actions-popup-overlay {
    @apply tw-absolute tw-left-0 tw-top-0 tw-right-0 tw-bottom-0 tw-bg-[--table-mobile-action-popup-overlay] tw-flex tw-items-center tw-justify-center tw-z-[99];
  }

  &__actions-popup {
    @apply tw-bg-[--table-mobile-action-popup-bg] tw-rounded-[6px] tw-overflow-hidden tw-p-5 tw-max-w-[80%] tw-w-[350px] tw-border tw-border-solid tw-border-[--table-mobile-action-popup-border-color] tw-box-border [box-shadow:var(--table-mobile-action-popup-shadow)];
  }

  &__actions-popup-header {
    @apply tw-flex tw-w-full tw-items-center;
  }

  &__actions-popup-title {
    @apply tw-grow tw-text-[color:var(--table-mobile-action-popup-title-color)] tw-text-[19px] tw-font-semibold tw-tracking-[-0.01em];
  }

  &__actions-popup-close {
    @apply tw-text-[color:var(--table-mobile-action-popup-icon-color)];
  }

  &__actions-popup-content {
    @apply tw-flex tw-flex-wrap tw-my-5 tw-justify-between;
  }

  &__actions-popup-action {
    @apply tw-flex tw-grow tw-shrink-0 tw-flex-col tw-items-center tw-text-[color:var(--table-mobile-action-popup-action-text-color)] tw-my-2 tw-box-border tw-p-1 tw-max-w-[80px];
  }

  &__actions-popup-action-title {
    @apply tw-text-base tw-mt-2 tw-text-center;
  }

  &__spacer {
    @apply tw-flex tw-justify-between tw-flex-auto;
  }
}
</style>
