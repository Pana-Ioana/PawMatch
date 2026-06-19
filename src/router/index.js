import { createRouter, createWebHashHistory } from "vue-router";

import HomePage from "../pages/HomePage.vue";
import PetsPage from "../pages/PetsPage.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
    path: "/pets",
    name: "pets",
    component: PetsPage,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;