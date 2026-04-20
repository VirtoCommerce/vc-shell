<template>
  <div>Blade page</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBlade } from "@vc-shell/framework";

const { exposeToChildren } = useBlade();

defineBlade({
  name: "MyBlade",
  url: "/my",
});

const title = computed(() => "hello");

exposeToChildren({
  title,
});
</script>
