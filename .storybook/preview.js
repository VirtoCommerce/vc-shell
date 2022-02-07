/* eslint-disable */
import "@virtoshell/ui/dist/ui.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { app } from '@storybook/vue3';
import { useBreakpoints } from "@vueuse/core";
import Vue3TouchEvents from "vue3-touch-events";

app.use(Vue3TouchEvents);
const bp = useBreakpoints({
    phone: 480,
    desktop: 1024,
});

app.config.globalProperties.pages = [];
app.config.globalProperties.$isPhone = bp.smaller("phone");
app.config.globalProperties.$isTablet = bp.between("phone", "desktop");
app.config.globalProperties.$isMobile = bp.smaller("desktop");
app.config.globalProperties.$isDesktop = bp.greater("desktop");
app.config.globalProperties.$isTouch =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

export const decorators = [
  () => ({
    template: "<div class='vc-theme_light' style='font-family: \"Roboto\"; font-size: var(--font-size-m); height: 100vh; width: 100%;'><story/></div>",
  }),
];
