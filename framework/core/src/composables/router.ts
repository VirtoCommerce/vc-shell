import { App } from "vue";
import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  Router,
  RouteRecordRaw,
  useRouter as useVueRouter,
} from "vue-router";

interface IAppOptions {
  router?: {
    routes?: RouteRecordRaw[];
    historyAPI?: boolean;
  };
}

export function init(app: App, { router }: IAppOptions): App {
  console.debug("Init router");
  app.use(
    createRouter({
      history: router.historyAPI ? createWebHistory() : createWebHashHistory(),
      routes: [...router.routes],
    })
  );

  return app;
}

export default function useRouter(): Router {
  console.debug("useRouter entry point");
  return useVueRouter();
}
