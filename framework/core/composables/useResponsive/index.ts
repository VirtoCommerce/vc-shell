import { inject, ref, type Ref } from "vue";
import { IsMobileKey, IsDesktopKey, IsPhoneKey, IsTabletKey, IsTouchKey } from "@framework/injection-keys";

export interface UseResponsiveReturn {
  isMobile: Ref<boolean>;
  isDesktop: Ref<boolean>;
  isPhone: Ref<boolean>;
  isTablet: Ref<boolean>;
  isTouch: boolean;
}

/**
 * Reactive breakpoint state.
 *
 * Replaces `$isMobile.value` / `$isDesktop.value` in templates
 * and `inject(IsMobileKey)` in script setup.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { isMobile, isDesktop } = useResponsive();
 * </script>
 * <template>
 *   <div v-if="isDesktop">Desktop only</div>
 * </template>
 * ```
 */
export function useResponsive(): UseResponsiveReturn {
  return {
    isMobile: inject(IsMobileKey, ref(false)),
    isDesktop: inject(IsDesktopKey, ref(true)),
    isPhone: inject(IsPhoneKey, ref(false)),
    isTablet: inject(IsTabletKey, ref(false)),
    isTouch: inject(IsTouchKey, false),
  };
}
