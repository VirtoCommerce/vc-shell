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
      class="user-dropdown-button__avatar"
      :style="{ 'background-image': `url(${avatar})` }"
    ></div>
    <div class="vc-flex-grow_1 vc-margin-left_m">
      <div class="user-dropdown-button__name">
        {{ name }}
      </div>
      <div class="user-dropdown-button__role">
        {{ role }}
      </div>
    </div>
    <div v-if="menuItems" class="user-dropdown-button__chevron">
      <vc-icon icon="fas fa-chevron-down" size="xl"></vc-icon>
    </div>
    <div
      v-if="menuItems && accountMenuVisible"
      class="user-dropdown-button__menu"
      @click.stop="accountMenuVisible = false"
    >
      <div
        v-for="item in menuItems"
        :key="item.id"
        class="user-dropdown-button__menu-item"
        @click="
          item.hasOwnProperty('clickHandler') ? item.clickHandler() : null
        "
      >
        {{ item.title }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  props: {
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
  },

  setup() {
    const accountMenuVisible = ref(false);
    const toggleAccountMenuVisible = () => {
      accountMenuVisible.value = !accountMenuVisible.value;
    };

    return {
      accountMenuVisible,
      toggleAccountMenuVisible,
    };
  },
});
</script>

<style lang="less">
.user-dropdown-button {
  width: 204px;
  border-left: 1px solid var(--app-bar-divider-color);
  padding-left: var(--padding-l);
  padding-right: var(--padding-m);
  margin-right: var(--margin-l);
  cursor: pointer;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;

  &:hover,
  &_active {
    background: var(--app-bar-toolbar-icon-background-hover);
  }

  &__avatar {
    border-radius: 50%;
    overflow: hidden;
    width: 34px;
    height: 34px;
    background-color: var(--app-bar-account-info-role-color);
    background-size: cover;
    background-position: center;
  }

  &__name {
    font-size: var(--font-size-m);
    color: var(--app-bar-account-info-name-color);
  }

  &__role {
    font-size: var(--font-size-m);
    color: var(--app-bar-account-info-role-color);
  }

  &__chevron {
    color: #7e8e9d;
    transition: transform 0.2s ease, color 0.2s ease;
  }

  &:hover &__chevron {
    color: #34414f;
  }

  &_active &__chevron {
    transform: scaleY(-1);
  }

  &__menu {
    position: absolute;
    left: -1px;
    right: 0;
    top: var(--app-bar-height);
    background: white;
    z-index: 9999;
    box-shadow: 0 -6px 6px white, 1px 1px 22px rgba(126, 142, 157, 0.2);

    &-item {
      padding: var(--padding-m);
      font-size: var(--font-size-l);
      color: #000000;
      border-left: 1px solid #eef0f2;
      border-bottom: 1px solid #eef0f2;
      background-color: white;

      &:hover {
        background-color: #eff7fc;
      }
    }
  }
}
</style>
