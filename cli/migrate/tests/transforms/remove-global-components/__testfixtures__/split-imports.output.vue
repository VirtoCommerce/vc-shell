<template>
  <div>
    <VcColumn field="name" />
  </div>
</template>

<script setup lang="ts">
import { useBlade } from "@vc-shell/framework";

import { VcColumn } from "@vc-shell/framework/ui";

const { closeSelf } = useBlade();
</script>
