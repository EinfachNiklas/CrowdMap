import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/IndexView.vue'),
    meta: { title: 'Home', layout: 'landing' }
  },
  {
    path: '/error/:code',
    alias: '/:pathMatch(.*)*',
    name: 'error',
    props: true,
    component: () => import('@/views/ErrorView.vue'),
    meta: { title: 'Error' }
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), 
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;            
    if (to.hash) return { el: to.hash, behavior: 'smooth' };
    return { top: 0 };
  }
});

router.beforeEach((to) => {
  const title = (to.meta?.title as string | undefined) ?? 'App';
  document.title = `${title} | EventApp`;
});



export default router;
