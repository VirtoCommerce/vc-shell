<template>
  <div>
    <template v-if="url">
      <router-link
        :to="url"
        custom
      >
        <vc-app-menu-link
          :is-active="isActive(url)"
          :has-children="!!children.length"
          :sticky="sticky"
          :icon="icon ?? ''"
          :title="title ?? ''"
          @on-click="onMenuItemClick"
        />
      </router-link>
    </template>
    <template v-else>
      <vc-app-menu-link
        :has-children="!!children.length"
        :sticky="sticky"
        :icon="icon ?? ''"
        :title="title ?? ''"
        @on-click="onMenuItemClick"
      />

      <!-- Nested menu items -->
      <div
        v-if="isOpened"
        class="vc-app-menu-item__child"
      >
        <template
          v-for="(nested, i) in children"
          :key="i"
        >
          <router-link
            :to="nested.url"
            custom
          >
            <div
              :key="i"
              :class="[
                {
                  'vc-app-menu-item__child-item_active': isActive(nested.url),
                },
                'vc-app-menu-item__child-item',
              ]"
              @click="$emit('child:click', { item: nested })"
            >
              {{ nested.title }}
            </div>
          </router-link>
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import VcAppMenuLink from "./_internal/vc-app-menu-link.vue";
import { useRoute } from "vue-router";
import { MenuItem } from "../../../../../../../../core/types";

export interface Props {
  sticky?: boolean;
  isVisible?: boolean;
  url?: string;
  icon?: string;
  title?: string;
  children?: MenuItem[];
}

export interface Emits {
  (event: "click"): void;
  (
    event: "child:click",
    {
      item,
    }: {
      item: MenuItem;
    },
  ): void;
}

const props = withDefaults(defineProps<Props>(), {
  sticky: true,
  component: undefined,
  children: () => [],
});

const route = useRoute();
const emit = defineEmits<Emits>();

const isOpened = ref(false);

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
    emit("click");
  } else {
    isOpened.value = !isOpened.value;
  }
}

const isActive = (url: string) => {
  if (url) {
    const splitted = url.split("/").filter((part) => part !== "");
    return route.path.split("/").filter((part) => part !== "")[0] === splitted[0];
  } else return false;
};
</script>

<style lang="scss">
:root {
  --app-menu-item-height: 38px;
  --app-menu-item-icon-width: 20px;
  --app-menu-item-icon-color: #337599;
  --app-menu-item-icon-color-active: #ffffff;
  --app-menu-item-handler-width: 10px;
  --app-menu-item-background-color-hover: #337599;
  --app-menu-item-hover-radius: 4px;
  --app-menu-item-title-color: #465769;
  --app-menu-item-title-color-active: #ffffff;
  --app-menu-item-handler-color: #bdd1df;
}
.vc-app-menu-item {
  &__child {
    @apply tw-ml-[42px] tw-gap-[4px] tw-flex tw-flex-col;
  }

  &__child-item {
    @apply tw-cursor-pointer tw-w-fit tw-py-[5px] tw-px-[9px] tw-rounded-[4px]
    hover:tw-bg-[color:var(--app-menu-item-background-color-hover)]
    hover:tw-text-[color:var(--app-menu-item-title-color-active)];

    &_active {
      @apply tw-bg-[color:var(--app-menu-item-background-color-hover)]
      tw-text-[color:var(--app-menu-item-title-color-active)] tw-font-bold;
    }
  }
}
</style>
