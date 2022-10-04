<template>
  <div
    class="relative flex flex-nowrap items-stretch transition duration-200"
    :class="{ 'transition-none': isMoving }"
    :style="`transform: translateX(${offsetX}px)`"
    @click="$emit('click')"
    @touchstart="touchStart"
    @touchmove="touchMove"
    @touchend="touchEnd"
    @touchcancel="touchCancel"
  >
    <!-- Left swipe actions-->
    <div
      class="flex-shrink-0 w-[80px] flex flex-col [justify-content:stretch] bg-[#a9bfd2]"
      v-if="leftSwipeActions && leftSwipeActions.length"
    >
      <div
        class="flex grow basis-[1] flex-col justify-center items-center text-white"
        :class="[`vc-table-mobile__item-action_${leftSwipeActions[0].variant}`]"
        @click.stop="leftSwipeActions[0].clickHandler(item)"
      >
        <VcIcon :icon="leftSwipeActions[0].icon"></VcIcon>
        <div class="mt-1 text-lg">
          {{ leftSwipeActions[0].title }}
        </div>
      </div>
    </div>

    <div class="flex-shrink-0 w-full">
      <!-- Mobile item slot content -->
      <slot></slot>
    </div>

    <!-- Item actions -->
    <div
      class="flex-shrink-0 w-[80px] flex flex-col [justify-content:stretch] bg-[#a9bfd2]"
      v-if="rightSwipeActions && rightSwipeActions.length"
    >
      <!-- First available action -->
      <div
        class="flex grow basis-[1] flex-col justify-center items-center text-white"
        :class="[
          `vc-table-mobile__item-action_${rightSwipeActions[0].variant}`,
        ]"
        @click.stop="rightSwipeActions[0].clickHandler(item)"
      >
        <VcIcon :icon="rightSwipeActions[0].icon"></VcIcon>
        <div class="vc-table-mobile__item-action-text">
          {{ rightSwipeActions[0].title }}
        </div>
      </div>

      <!-- Second available action -->
      <div
        v-if="rightSwipeActions.length === 2"
        class="flex grow basis-[1] flex-col justify-center items-center text-white"
        :class="[
          `vc-table-mobile__item-action_${rightSwipeActions[1].variant}`,
        ]"
        @click.stop="rightSwipeActions[1].clickHandler(item)"
      >
        <VcIcon :icon="rightSwipeActions[1].icon"></VcIcon>
        <div class="mt-1 text-lg">
          {{ rightSwipeActions[1].title }}
        </div>
      </div>

      <!-- Other available actions -->
      <template v-if="rightSwipeActions.length > 2">
        <div
          class="flex grow basis-[1] flex-col justify-center items-center text-white"
          @click.stop="isActionsPopupVisible = true"
        >
          <VcIcon icon="fas fa-ellipsis-h"></VcIcon>
          <div class="mt-1 text-lg">More</div>
        </div>

        <!-- Actions popup -->
        <teleport to="body" v-if="isActionsPopupVisible">
          <div
            class="absolute left-0 top-0 right-0 bottom-0 bg-[rgba(107,121,135,0.15)] flex items-center justify-center z-[99]"
          >
            <div
              class="bg-white rounded-[6px] overflow-hidden p-5 max-w-[80%] w-[350px] border border-solid border-[#eef0f2] box-border shadow-[1px_1px_22px_rgba(126,142,157,0.2)]"
            >
              <div class="flex w-full items-center">
                <span
                  class="grow text-[#2e3d4e] text-[19px] font-semibold tracking-[-0.01em]"
                >
                  {{ $t("All actions") }}
                </span>
                <VcIcon
                  class="text-[#c2d7e4]"
                  icon="fas fa-times-circle"
                  size="xl"
                  @click="isActionsPopupVisible = false"
                ></VcIcon>
              </div>

              <div class="flex flex-wrap my-5 justify-between">
                <div
                  v-for="(itemAction, i) in itemActions"
                  :key="i"
                  class="flex grow shrink-0 flex-col items-center text-[#319ed4] my-2 box-border p-1 max-w-[80px]"
                  @click="itemAction.clickHandler(item)"
                >
                  <VcIcon :icon="itemAction.icon" size="xl"></VcIcon>
                  <div class="text-base mt-2 text-center">
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

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { IActionBuilderResult } from "../../../../../typings";

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },

  actionBuilder: {
    type: Function,
    default: undefined,
  },

  swipingItem: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["swipeStart"]);
const offsetX = ref(0);
const startX = ref(0);
const startY = ref(0);
const startOffsetX = ref(0);
const isMoving = ref(false);
const threshold = 10;
const maxWidth = 80;
const isActionsPopupVisible = ref(false);
const itemActions = ref([]);

watch(
  () => props.swipingItem,
  (newVal) => {
    if (newVal !== props.item.id) {
      handleOffset();
    }
  }
);

const rightSwipeActions = computed(
  () =>
    itemActions.value &&
    itemActions.value.length &&
    itemActions.value.filter(
      (actions: IActionBuilderResult) => !actions.leftActions
    )
);
const leftSwipeActions = computed(
  () =>
    itemActions.value &&
    itemActions.value.length &&
    itemActions.value.filter(
      (actions: IActionBuilderResult) => actions.leftActions
    )
);

function handleOffset() {
  if (
    itemActions.value.some((action: IActionBuilderResult) => action.leftActions)
  ) {
    offsetX.value = -maxWidth;
    startOffsetX.value = offsetX.value;
  } else {
    offsetX.value = 0;
    startOffsetX.value = 0;
  }
}

async function touchStart(e: TouchEvent): Promise<void> {
  startX.value = e.touches[0].clientX;
  startY.value = e.touches[0].clientY;
  startOffsetX.value = offsetX.value;
  isMoving.value = true;

  if (!itemActions.value.length) {
    if (typeof props.actionBuilder === "function") {
      itemActions.value = await props.actionBuilder(props.item);

      handleOffset();
    }
  }
}

function touchMove(e: TouchEvent): void {
  emit("swipeStart", props.item.id);
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

function touchEnd(): void {
  const absoluteOffsetX = Math.abs(offsetX.value);
  if (absoluteOffsetX < maxWidth) {
    offsetX.value = absoluteOffsetX < maxWidth / 2 ? 0 : -maxWidth;
  } else {
    offsetX.value =
      absoluteOffsetX <= maxWidth * 2 - threshold * 2
        ? -maxWidth
        : -maxWidth * 2;
  }

  isMoving.value = false;
}

function touchCancel(): void {
  const absoluteOffsetX = Math.abs(offsetX.value);
  if (absoluteOffsetX < maxWidth) {
    offsetX.value = absoluteOffsetX < maxWidth / 2 ? 0 : -maxWidth;
  } else {
    offsetX.value =
      absoluteOffsetX <= maxWidth * 2 - threshold * 2
        ? -maxWidth
        : -maxWidth * 2;
  }

  isMoving.value = false;
}
</script>

<style lang="scss">
.vc-table-mobile__item {
  &-action {
    &_success {
      @apply bg-[#87b563];
    }

    &_danger {
      @apply bg-[#ff4a4a];
    }
  }
}
</style>
