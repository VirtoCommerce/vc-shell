<template><div>test</div></template>
<script setup lang="ts">
defineOptions({
  name: "Entity",
  url: "/entity",
  routable: false,
  notifyType: ["EntityCreatedDomainEvent", "EntityDeletedDomainEvent"],
});
</script>
