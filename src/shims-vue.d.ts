/* eslint-disable */
import {Ref} from "vue";
import {MixedSchema} from "yup/es/mixed";

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

declare module 'yup' {
    interface StringSchema<T> {
        sequence(
            funcList: (() => MixedSchema)[],
        ): StringSchema<T>;
    }
}

export {}
