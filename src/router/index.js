import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '../pages/HomePage.vue'
import PetsPage from '../pages/PetsPage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/pets', component: PetsPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router