import { createRouter, createWebHashHistory } from "vue-router";

import HomePage from "../pages/HomePage.vue";
import PetsPage from "../pages/PetsPage.vue";
import PetDetailsPage from "../pages/PetDetailsPage.vue";
import QuizPage from "../pages/QuizPage.vue";

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
  {
  path: "/pets/:id",
  name: "pet-details",
  component: PetDetailsPage,
},
  {
  path: "/quiz",
  name: "quiz",
  component: QuizPage,
}
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;