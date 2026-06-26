import { createRouter, createWebHashHistory } from "vue-router";

import HomePage from "../pages/HomePage.vue";
import PetsPage from "../pages/PetsPage.vue";
import PetDetailsPage from "../pages/PetDetailsPage.vue";
import QuizPage from "../pages/QuizPage.vue";
import RegisterPage from "../pages/RegisterPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import RequestsPage from "../pages/RequestsPage.vue";
import FavoritesPage from "../pages/FavoritesPage.vue";
import AdminPetsPage from "../pages/AdminPetsPage.vue";

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
  },
  {
    path: "/register",
    name: "register",
    component: RegisterPage,
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
  },
  {
    path: "/requests",
    name: "requests",
    component: RequestsPage,
  },
  {
    path: "/favorites",
    name: "favorites",
    component: FavoritesPage,
  }
  ,
  {
    path: "/admin/pets",
    name: "admin-pets",
    component: AdminPetsPage,
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;