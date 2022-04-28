<template>
  <div
    class="w-full h-full box-border flex flex-col items-center justify-center"
    :style="{
      background: `url(${background}) center / cover no-repeat`,
    }"
  >
    <div
      class="h-[80px] w-[516px] max-w-[90%] mb-[50px] -mt-[90px]"
      :style="{
        background: `url(${logo}) center / contain no-repeat`,
      }"
    ></div>
    <div
      class="w-[516px] max-w-[90%] bg-white rounded-md overflow-hidden shadow-[0_0_0_rgba(0,0,0,0.05)]"
    >
      <div
        class="uppercase text-white bg-[#465769] h-[50px] px-[28px] text-xl flex items-center"
      >
        {{ title }}
      </div>
      <div class="pt-4 px-[28px] pb-[24px]">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
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
    default: "Login",
  },
});

console.debug("Init vc-login-form");
</script>
