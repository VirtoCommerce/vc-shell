<template>
  <div>
    <VcHeader
      version="3.0.0"
      :logo="require('~/assets/img/logo.svg')"
    ></VcHeader>

    <div class="container-fluid">
      <div class="row">
        <VcMainMenu :items="mainMenuItems"></VcMainMenu>

        <Nuxt />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { VcHeader, VcMainMenu } from '~/components/organisms'
import { useNavigation } from '~/libs/navigation'

export default {
  components: {
    VcHeader,
    VcMainMenu,
  },
  setup() {
    const { mainMenuItems } = useNavigation()

    return {
      mainMenuItems,
    }
  },
}
</script>
<style lang="scss">
@import '~/assets/scss/custom.scss';

.vc-content {
  //@extend .px-md-4;
  @extend .col-md-9;
  @extend .ml-sm-auto;
  @extend .col-lg-10;
  @extend .mx-0;
  @extend .px-0;
  @extend .d-md-flex;
  @extend .w-100;
  height: calc(100vh - 54px);
  &__blade {
    border-right: 1px #eaedf3 solid;
    @extend .mx-0;
    @extend .px-0;
    @extend .overflow-hidden;
    @extend .w-50;
  }
}

@mixin button-icon {
  @extend .border-0;
  @extend .bg-transparent;
  color: $white;
}
</style>
