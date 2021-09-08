<template>
  <div
    class="
      vc-fill_all
      vc-flex vc-flex-column
      vc-flex-align_center
      vc-flex-justify_center
    "
    :style="{
      background: `url(${background}) center / cover no-repeat`,
    }"
  >
    <div
      class="vc-login-form__logo"
      :style="{
        background: `url(${logo}) center / contain no-repeat`,
      }"
    ></div>
    <div class="vc-login-form__wrapper">
      <div class="vc-login-form__header vc-flex vc-flex-align_center">
        {{ title || "Login" }}
      </div>
      <div class="vc-login-form__body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcLoginForm",

  props: {
    logo: {
      type: String,
      default: undefined,
    },

    background: {
      type: String,
      default: undefined,
    },

    title: {
      type: String,
      default: undefined,
    },
  },

  setup() {
    console.debug("Init vc-login-form");
  },
});
</script>

<style lang="less">
.vc-login-form {
  &__logo {
    height: 60px;
    width: 516px;
    margin-bottom: 50px;
    margin-top: -90px;
  }

  &__wrapper {
    width: 516px;
    background: white;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0.05);
  }

  &__header {
    text-transform: uppercase;
    color: white;
    background: #465769;
    height: 50px;
    padding: 0 28px;
    font-size: var(--font-size-xl);
  }

  &__body {
    padding: 16px 28px 24px 28px;
  }
}
</style>
