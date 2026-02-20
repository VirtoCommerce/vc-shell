import { computed, defineComponent, h, type ComputedRef } from "vue";
import type { IBladeInstance } from "@shared/components/blade-navigation/types";
import { usePopup } from "@shared";
import { useI18n } from "vue-i18n";
import { VcLink } from "@ui/components";
import vcPopupError from "@shared/components/common/popup/vc-popup-error.vue";

/**
 * Encapsulates blade error state and the "error details" popup logic.
 *
 * Extracts three computeds and the `usePopup` setup that were previously
 * inline in vc-blade.vue's `<script setup>`.
 */
export function useBladeError(blade: ComputedRef<IBladeInstance>) {
  const { t } = useI18n({ useScope: "global" });

  const error = computed(() => blade.value.error ?? null);

  const hasError = computed(() => Boolean(error.value));

  const shortErrorMessage = computed(() => {
    const err = error.value;
    if (!err) return "";
    return err instanceof Error ? err.message : String(err);
  });

  const errorDetails = computed(() => {
    const err = error.value;
    if (!err) return "";
    if (err instanceof Error) {
      return (err as Error & { details?: string }).details || err.stack || String(err);
    }
    return String(err);
  });

  const { open } = usePopup({
    component: vcPopupError,
    slots: {
      default: errorDetails,
      header: defineComponent({
        render: () =>
          h("div", [
            t("COMPONENTS.ORGANISMS.VC_BLADE.ERROR_POPUP.TITLE"),
            " ",
            h(
              VcLink,
              { onClick: () => navigator.clipboard.writeText(errorDetails.value) },
              `(${t("COMPONENTS.ORGANISMS.VC_BLADE.ERROR_POPUP.COPY_ERROR")})`,
            ),
          ]),
      }),
    },
  });

  function openErrorDetails() {
    open();
  }

  return {
    hasError,
    shortErrorMessage,
    openErrorDetails,
  };
}
