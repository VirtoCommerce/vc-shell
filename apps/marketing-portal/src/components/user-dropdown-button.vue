<template>
  <div
    v-if="$isDesktop.value"
    class="user-dropdown-button"
    :class="{
      'user-dropdown-button_active': accountMenuVisible,
    }"
    @click="toggleAccountMenuVisible"
    v-click-outside="
      () => {
        accountMenuVisible = false;
      }
    "
  >
    <div
      class="rounded-full overflow-hidden w-[34px] h-[34px] bg-[color:var(--app-bar-account-info-role-color)] bg-cover bg-center"
      :style="{ 'background-image': `url(${avatar})` }"
    ></div>
    <div class="grow basis-0 ml-3">
      <div
        class="text-base text-[color:var(--app-bar-account-info-name-color)]"
      >
        {{ name }}
      </div>
      <div
        class="text-base text-[color:var(--app-bar-account-info-role-color)]"
      >
        {{ role }}
      </div>
    </div>
    <div v-if="menuItems" class="user-dropdown-button__chevron">
      <VcIcon icon="fas fa-chevron-down" size="xl"></VcIcon>
    </div>
    <div
      v-if="menuItems && accountMenuVisible"
      class="absolute -left-1 right-0 top-[var(--app-bar-height)] bg-white z-[9999] shadow-[0_-6px_6px_white,1px_1px_22px_rgba(126,142,157,0.2)]"
      @click.stop="accountMenuVisible = false"
    >
      <div
        v-for="item in menuItems"
        :key="item.id"
        class="p-3 text-lg text-black border-l border-solid border-l-[#eef0f2] border-b border-b-[#eef0f2] bg-white hover:bg-[#eff7fc]"
        @click="
          item.hasOwnProperty('clickHandler') ? item.clickHandler() : null
        "
      >
        {{ item.title }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

defineProps({
  avatar: {
    type: String,
    default: undefined,
  },

  name: {
    type: String,
    default: undefined,
  },

  role: {
    type: String,
    default: undefined,
  },

  menuItems: {
    type: Array,
    default: () => [],
  },
});

const accountMenuVisible = ref(false);
const toggleAccountMenuVisible = () => {
  accountMenuVisible.value = !accountMenuVisible.value;
};
</script>

<style lang="scss">
.user-dropdown-button {
  @apply w-[240px] border-l border-solid border-l-[color:var(--app-bar-divider-color)]
  pl-4 pr-3 mr-4 cursor-pointer relative flex justify-between items-center h-full;

  &:hover,
  &_active {
    @apply bg-[color:var(--app-bar-toolbar-icon-background-hover)];
  }

  &__chevron {
    @apply text-[#7e8e9d] [transition:transform_0.2s_ease] [transition:color_0.2s_ease];
  }

  &:hover &__chevron {
    @apply text-[#34414f];
  }

  &_active &__chevron {
    @apply -scale-y-100;
  }
}
</style>
