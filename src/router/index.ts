import { createRouter, createWebHashHistory } from "vue-router";
import Dashboard from "../pages/Dashboard.vue";
import Invite from "../pages/Invite.vue";
import ResetPassword from "../pages/ResetPassword.vue";
import { OrdersEdit, OrdersList } from "../modules/orders";
import { ProductsList, ProductsEdit } from "../modules/products";
import { OffersDetails, OffersList } from "../modules/offers";
import { MpProductsList, MpProductsEdit } from "../modules/marketplace-products";
import Login from "./../pages/Login.vue";
import App from "./../pages/App.vue";
import {
  ImportNew,
  ImportProfileDetails,
  ImportProfileSelector,
} from "../modules/import";
import { ReviewDetails, ReviewList } from "../modules/rating";
import { SellerDetails, TeamList } from "../modules/settings";
import { usePermissions, useUser } from "@vc-shell/core";
import whiteLogoImage from "/assets/logo-white.svg";
import bgImage from "/assets/background.jpg";
import { BladeComponent, IPage } from "@vc-shell/ui";

const { checkPermission } = usePermissions();

const routes = [
  {
    path: "/",
    component: App,
    name: "App",
    children: [
      {
        name: "Dashboard",
        path: "",
        alias: "/",
        component: Dashboard,
      },
      {
        name: "Offers",
        path: "offers",
        props: true,
        component: OffersList,
      },
      {
        name: "OfferDetails",
        path: "offer/:param?",
        props: true,
        component: OffersDetails,
      },
      {
        name: "Products",
        path: "products",
        props: true,
        component: ProductsList,
      },
      {
        name: "ProductsEdit",
        path: "product/:param?",
        component: ProductsEdit,
        props: true,
      },
      {
        name: "MpProducts",
        path: "all-products",
        props: true,
        component: MpProductsList,
      },
      {
        name: "MpProductsEdit",
        path: "product/:param?",
        component: MpProductsEdit,
        props: true,
      },
      {
        name: "Orders",
        path: "orders",
        component: OrdersList,
        props: true,
      },
      {
        name: "OfferDetails",
        path: "order/:param?",
        props: true,
        component: OrdersEdit,
      },
      {
        name: "Import",
        path: "import",
        component: ImportProfileSelector,
        props: true,
      },
      {
        name: "ImportProfileDetails",
        path: "import-profile-details/:param?",
        component: ImportProfileDetails,
        props: true,
      },
      {
        name: "Importer",
        path: "importer/:param?",
        component: ImportNew,
        props: true,
      },
      {
        name: "Reviews",
        path: "reviews",
        component: ReviewList,
        props: true,
      },
      {
        name: "ReviewDetails",
        path: "review-details",
        component: ReviewDetails,
        props: true,
      },

      {
        name: "SellerDetailsEdit",
        path: "seller-details-edit",
        component: SellerDetails,
        props: true,
      },

      {
        name: "Team",
        path: "team",
        component: TeamList,
        props: true,
      },
    ],
    beforeEnter: [checkAuth],
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      logo: whiteLogoImage,
      background: bgImage,
      title: "Vendor Portal",
    },
  },
  {
    name: "invite",
    path: "/invite",
    component: Invite,
    props: (route) => ({
      userId: route.query.userId,
      token: route.query.token,
      userName: route.query.userName,
    }),
  },
  {
    name: "resetpassword",
    path: "/resetpassword",
    component: ResetPassword,
    props: (route) => ({
      userId: route.query.userId,
      token: route.query.token,
      userName: route.query.userName,
    }),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.APP_BASE_PATH as string),
  routes,
});

router.beforeEach((to, from, next) => {
  const bladeComponent: BladeComponent =
    to.matched[to.matched.length - 1]?.components?.default;

  if (bladeComponent && bladeComponent.permissions) {
    if (checkPermission(bladeComponent.permissions)) {
      next();
    } else {
      if (!from.matched.length) {
        next({ name: "Dashboard" });
      } else {
        // TODO temporary access alert
        alert("Access restricted");
      }
    }
  } else {
    next();
  }
});

async function checkAuth(to, from, next) {
  const { getAccessToken } = useUser();

  const token = await getAccessToken();

  if (!token && to.name !== "Login") {
    next({ name: "Login" });
  } else {
    next();
  }
}
