/* eslint-disable */
import {Ref} from "vue";

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $isPhone: Ref<boolean>;
        $isTablet: Ref<boolean>;
        $isMobile: Ref<boolean>;
        $isDesktop: Ref<boolean>;
        $isTouch: boolean;
    }
}


declare module 'swiper' {
  import { DefineComponent } from 'vue';
  export const Swiper: DefineComponent;
  export const SwiperSlide: DefineComponent;
  export const SwiperComponent: DefineComponent
}

export {}
