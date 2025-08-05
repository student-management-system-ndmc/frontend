import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/parents',
      name: 'parents',
      component: () => import('../views/ParentsView.vue'),
    },
    {
      path: '/parents/:id',
      name: 'parent-detail',
      component: () => import('../views/ParentDetailView.vue'),
    },
    {
      path: '/students',
      name: 'students',
      component: () => import('../views/StudentsView.vue'),
    },
    {
      path: '/students/:id',
      name: 'student-detail',
      component: () => import('../views/StudentDetailView.vue'),
    },
    {
      path: '/classes',
      name: 'classes',
      component: () => import('../views/ClassesView.vue'),
    },
    {
      path: '/subscriptions',
      name: 'subscriptions',
      component: () => import('../views/SubscriptionsView.vue'),
    },
    {
      path: '/subscriptions/:id',
      name: 'subscription-detail',
      component: () => import('../views/SubscriptionDetailView.vue'),
    },
  ],
})

export default router
