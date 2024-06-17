<template>
  <div
    class="vc-app-menu-item"
    :class="[
      {
        'vc-app-menu-item_active': isMenuItemActive,
        'vc-app-menu-item_no-hover': !children?.length,
        'vc-app-menu-item_child-opened': expand && isOpened,
      },
    ]"
    @click="onMenuItemClick"
  >
    <div
      class="vc-app-menu-item__handler"
      :class="{ 'vc-app-menu-item__handler_enabled': !sticky }"
    >
      <VcIcon
        icon="fas fa-ellipsis-v"
        size="m"
      />
    </div>
    <div
      v-if="icon"
      class="vc-app-menu-item__icon"
    >
      <VcIcon
        class="tw-w-[var(--app-menu-item-icon-width)] tw-text-center"
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
          :key="i"
          :class="[
            {
              'vc-app-menu-item__child-item_active': isActive(nested.url ?? ''),
              'tw-px-[10px] tw-flex tw-justify-center tw-items-center': !expand,
            },
            'vc-app-menu-item__child-item tw-min-w-0 tw-flex tw-w-full tw-h-[var(--app-menu-item-height)] tw-items-center',
          ]"
          @click="$emit('onClick', nested)"
        >
          <div
            v-if="nested.icon"
            class="vc-app-menu-item__icon"
            :class="{
              'tw-p-0': !expand,
            }"
          >
            <VcIcon
              class="tw-w-[var(--app-menu-item-icon-width)] tw-text-center"
              :icon="nested.icon"
              size="m"
            />
          </div>
          <p
            v-if="expand"
            class="tw-truncate"
          >
            {{ nested.title }}
          </p>
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

.vc-app-menu-item {
  @apply tw-flex tw-items-center tw-w-full tw-h-[var(--app-menu-item-height)]
  tw-border-none
  tw-flex-nowrap tw-box-border tw-cursor-pointer tw-relative tw-uppercase tw-select-none;

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
    tw-justify-center tw-shrink-0 tw-transition-[color] tw-duration-200 tw-pr-[7px];
  }

  &_active &__icon {
    @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
  }

  &__title {
    @apply tw-truncate
    tw-text-lg
    tw-font-medium
    tw-pr-2
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
    @apply tw-cursor-pointer tw-w-fit tw-py-[4px] tw-px-[6px] tw-rounded-[4px]
    hover:tw-bg-[color:var(--app-menu-item-background-color-hover)]
    hover:tw-text-[color:var(--app-menu-item-title-color-active)] tw-pl-[25px];

    &_active {
      @apply tw-bg-[color:var(--app-menu-item-background-color-active)]
      tw-text-[color:var(--app-menu-item-title-color-active)] tw-font-bold
      hover:tw-bg-[color:var(--app-menu-item-background-color-active)]
      hover:tw-text-[color:var(--app-menu-item-title-color-active)];

      .vc-app-menu-item__icon {
        @apply tw-text-[color:var(--app-menu-item-icon-color-active)];
      }
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
