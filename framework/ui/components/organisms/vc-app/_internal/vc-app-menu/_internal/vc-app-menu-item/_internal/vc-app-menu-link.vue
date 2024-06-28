<template>
  <div
    class="vc-app-menu-link tw-cursor-pointer tw-group tw-px-[19px]"
    @click="onMenuItemClick"
  >
    <div
      class="vc-app-menu-item tw-flex"
      :class="[
        {
          'vc-app-menu-item_active': isMenuItemActive,
          'vc-app-menu-item_no-hover': !children?.length,
          'vc-app-menu-item_child-opened': expand && isOpened,
          'vc-app-menu-item_collapsed': !expand,
        },
      ]"
    >
      <div
        v-if="icon"
        class="vc-app-menu-item__icon tw-w-[var(--app-menu-item-icon-width)]"
      >
        <VcIcon
          class="tw-text-center"
          :icon="icon"
          size="m"
        />
      </div>
      <div
        v-if="expand"
        class="vc-app-menu-item__title tw-capitalize"
      >
        {{ title }}
        <VcIcon
          v-if="!!children?.length || false"
          class="vc-app-menu-item__title-icon"
          :icon="`fas fa-chevron-${isOpened ? 'up' : 'down'}`"
          size="xs"
        ></VcIcon>
      </div>
    </div>
  </div>
  <!-- Nested menu items -->
  <div
    v-show="isOpened"
    class="vc-app-menu-item__child"
    :class="{
      '!tw-ml-0': !expand,
    }"
  >
    <template
      v-for="(nested, i) in children"
      :key="i"
    >
      <router-link
        v-if="$hasAccess(nested.permissions!) && nested.url"
        :to="nested.url"
        custom
      >
        <div
          class="vc-app-menu-item__child-item-link tw-cursor-pointer tw-z-[2] tw-px-[19px]"
          :data-test-id="nested.routeId"
          @click="$emit('onClick', nested)"
        >
          <div
            :key="i"
            :class="[
              {
                'vc-app-menu-item__child-item_active': isActive(nested.url ?? ''),
                'vc-app-menu-item__child-item_collapsed': !expand,
                'tw-pl-[21px] tw-w-full  ': expand,
              },
              'vc-app-menu-item__child-item tw-min-w-0 tw-flex  tw-h-[var(--app-menu-item-height)] tw-items-center [transition:padding_150ms_cubic-bezier(0.2,0,0,1)_0s] ',
            ]"
          >
            <div
              v-if="nested.icon"
              class="vc-app-menu-item__icon tw-w-[var(--app-menu-item-icon-width)]"
              :class="{
                'tw-p-0': !expand,
              }"
            >
              <VcIcon
                class="tw-text-center"
                :icon="nested.icon"
                size="m"
              />
            </div>
            <p
              v-if="expand"
              class="tw-truncate tw-pl-[7px]"
            >
              {{ nested.title }}
            </p>
          </div>
        </div>
      </router-link>
    </template>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { MenuItem } from "../../../../../../../../../core/types";
import { VcIcon } from "./../../../../../../../";
import { useRoute } from "vue-router";

export interface Props {
  children?: MenuItem[];
  sticky?: boolean;
  icon: string;
  title?: string;
  url?: string;
  expand?: boolean;
  isExpanding?: boolean;
}

export interface Emits {
  (event: "onClick", item?: MenuItem): void;
}

const props = withDefaults(defineProps<Props>(), {
  sticky: true,
});

const emit = defineEmits<Emits>();

const isOpened = ref(false);
const route = useRoute();
const params = Object.fromEntries(Object.entries(route.params).filter(([key]) => key !== "pathMatch"));

const isMenuItemActive = computed(() => isActive(props.url ?? "") && !props.children?.length);

watch(
  () => route.path,
  () => {
    if (props.children && props.children.length && props.children.find((x) => x?.url === route?.path)) {
      isOpened.value = true;
    }
  },
  { immediate: true },
);

function onMenuItemClick() {
  if (!props.children?.length) {
    emit("onClick");
  } else {
    isOpened.value = !isOpened.value;
  }
}

const isActive = (url: string) => {
  if (url) {
    let path = route.path;
    if (Object.values(params).length) {
      path = path.replace(Object.values(params)[0] as string, "");
    }

    const active = path.endsWith(url);

    if (active && props.children?.length) {
      isOpened.value = true;
    }

    return active;
  } else {
    return false;
  }
};
</script>

<style lang="scss">
:root {
  --app-menu-item-height: 36px;
  --app-menu-item-icon-width: 22px;
  --app-menu-item-icon-color: #82a6bd;
  --app-menu-item-icon-color-active: #ffffff;
  --app-menu-item-handler-width: 10px;
  --app-menu-item-background-color-hover: rgba(130, 166, 189, 0.5);
  --app-menu-item-background-color-active: #82a6bd;
  --app-menu-item-hover-radius: 4px;
  --app-menu-item-title-color: #465769;
  --app-menu-item-title-color-active: #ffffff;
  --app-menu-item-handler-color: #bdd1df;

  --app-menu-item-active-text: #2e3d4e;
  --app-menu-item-active-icon: #2e3d4e;
}

.vc-app-menu-link:hover .vc-app-menu-item:not(.vc-app-menu-item_active) {
  @apply tw-bg-[color:var(--app-menu-item-background-color-hover)] tw-bg-opacity-50
    tw-rounded-[var(--app-menu-item-hover-radius)];

  .vc-app-menu-item__title {
    @apply tw-text-[color:var(--app-menu-item-title-color-active)];
  }

  .vc-app-menu-item__icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
  }

  .vc-app-menu-item__title-icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
  }

  .vc-app-menu-item__handler_enabled {
    @apply tw-visible #{!important};
  }
}

.vc-app-menu-item__child-item-link:hover .vc-app-menu-item__child-item:not(.vc-app-menu-item__child-item_active) {
  @apply tw-bg-[color:var(--app-menu-item-background-color-hover)] tw-bg-opacity-50
    tw-rounded-[var(--app-menu-item-hover-radius)];

  .vc-app-menu-item__icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
  }
}

.vc-app-menu-item {
  @apply tw-flex tw-items-center tw-w-full tw-h-[var(--app-menu-item-height)]
  tw-border-none
  tw-flex-nowrap tw-box-border tw-cursor-pointer tw-relative tw-uppercase tw-select-none tw-py-[4px] tw-px-[8px];

  &_collapsed {
    @apply tw-w-[40px];
  }

  &_active {
    @apply tw-bg-[color:var(--app-menu-item-background-color-active)]
    tw-rounded-[var(--app-menu-item-hover-radius)]
    before:tw-opacity-100;
  }

  &_child-opened {
    .vc-app-menu-item__title {
      @apply tw-font-bold tw-text-[color:var(--app-menu-item-active-text)] #{!important};
    }

    .vc-app-menu-item__icon {
      @apply tw-text-[color:var(--app-menu-item-active-icon)]  #{!important};
    }
  }

  &__handler {
    @apply tw-w-[var(--app-menu-item-handler-width)]
    tw-text-[color:var(--app-menu-item-handler-color)]
    tw-text-center tw-invisible tw-shrink-0;

    &_enabled {
      @apply tw-cursor-move #{!important};
    }
  }

  &__icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color)]
    tw-overflow-hidden tw-flex
    tw-justify-center tw-shrink-0 tw-transition-[color] tw-duration-200;
  }

  &_active &__icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
  }

  &__title {
    @apply tw-truncate
    tw-text-lg
    tw-font-medium
    tw-pl-[7px]
    tw-text-[color:var(--app-menu-item-title-color)]
    [transition:color_0.2s_ease]
    tw-opacity-100 tw-w-full tw-flex tw-justify-between tw-items-center;
  }

  &__title-icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color)] tw-ml-3;
  }

  &_active &__title {
    @apply tw-text-[color:var(--app-menu-item-title-color-active)]
    tw-font-bold;
  }

  &_active &__title-icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
  }

  &__child {
    @apply tw-gap-[4px] tw-mt-[4px] tw-flex tw-flex-col;
  }

  &__child-item {
    @apply tw-cursor-pointer tw-w-fit tw-py-[4px] tw-px-[8px] tw-rounded-[4px]
    hover:tw-bg-[color:var(--app-menu-item-background-color-hover)]
    hover:tw-text-[color:var(--app-menu-item-title-color-active)];

    &_active {
      @apply tw-bg-[color:var(--app-menu-item-background-color-active)]
      tw-text-[color:var(--app-menu-item-title-color-active)] tw-font-bold
      hover:tw-bg-[color:var(--app-menu-item-background-color-active)]
      hover:tw-text-[color:var(--app-menu-item-title-color-active)];

      .vc-app-menu-item__icon {
        @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
      }
    }

    &_collapsed {
      @apply tw-w-[40px];
    }
  }

  &:hover:not(.vc-app-menu-item_active) {
    @apply tw-bg-[color:var(--app-menu-item-background-color-hover)] tw-bg-opacity-50
    tw-rounded-[var(--app-menu-item-hover-radius)];
  }

  &:hover &__title {
    @apply tw-text-[color:var(--app-menu-item-title-color-active)];
  }

  &:hover &__icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
  }

  &:hover &__title-icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
  }

  &:hover &__handler {
    &_enabled {
      @apply tw-visible #{!important};
    }
  }
}
</style>
