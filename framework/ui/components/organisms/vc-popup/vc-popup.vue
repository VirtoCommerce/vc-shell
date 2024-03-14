<template>
  <TransitionRoot
    appear
    show
    as="template"
  >
    <Dialog
      as="div"
      class="tw-relative tw-z-10"
      @close="closeModal"
    >
      <TransitionChild
        as="template"
        enter="tw-duration-300 tw-ease-out"
        enter-from="tw-opacity-0"
        enter-to="tw-opacity-100"
        leave="tw-duration-200 tw-ease-in"
        leave-from="tw-opacity-100"
        leave-to="tw-opacity-0"
      >
        <div class="tw-fixed tw-inset-0 tw-bg-black/25" />
      </TransitionChild>

      <div
        class="tw-fixed tw-inset-0 tw-overflow-y-auto"
        :class="{
          'tw-p-4': !isMobileView,
          'tw-p-0': isMobileView,
        }"
      >
        <div class="tw-flex tw-min-h-full tw-items-center tw-justify-center tw-text-center">
          <TransitionChild
            as="template"
            enter="tw-duration-300 tw-ease-out"
            enter-from="tw-opacity-0 tw-scale-95"
            enter-to="tw-opacity-100 tw-scale-100"
            leave="tw-duration-200 tw-ease-in"
            leave-from="tw-opacity-100 tw-scale-100"
            leave-to="tw-opacity-0 tw-scale-95"
          >
            <DialogPanel
              class="tw-w-full tw-transform tw-overflow-hidden tw-rounded-[5px] tw-bg-white tw-text-left tw-align-middle tw-shadow-xl tw-transition-all"
              :class="[
                {
                  'tw-flex tw-flex-col [max-height:calc(100vh-40px)]': !isMobileView,
                  'tw-max-w-full tw-h-[100dvh] tw-rounded-none tw-flex tw-flex-col': isMobileView,
                  '!tw-h-screen': isFullscreen,
                },
                modalWidth,
              ]"
            >
              <DialogTitle
                as="h3"
                class="tw-text-[18px] tw-font-semibold tw-leading-5 tw-text-[var(--header-color)] tw-flex tw-px-6 tw-py-5"
              >
                <slot name="header">{{ title }}</slot>

                <button
                  class="tw-h-[26px] tw-w-[26px] tw-bg-[var(--close-btn-bg)] tw-rounded-[4px] tw-inline-flex tw-items-center tw-justify-center tw-ml-auto hover:tw-bg-[var(--close-btn-bg-hover)] tw-outline-none"
                  @click="closeModal"
                >
                  <svg
                    v-if="closable"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.27173 5.99939L11.1499 2.12967C11.3198 1.95981 11.4152 1.72943 11.4152 1.48922C11.4152 1.24901 11.3198 1.01863 11.1499 0.848777C10.9801 0.67892 10.7497 0.583496 10.5096 0.583496C10.2694 0.583496 10.0391 0.67892 9.86922 0.848777L6.00004 4.72752L2.13086 0.848777C1.96103 0.67892 1.73069 0.583496 1.49051 0.583496C1.25033 0.583496 1.01999 0.67892 0.850156 0.848777C0.680324 1.01863 0.584913 1.24901 0.584913 1.48922C0.584913 1.72943 0.680324 1.95981 0.850156 2.12967L4.72835 5.99939L0.850156 9.86912C0.765622 9.95298 0.698526 10.0527 0.652737 10.1627C0.606948 10.2726 0.583374 10.3905 0.583374 10.5096C0.583374 10.6286 0.606948 10.7465 0.652737 10.8565C0.698526 10.9664 0.765622 11.0662 0.850156 11.15C0.934 11.2346 1.03375 11.3017 1.14366 11.3475C1.25356 11.3933 1.37145 11.4168 1.49051 11.4168C1.60957 11.4168 1.72746 11.3933 1.83736 11.3475C1.94727 11.3017 2.04702 11.2346 2.13086 11.15L6.00004 7.27126L9.86922 11.15C9.95306 11.2346 10.0528 11.3017 10.1627 11.3475C10.2726 11.3933 10.3905 11.4168 10.5096 11.4168C10.6286 11.4168 10.7465 11.3933 10.8564 11.3475C10.9663 11.3017 11.0661 11.2346 11.1499 11.15C11.2345 11.0662 11.3016 10.9664 11.3473 10.8565C11.3931 10.7465 11.4167 10.6286 11.4167 10.5096C11.4167 10.3905 11.3931 10.2726 11.3473 10.1627C11.3016 10.0527 11.2345 9.95298 11.1499 9.86912L7.27173 5.99939Z"
                      fill="#6E8BA5"
                    />
                  </svg>
                </button>
              </DialogTitle>

              <div class="tw-flex tw-w-full tw-min-h-0 tw-grow tw-gap-5 tw-px-6 tw-pb-5 tw-pt-3">
                <VcIcon
                  v-if="variant !== 'default'"
                  :class="['tw-self-center tw-text-[40px]', iconStyle]"
                  :icon="icon"
                />

                <div
                  class="tw-text-[14px] tw-font-normal tw-leading-[20px] tw-text-[var(--content-text-color)] tw-flex tw-items-center tw-flex-auto tw-overflow-y-auto [word-break:break-word]"
                  :class="{
                    'tw-grow': isMobileView,
                  }"
                >
                  <div
                    class="tw-flex tw-flex-auto tw-self-center tw-min-h-0 tw-max-h-[-webkit-fill-available]"
                    :class="{ 'tw-h-full': isFullscreen }"
                  >
                    <slot name="content"></slot>
                  </div>
                </div>
              </div>
              <div
                v-if="$slots.footer"
                class="tw-flex tw-items-center tw-px-6 tw-py-5 tw-border-t tw-border-t-[var(--footer-separator)] tw-border-solid"
              >
                <slot
                  name="footer"
                  :close="closeModal"
                >
                  <VcButton
                    class="tw-ml-auto"
                    @click="closeModal"
                    >{{ $t("COMPONENTS.ORGANISMS.VC_POPUP.CLOSE") }}</VcButton
                  >
                </slot>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts" setup>
import { Ref, computed, inject } from "vue";
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";

interface Props {
  title?: string;
  closable?: boolean;
  variant?: "default" | "error" | "warning" | "success";
  isMobileFullscreen?: boolean;
  isFullscreen?: boolean;
  modalWidth?: string;
}

interface Emits {
  (event: "close"): void;
}

const props = withDefaults(defineProps<Props>(), {
  closable: true,
  variant: "default",
  modalWidth: "tw-max-w-md",
});

const emit = defineEmits<Emits>();

defineSlots<{
  header: void;
  content: void;
  footer: (props: { close: () => void }) => void;
}>();

const isMobile = inject("isMobile") as Ref<boolean>;

const icon = computed(() => {
  switch (props.variant) {
    case "warning":
      return "fas fa-exclamation-circle";
    case "error":
      return "fas fa-times-circle";
    case "success":
      return "fas fa-check-circle";
    default:
      return "";
  }
});

const iconStyle = computed(() => {
  switch (props.variant) {
    case "warning":
      return "tw-text-[var(--warning-icon-color)]";
    case "error":
      return "tw-text-[var(--error-icon-color)]";
    case "success":
      return "tw-text-[var(--success-icon-color)]";
    default:
      return "";
  }
});

const isMobileView = computed(() => isMobile.value && props.isMobileFullscreen);

function closeModal() {
  emit("close");
}
</script>

<style lang="scss">
:root {
  --close-btn-bg: #f5f8fb;
  --close-btn-bg-hover: color-mix(in srgb, var(--close-btn-bg), #000 5%);
  --header-color: #465769;
  --content-text-color: #465769;
  --warning-icon-color: #ffbb0d;
  --error-icon-color: #ff4a4a;
  --success-icon-color: #87b563;
  --footer-separator: #ebebeb;
}
</style>
