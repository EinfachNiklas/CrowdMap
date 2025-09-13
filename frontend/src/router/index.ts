import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import { checkValidity } from '@/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    props: (route) => {
      const raw = typeof route.query.overlayType === 'string' ? route.query.overlayType : undefined;
      const type = raw === 'signin' || raw === 'signup' ? raw : undefined;
      const active = route.query.overlayActive === 'true' && !!type;
      return { overlayActive: active, overlayType: type };
    },
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
  }
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

router.beforeEach(async (to) => {
  const title = (to.meta?.title as string | undefined) ?? 'App';
  document.title = `${title} | EventApp`;
  const authed = to.meta?.requiresAuth ? await checkValidity() : false;
  const isGuestOnly = (
    to.name === "home" &&
    to.query.overlayActive === "true" &&
    ['signin', 'signup'].includes(String(to.query.overlayType ?? ''))
  );

  if (to.meta?.requiresAuth && !authed) {
    return { name: 'home', query: { overlayActive: "true", overlayType: "signin" } };
  }
  if ((to.meta?.guestOnly || isGuestOnly) && await checkValidity()) {
    return { name: 'home' };
  }
});



export default router;
