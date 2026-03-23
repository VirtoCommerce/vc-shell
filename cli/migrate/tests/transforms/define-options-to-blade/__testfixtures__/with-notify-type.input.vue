<template><div>test</div></template>
<script setup lang="ts">
defineOptions({
  name: "Offer",
  url: "/offer",
  routable: false,
  notifyType: ["OfferCreatedDomainEvent", "OfferDeletedDomainEvent"],
});
</script>
