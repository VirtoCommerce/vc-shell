<template>
  <div>
    <template v-if="component && component.url">
      <router-link
        :to="component.url"
        custom
        v-slot="{ isExactActive }"
      >
        <vc-app-menu-link
          :isActive="isExactActive"
          :children="children"
          :sticky="sticky"
          :icon="icon as string"
          :title="title"
          @onClick="onMenuItemClick"
        />
      </router-link>
    </template>
    <template v-else>
      <vc-app-menu-link
        :children="children"
        :sticky="sticky"
        :icon="icon as string"
        :title="title"
        @onClick="onMenuItemClick"
      />

      <!-- Nested menu items -->
      <div
        class="vc-app-menu-item__child"
        v-if="isOpened"
      >
        <template
          v-for="(nested, i) in children"
          :key="i"
        >
          <router-link
            :to="nested.component.url"
            custom
            v-slot="{ isActive }"
          >
            <div
              :class="[
                {
                  'vc-app-menu-item__child-item_active': isActive,
                },
                'vc-app-menu-item__child-item',
              ]"
              v-if="nested.isVisible === undefined || nested.isVisible"
              :key="i"
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
import { onMounted, ref } from "vue";
import { BladeMenu } from "./../../../../../../../../core/types";
import VcAppMenuLink from "./_internal/vc-app-menu-link.vue";
import { useRoute } from "vue-router";
import { BladeConstructor } from "./../../../../../../../../shared";

export interface Props {
  sticky?: boolean;
  isVisible?: boolean;
  component?: BladeConstructor;
  icon?: string | (() => string);
  title?: string;
  children?: BladeMenu[];
}

export interface Emits {
  (event: "click"): void;
  (
    event: "child:click",
    {
      item,
    }: {
      item: BladeMenu;
    }
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

onMounted(() => {
  if (props.children && props.children.length && props.children.find((x) => x.component?.url === route?.path)) {
    isOpened.value = true;
  }
});

function onMenuItemClick() {
  if (!props.children?.length) {
    emit("click");
  } else {
    isOpened.value = !isOpened.value;
  }
}
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
