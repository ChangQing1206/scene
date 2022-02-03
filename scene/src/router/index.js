import Vue from 'vue'
import vuerouter from 'vue-router'
import login from '@/views/login.vue'
Vue.use(vuerouter)
const routes = [
  { path: '/', name: 'login', component: () => import(/* webpackChunkName: "about" */ '@/views/login.vue') }
]

const router = new vuerouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router



