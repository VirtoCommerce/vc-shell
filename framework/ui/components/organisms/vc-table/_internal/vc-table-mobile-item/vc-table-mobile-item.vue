<template>
  <div
    class="tw-relative tw-flex tw-flex-nowrap tw-items-stretch tw-transition tw-duration-200"
    :class="{ ' tw-transition-none': isMoving }"
    :style="`transform: translateX(${offsetX}px)`"
    @click="$emit('click')"
    @touchstart="touchStart"
    @touchmove="touchMove"
    @touchend="touchEnd"
    @touchcancel="touchCancel"
  >
    <!-- Left swipe actions-->
    <div
      v-if="leftSwipeActions && leftSwipeActions.length"
      class="tw-flex-shrink-0 tw-w-[80px] tw-flex tw-flex-col [justify-content:stretch] tw-bg-[#a9bfd2]"
    >
      <div
        class="tw-flex tw-grow tw-basis-[1] tw-flex-col tw-justify-center tw-items-center tw-text-white"
        :class="[`vc-table-mobile__item-action_${leftSwipeActions[0].variant}`]"
        @click.stop="leftSwipeActions[0].clickHandler(item as T)"
      >
        <VcIcon :icon="leftSwipeActions[0].icon"></VcIcon>
        <div class="tw-mt-1 tw-text-lg">
          {{ leftSwipeActions[0].title }}
        </div>
      </div>
    </div>

    <div class="tw-flex-shrink-0 tw-w-full">
      <!-- Mobile item slot content -->
      <slot></slot>
    </div>

    <!-- Item actions -->
    <div
      v-if="rightSwipeActions && rightSwipeActions.length"
      class="tw-flex-shrink-0 tw-w-[80px] tw-flex tw-flex-col [justify-content:stretch] tw-bg-[#a9bfd2]"
    >
      <!-- First available action -->
      <div
        class="tw-flex tw-grow tw-basis-[1] tw-flex-col tw-justify-center tw-items-center tw-text-white"
        :class="[`vc-table-mobile__item-action_${rightSwipeActions[0].variant}`]"
        @click.stop="rightSwipeActions[0].clickHandler(item as T)"
      >
        <VcIcon :icon="rightSwipeActions[0].icon"></VcIcon>
        <div class="vc-table-mobile__item-action-text">
          {{ rightSwipeActions[0].title }}
        </div>
      </div>

      <!-- Second available action -->
      <div
        v-if="rightSwipeActions.length === 2"
        class="tw-flex tw-grow tw-basis-[1] tw-flex-col tw-justify-center tw-items-center tw-text-white"
        :class="[`vc-table-mobile__item-action_${rightSwipeActions[1].variant}`]"
        @click.stop="rightSwipeActions[1].clickHandler(item as T)"
      >
        <VcIcon :icon="rightSwipeActions[1].icon"></VcIcon>
        <div class="tw-mt-1 tw-text-lg">
          {{ rightSwipeActions[1].title }}
        </div>
      </div>

      <!-- Other available actions -->
      <template v-if="rightSwipeActions.length > 2">
        <div
          class="tw-flex tw-grow tw-basis-[1] tw-flex-col tw-justify-center tw-items-center tw-text-white"
          @click.stop="isActionsPopupVisible = true"
        >
          <VcIcon icon="fas fa-ellipsis-h"></VcIcon>
          <div class="tw-mt-1 tw-text-lg">More</div>
        </div>

        <!-- Actions popup -->
        <teleport
          v-if="isActionsPopupVisible"
          to="body"
        >
          <div
            class="tw-absolute tw-left-0 tw-top-0 tw-right-0 tw-bottom-0 tw-bg-[rgba(107,121,135,0.15)] tw-flex tw-items-center tw-justify-center tw-z-[99]"
          >
            <div
              class="tw-bg-white tw-rounded-[6px] tw-overflow-hidden tw-p-5 tw-max-w-[80%] tw-w-[350px] tw-border tw-border-solid tw-border-[#eef0f2] tw-box-border tw-shadow-[1px_1px_22px_rgba(126,142,157,0.2)]"
            >
              <div class="tw-flex tw-w-full tw-items-center">
                <span class="tw-grow tw-text-[#2e3d4e] tw-text-[19px] tw-font-semibold tw-tracking-[-0.01em]">
                  {{ t("COMPONENTS.ORGANISMS.VC_TABLE.ALL_ACTIONS") }}
                </span>
                <VcIcon
                  class="tw-text-[#c2d7e4]"
                  icon="fas fa-times-circle"
                  size="xl"
                  @click="isActionsPopupVisible = false"
                ></VcIcon>
              </div>

              <div class="tw-flex tw-flex-wrap tw-my-5 tw-justify-between">
                <div
                  v-for="(itemAction, i) in itemActions"
                  :key="i"
                  class="tw-flex tw-grow tw-shrink-0 tw-flex-col tw-items-center tw-text-[#319ed4] tw-my-2 tw-box-border tw-p-1 tw-max-w-[80px]"
                  @click="itemAction.clickHandler(item as T)"
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
</template>

<script lang="ts" setup generic="T extends TableItem | string">
import { Ref, computed, ref, watch } from "vue";
import { IActionBuilderResult } from "./../../../../../../core/types";
import { useI18n } from "vue-i18n";

export interface Emits {
  (event: "swipeStart", id: string): void;
  (event: "click"): void;
}
export interface TableItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
  actions?: IActionBuilderResult[];
}

const props = defineProps<{
  item: T;
  actionBuilder?: (item: T) => IActionBuilderResult[];
  swipingItem?: string;
}>();

const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: "global" });
const offsetX = ref(0);
const startX = ref(0);
const startY = ref(0);
const startOffsetX = ref(0);
const isMoving = ref(false);
const threshold = 10;
const maxWidth = 80;
const isActionsPopupVisible = ref(false);
const itemActions: Ref<IActionBuilderResult<T>[]> = ref([]);

watch(
  () => props.swipingItem,
  (newVal) => {
    if (typeof props.item !== "string" && newVal !== props.item.id) {
      handleOffset();
    }
  }
);

const rightSwipeActions = computed(
  () =>
    itemActions.value &&
    itemActions.value.length &&
    itemActions.value.filter((actions: IActionBuilderResult) => !actions.leftActions)
);
const leftSwipeActions = computed(
  () =>
    itemActions.value &&
    itemActions.value.length &&
    itemActions.value.filter((actions: IActionBuilderResult) => actions.leftActions)
);

function handleOffset() {
  if (itemActions.value.some((action: IActionBuilderResult) => action.leftActions)) {
    offsetX.value = -maxWidth;
    startOffsetX.value = offsetX.value;
  } else {
    offsetX.value = 0;
    startOffsetX.value = 0;
  }
}

async function touchStart(e: TouchEvent) {
  startX.value = e.touches[0].clientX;
  startY.value = e.touches[0].clientY;
  startOffsetX.value = offsetX.value;
  isMoving.value = true;

  if (!itemActions.value.length) {
    if (typeof props.actionBuilder === "function") {
      itemActions.value = props.actionBuilder(props.item);

      handleOffset();
    }
  }
}

function touchMove(e: TouchEvent) {
  if (typeof props.item !== "string") emit("swipeStart", props.item.id);
  if (itemActions.value && itemActions.value.length) {
    const deltaX = e.touches[0].clientX - startX.value;
    const deltaY = e.touches[0].clientY - startY.value;

    if (
      Math.abs(deltaX) > threshold &&
      (rightSwipeActions.value && rightSwipeActions.value.length
        ? leftSwipeActions.value && leftSwipeActions.value.length
          ? Math.abs(startOffsetX.value + deltaX) <= maxWidth * 2
          : Math.abs(startOffsetX.value + deltaX) <= maxWidth
        : Math.abs(startOffsetX.value + deltaX) <= maxWidth) &&
      startOffsetX.value + deltaX < 0
    ) {
      if (Math.abs(deltaY) < threshold * 2) {
        e.preventDefault();
      }
      offsetX.value = startOffsetX.value + deltaX;
    }
  }
}

function touchEnd() {
  const absoluteOffsetX = Math.abs(offsetX.value);
  if (absoluteOffsetX < maxWidth) {
    offsetX.value = absoluteOffsetX < maxWidth / 2 ? 0 : -maxWidth;
  } else {
    offsetX.value = absoluteOffsetX <= maxWidth * 2 - threshold * 2 ? -maxWidth : -maxWidth * 2;
  }

  isMoving.value = false;
}

function touchCancel() {
  const absoluteOffsetX = Math.abs(offsetX.value);
  if (absoluteOffsetX < maxWidth) {
    offsetX.value = absoluteOffsetX < maxWidth / 2 ? 0 : -maxWidth;
  } else {
    offsetX.value = absoluteOffsetX <= maxWidth * 2 - threshold * 2 ? -maxWidth : -maxWidth * 2;
  }

  isMoving.value = false;
}
</script>

<style lang="scss">
.vc-table-mobile__item {
  &-action {
    &_success {
      @apply tw-bg-[#87b563];
    }

    &_danger {
      @apply tw-bg-[#ff4a4a];
    }
  }
}
</style>
