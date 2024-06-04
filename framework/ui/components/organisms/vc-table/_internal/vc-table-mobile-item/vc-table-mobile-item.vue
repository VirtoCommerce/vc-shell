<template>
  <div
    ref="container"
    v-on-click-outside="reset"
    v-touch:hold="handleHold"
    class="tw-select-none tw-relative tw-overflow-hidden tw-flex"
    @click="handleClick"
    @contextmenu.prevent
  >
    <div
      ref="target"
      class="tw-top-0 tw-left-0 tw-bottom-0 tw-right-0 tw-w-full tw-h-full tw-absolute tw-flex-shrink-0 tw-bg-white"
      :class="{ animated: !isSwiping, 'vc-table-mobile__item_selected': isSelected }"
      :style="{ left }"
    >
      <!-- Mobile item slot content -->
      <slot></slot>
    </div>
    <div class="tw-flex tw-justify-between tw-flex-auto">
      <!-- Left swipe actions -->
      <div
        v-if="leftSwipeActions && leftSwipeActions.length && direction === 'right'"
        class="tw-flex-shrink-0 tw-flex tw-flex-col [justify-content:stretch] tw-bg-[#a9bfd2]"
        :style="{
          width: actionsWidth,
        }"
      >
        <div
          class="tw-flex tw-grow tw-basis-[1] tw-flex-col tw-justify-center tw-items-center tw-text-white"
          :class="[`vc-table-mobile__item-action_${leftSwipeActions[0].type}`]"
          @click.stop="leftSwipeActions?.[0].clickHandler(item as T)"
        >
          <VcIcon :icon="leftSwipeActions[0].icon" />
          <div class="tw-mt-1 tw-text-lg tw-text-center">
            {{ leftSwipeActions[0].title }}
          </div>
        </div>
      </div>
      <!-- Item actions -->
      <div
        v-if="rightSwipeActions && rightSwipeActions.length && direction === 'left'"
        class="tw-flex-shrink-0 tw-flex tw-flex-col [justify-content:stretch] tw-bg-[#a9bfd2] tw-ml-auto"
        :style="{
          width: actionsWidth,
        }"
      >
        <div
          v-for="(action, index) in rightSwipeActions.slice(0, rightSwipeActions.length > 2 ? 1 : 2)"
          :key="`rightSwipeAction-${index}`"
          class="tw-flex tw-grow tw-basis-[1] tw-flex-col tw-justify-center tw-items-center tw-text-white"
          :class="[`vc-table-mobile__item-action_${action.type}`]"
          @click.stop="action.clickHandler(item as T)"
        >
          <VcIcon :icon="action.icon" />
          <div class="tw-mt-1 tw-text-lg tw-text-center">
            {{ action.title }}
          </div>
        </div>

        <!-- Other available actions -->
        <template v-if="rightSwipeActions.length > 2">
          <div
            class="tw-flex tw-grow tw-basis-[1] tw-flex-col tw-justify-center tw-items-center tw-text-white"
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
  </div>
</template>

<script lang="ts" setup generic="T extends TableItem | string">
import { Ref, computed, ref, onMounted, watch, onUpdated } from "vue";
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
  item: T;
  actionBuilder?: (item: T) => IActionBuilderResult[] | undefined;
  swipingItem?: string;
  isSelected?: boolean;
}>();

const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: "global" });

const isActionsPopupVisible = ref(false);
const itemActions: Ref<IActionBuilderResult<T>[] | undefined> = ref([]);
const target = ref<HTMLElement | null>(null);
const container = ref<HTMLElement | null>(null);
const containerWidth = computed(() => container.value?.offsetWidth);
const left = ref("0");

const actionsWidth = ref("0");

const { isSwiping, lengthX } = useSwipe(target, {
  threshold: 0,
  onSwipeStart() {
    getActions();
    if (typeof props.item !== "string") {
      emit("swipeStart", props.item.id);
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
    (itemActions.value &&
      itemActions.value.length &&
      itemActions.value.filter((actions: IActionBuilderResult) => actions.position === "right")) ||
    undefined,
);
const leftSwipeActions = computed(
  () =>
    (itemActions.value &&
      itemActions.value.length &&
      itemActions.value.filter((actions: IActionBuilderResult) => actions.position === "left")) ||
    undefined,
);

watch(
  () => props.swipingItem,
  (newVal) => {
    if (typeof props.item !== "string" && newVal !== props.item.id) {
      left.value = "0";
      actionsWidth.value = "0";
    }
  },
);

onMounted(() => {
  adjustHeight();
});

onUpdated(() => {
  adjustHeight();
});

function reset() {
  left.value = "0";
  actionsWidth.value = "0";
}

function adjustHeight() {
  if (container.value && target.value) {
    container.value.style.height = target.value.scrollHeight + "px";
  }
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
      itemActions.value = props.actionBuilder(props.item);
    }
  }
}

function handleHold() {
  emit("select");
}

function handleClick() {
  emit("click");
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

  &_selected {
    @apply tw-bg-[#dfeef9] #{!important};
  }
}
</style>
