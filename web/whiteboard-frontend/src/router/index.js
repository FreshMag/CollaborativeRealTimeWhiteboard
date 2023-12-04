import { createRouter, createWebHashHistory } from 'vue-router'
import WhiteboardView from '../views/WhiteboardView.vue'
import LoginView from '../views/LoginView.vue'
import WhiteboardsListView from '../views/WhiteboardsListView.vue'
import HomepageView from "@/views/HomepageView.vue";
import UserProfileView from '../views/UserProfileView.vue'
import NotificationView from "@/views/NotificationView.vue";

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomepageView
  },
  {
    path: '/whiteboard/:id',
    name: 'Whiteboard',
    component: WhiteboardView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/whiteboards',
    name: 'Whiteboards',
    component: WhiteboardsListView
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: UserProfileView
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: NotificationView
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) =>{
  document.title = to.name;
})

export default router
