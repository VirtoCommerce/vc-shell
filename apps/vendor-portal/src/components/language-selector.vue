<template>
  <div
    class="language-selector"
    v-click-outside="
      () => {
        isDropActive = false;
      }
    "
    :title="title"
    @click="isDropActive = !isDropActive"
  >
    <div
      :class="[
        { 'language-selector__button_active': isDropActive },
        'language-selector__button',
      ]"
    >
      <vc-icon icon="fas fa-globe" size="xl"></vc-icon>
    </div>
    <div class="language-selector__dropdown" v-if="isDropActive">
      <div
        class="language-selector__dropdown-item"
        v-for="(lang, i) in languageItems"
        :key="i"
        @click="
          lang.hasOwnProperty('clickHandler') && lang.clickHandler(lang.lang)
        "
      >
        {{ lang.title }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "LanguageSelector",
  props: {
    title: {
      type: String,
      default: "",
    },
    value: {
      type: String,
      default: "",
    },
    languageItems: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    const isDropActive = ref(false);

    return {
      isDropActive,
    };
  },
});
</script>

<style lang="less" scoped>
.language-selector {
  position: relative;

  &__button {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--app-bar-button-width);
    border-left: 1px solid var(--app-bar-button-border-color);
    cursor: pointer;
    color: var(--app-bar-button-color);
    background-color: var(--app-bar-button-background-color);
    transition: color 0.2s ease;

    &:hover {
      color: var(--app-bar-button-color-hover);
      background-color: var(--app-bar-button-background-color-hover);
    }

    &_active {
      box-shadow: 0 -6px 6px white, 1px 1px 22px rgba(126, 142, 157, 0.2);
      clip-path: inset(0px -20px 0px -20px);
      background: #ffffff;
      z-index: 10000;
    }
  }

  &__dropdown {
    position: absolute;
    right: 0;
    top: var(--app-bar-height);
    background: white;
    z-index: 9999;
    box-shadow: 0 -6px 6px white, 1px 1px 22px rgba(126, 142, 157, 0.2);
    width: min-content;
  }

  &__dropdown-item {
    padding: var(--padding-m);
    font-size: var(--font-size-l);
    color: #000000;
    border-left: 1px solid #eef0f2;
    border-bottom: 1px solid #eef0f2;
    background-color: white;
    cursor: pointer;

    &:hover {
      background-color: #eff7fc;
    }
  }
}
</style>
