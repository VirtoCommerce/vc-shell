<template>
  <div
    class="
      vc-fill_all
      vc-flex vc-flex-column
      vc-flex-align_center
      vc-flex-justify_center
    "
    :style="{
      background: `url(${options.branding.background}) center / cover no-repeat`,
    }"
  >
    <div
      class="vc-layout-login__logo"
      :style="{
        background: `url(${options.branding.logo}) center / contain no-repeat`,
      }"
    ></div>
    <div class="vc-layout-login__wrapper">
      <div class="vc-layout-login__header vc-flex vc-flex-align_center">
        {{ options.branding.title || "Login" }}
      </div>
      <div class="vc-layout-login__body">
        <slot><vc-form></vc-form></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcForm from "../../organisms/vc-form/vc-form.vue";

export default defineComponent({
  name: "VcLayoutLogin",

  components: { VcForm },

  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
  },

  setup() {
    console.debug("Init vc-layout-login");
  },
});
</script>

<style lang="less">
.vc-layout-login {
  &__logo {
    height: 60px;
    width: 516px;
    margin-bottom: 50px;
  }

  &__wrapper {
    width: 516px;
    background: white;
    border-radius: 6px 2px;
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
    padding: 14px 28px 28px 28px;
  }
}
</style>
