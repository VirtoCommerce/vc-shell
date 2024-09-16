<template>
  <div
    ref="container"
    v-on-click-outside="reset"
    v-touch:hold="handleHold"
    class="vc-table-mobile tw-select-none tw-block tw-overflow-visible"
    @click="handleClick"
    @contextmenu.prevent
  >
    <div
      ref="target"
      class="tw-w-full tw-h-full tw-flex-shrink-0 tw-bg-[--table-mobile-background-color] tw-flex tw-flex-row"
      :class="{ animated: !isSwiping, 'vc-table-mobile__item_selected': isSelected }"
    >
      <div
        v-if="anySelected"
        class="tw-pl-4 tw-flex tw-items-center tw-justify-center tw-border-b tw-border-solid tw-border-b-[color:var(--table-mobile-checkbox-border-color)]"
      >
        <VcCheckbox
          :model-value="unref(isSelected ?? false)"
          :disabled="disabledSelection?.includes(items[index])"
          size="m"
        ></VcCheckbox>
      </div>
      <div class="tw-flex-auto tw-flex tw-flex-row tw-relative">
        <!-- Left swipe actions -->
        <div
          v-if="leftSwipeActions && leftSwipeActions.length && direction === 'right'"
          class="tw-flex-shrink-0 tw-flex tw-flex-col [justify-content:stretch] tw-bg-[--table-mobile-action-bg] tw-absolute tw-top-0 tw-bottom-0"
          :style="{
            width: actionsWidth,
          }"
        >
          <div
            class="tw-flex tw-grow tw-basis-[1] tw-flex-col tw-justify-center tw-items-center tw-text-white"
            :class="[`vc-table-mobile__item-action_${leftSwipeActions[0].type}`]"
            @click.stop="leftSwipeActions?.[0].clickHandler(items[index] as T, index)"
          >
            <VcIcon :icon="leftSwipeActions[0].icon" />
            <div class="tw-mt-1 tw-text-lg tw-text-center">
              {{ leftSwipeActions[0].title }}
            </div>
          </div>
        </div>
        <div
          class="tw-flex tw-flex-col tw-border-b tw-border-solid tw-border-b-[color:var(--table-mobile-border-color)] tw-grow"
          :style="{ transform: `translateX(${left})` }"
        >
          <slot></slot>
        </div>
        <!-- Item actions -->
        <div
          v-if="rightSwipeActions && rightSwipeActions.length && direction === 'left'"
          class="tw-flex-shrink-0 tw-flex tw-flex-col [justify-content:stretch] tw-bg-[--table-mobile-action-bg] tw-absolute tw-top-0 tw-bottom-0 tw-right-0"
          :style="{
            width: actionsWidth,
          }"
        >
          <div
            v-for="(action, index) in rightSwipeActions.slice(0, rightSwipeActions.length > 2 ? 1 : 2)"
            :key="`rightSwipeAction-${index}`"
            class="tw-flex tw-grow tw-basis-[1] tw-flex-col tw-justify-center tw-items-center tw-text-[color:var(--table-mobile-action-text-color)]"
            :class="[`vc-table-mobile__item-action_${action.type}`]"
            @click.stop="action.clickHandler(items[index] as T, index)"
          >
            <VcIcon :icon="action.icon" />
            <div class="tw-mt-1 tw-text-lg tw-text-center">
              {{ action.title }}
            </div>
          </div>

          <!-- Other available actions -->
          <template v-if="rightSwipeActions.length > 2">
            <div
              class="tw-flex tw-grow tw-basis-[1] tw-flex-col tw-justify-center tw-items-center tw-text-[color:var(--table-mobile-action-text-color)]"
              @click.stop="isActionsPopupVisible = true"
            >
              <VcIcon icon="fas fa-ellipsis-h" />
              <div class="tw-mt-1 tw-text-lg">{{ $t("COMPONENTS.ORGANISMS.VC_TABLE.MORE") }}</div>
            </div>

            <!-- Actions popup -->
            <teleport
              v-if="isActionsPopupVisible"
              to="body"
            >
              <div
                class="tw-absolute tw-left-0 tw-top-0 tw-right-0 tw-bottom-0 tw-bg-[--table-mobile-action-popup-overlay] tw-flex tw-items-center tw-justify-center tw-z-[99]"
              >
                <div
                  class="tw-bg-[--table-mobile-action-popup-bg] tw-rounded-[6px] tw-overflow-hidden tw-p-5 tw-max-w-[80%] tw-w-[350px] tw-border tw-border-solid tw-border-[--table-mobile-action-popup-border-color] tw-box-border [box-shadow:var(--table-mobile-action-popup-shadow)]"
                >
                  <div class="tw-flex tw-w-full tw-items-center">
                    <span
                      class="tw-grow tw-text-[color:var(--table-mobile-action-popup-title-color)] tw-text-[19px] tw-font-semibold tw-tracking-[-0.01em]"
                    >
                      {{ t("COMPONENTS.ORGANISMS.VC_TABLE.ALL_ACTIONS") }}
                    </span>
                    <VcIcon
                      class="tw-text-[color:var(--table-mobile-action-popup-icon-color)]"
                      icon="fas fa-times-circle"
                      size="xl"
                      @click="isActionsPopupVisible = false"
                    ></VcIcon>
                  </div>

                  <div class="tw-flex tw-flex-wrap tw-my-5 tw-justify-between">
                    <div
                      v-for="(itemAction, i) in itemActions"
                      :key="i"
                      class="tw-flex tw-grow tw-shrink-0 tw-flex-col tw-items-center tw-text-[color:var(--table-mobile-action-popup-action-text-color)] tw-my-2 tw-box-border tw-p-1 tw-max-w-[80px]"
                      @click="itemAction.clickHandler(items[index] as T, index)"
                    >
                      <VcIcon
                        :icon="itemAction.icon"
                        size="xl"
                      ></VcIcon>
                      <div class="tw-text-base tw-mt-2 tw-text-center">
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
    <div class="tw-flex tw-justify-between tw-flex-auto"></div>
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
  --table-mobile-action-popup-border-color: var(--neutrals-200);
  --table-mobile-action-popup-title-color: var(--neutrals-700);
  --table-mobile-action-popup-icon-color: var(--secondary-600);
  --table-mobile-action-popup-action-text-color: var(--primary-500);
  --table-mobile-action-success: var(--success-400);
  --table-mobile-action-danger: var(--danger-500);
  --table-mobile-action-selected: var(--secondary-100);
}

.vc-table-mobile {
  // height: -webkit-fill-available;
  &__item {
    &-action {
      &_success {
        @apply tw-bg-[--table-mobile-action-success];
      }

      &_danger {
        @apply tw-bg-[--table-mobile-action-danger];
      }
    }

    &_selected {
      @apply tw-bg-[--table-mobile-action-selected] #{!important};
    }
  }
}
</style>
