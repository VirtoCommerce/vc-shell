<template>
  <vc-container class="dashboard vc-fill_all">
    <div
      class="dashboard-header vc-margin-vertical_m vc-padding-horizontal_s"
      v-if="$isDesktop.value"
    >
      Dashboard
    </div>
  </vc-container>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  props: {
    openPage: {
      type: Function,
      default: undefined,
    },
  },
  setup() {
    const router = useRouter();
    onMounted(() => {
      router.push("/");
    });
    return {};
  },
});
</script>

<style lang="less">
.dashboard {
  --card-header-background: transparent;

  &-header {
    font-size: 25px;
    color: #333333;
  }

  &-counters {
    flex-grow: 0 !important;
    flex-basis: 280px !important;

    .vc-app_mobile & {
      flex-grow: 1 !important;
      flex-basis: 0 !important;
    }

    &__title {
      font-size: 14px;
      font-weight: var(--font-weight-medium);
      color: #a9bfd2;
      text-align: center;
      margin-top: var(--margin-s);
    }

    &__value {
      font-size: 26px;
      font-weight: var(--font-weight-medium);
      color: #319ed4;
      text-align: center;
    }
  }

  &-review-header {
    color: #319ed4;
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-l);
    margin: var(--margin-xs) 0;
  }

  &-offers {
    &__counter {
      flex-grow: 1;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-left: 1px solid #e5e5e5;
      padding: var(--padding-xl);

      &:not(:last-child) {
        border-bottom: 1px solid #e5e5e5;
      }

      &:first-child {
        border-top: 1px solid #e5e5e5;
      }

      &-value {
        font-size: 32px;
        font-weight: var(--font-weight-medium);
        margin-bottom: var(--margin-s);

        &_error {
          color: #ff4a4a;
        }

        &_warning {
          color: #f89406;
        }
      }

      &-title {
        font-weight: var(--font-weight-bold);
        color: #6b7987;
      }
    }
  }
}

.vc-separator {
  height: 1px;
  background: #e3e7ec;
}
</style>
