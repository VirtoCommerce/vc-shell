<template>
  <div
    class="
      vc-loader vc-flex-column
      vc-flex-align_center
      vc-flex-justify_center
      vc-fill_all
    "
    :class="{
      'vc-loader_active': active,
    }"
  >
    <div class="vc-loader__animation">
      <span class="vc-loader__marker"></span>
      <div class="vc-loader__markers">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    <div class="vc-margin-top_m vc-loader__label">Loading...</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcLoader",
  data() {
    return {
      active: false,
    };
  },
});
</script>

<style lang="less">
.vc-loader {
  position: fixed;
  top: 0;
  left: 0;
  display: none;
  z-index: 999999;

  &_active {
    display: flex;
    backdrop-filter: blur(3px);

    &:before {
      content: "";
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--background-color);
      opacity: 0.5;
      position: absolute;
    }
  }

  &__animation {
    position: relative;
    width: 142px;
    height: 40px;
    z-index: 1;
  }

  &__marker {
    position: absolute;
    width: 16px;
    height: 16px;
    top: 12px;
    left: 15px;
    filter: blur(1px);
    background: var(--basic-black-color);
    border-radius: 50%;
    transform: translateX(0);
    animation: "vc-loader__marker" 3s infinite;
  }

  &__markers {
    transform: translateX(0);
    margin-top: 12px;
    margin-left: 31px;
    animation: "vc-loader__markers" 3s infinite;

    span {
      display: block;
      float: left;
      width: 16px;
      height: 16px;
      margin-left: 16px;
      filter: blur(1px);
      background: var(--basic-black-color);
      border-radius: 50%;
    }
  }

  &__label {
    font-size: var(--font-size-xl);
    z-index: 1;
  }
}

@keyframes vc-loader__marker {
  50% {
    transform: translateX(96px);
  }
}
@keyframes vc-loader__markers {
  50% {
    transform: translateX(-31px);
  }
}
</style>
