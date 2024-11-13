<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 18 18"
    fill="none"
    :width="width"
    :height="height"
  >
    <path
      d="M9 12L12 9M12 9L9 6M12 9H1M1 4.24802V4.2002C1 3.08009 1 2.51962 1.21799 2.0918C1.40973 1.71547 1.71547 1.40973 2.0918 1.21799C2.51962 1 3.08009 1 4.2002 1H13.8002C14.9203 1 15.4796 1 15.9074 1.21799C16.2837 1.40973 16.5905 1.71547 16.7822 2.0918C17 2.5192 17 3.07899 17 4.19691V13.8036C17 14.9215 17 15.4805 16.7822 15.9079C16.5905 16.2842 16.2837 16.5905 15.9074 16.7822C15.48 17 14.921 17 13.8031 17H4.19691C3.07899 17 2.5192 17 2.0918 16.7822C1.71547 16.5905 1.40973 16.2839 1.21799 15.9076C1 15.4798 1 14.9201 1 13.8V13.75"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  width?: number | string;
  height?: number | string;
}>();
</script>
