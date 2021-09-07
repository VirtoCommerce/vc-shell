<template>
  <div
    class="vc-loader vc-fill_all"
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
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcLoader",

  props: {
    active: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="less">
.vc-loader {
  position: absolute;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  display: none;
  z-index: 99999;

  &_active {
    display: flex;
    backdrop-filter: blur(3px);
    background-color: rgba(255, 255, 255, 0.5);
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
    background: #319ed4;
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
      background: #319ed4;
      border-radius: 50%;
    }
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
