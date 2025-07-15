import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProdutividadeView from '../views/ProdutividadeView.vue'
import ChatView from '@/views/ChatView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/produtividade',
      name: 'produtividade',
      component: ProdutividadeView,
    },
    {
      path: '/ia',
      name: 'ia',
      component: ChatView
    }
  ],
})

export default router