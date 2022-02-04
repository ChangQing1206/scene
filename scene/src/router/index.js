import Vue from 'vue'
import vuerouter from 'vue-router'
import login from '@/views/login.vue'
import manage from '@/views/manage.vue'
import home from '@/views/home.vue'
import sellTicket from '@/views/sellTicket.vue'
import ticketStatistics from '@/views/ticketStatistics.vue'
import dataCheck from '@/views/dataCheck.vue'
import posAnalysis from '@/views/posAnalysis.vue'
import consumeAnalysis from '@/views/consumeAnalysis.vue'
import adminSet from '@/views/adminSet.vue'
import explain from '@/views/explain.vue'
import monitor from '@/views/monitor.vue'

Vue.use(vuerouter)
const routes = [
  { path: '/', name: 'login', component: login },
  { path: '/manage', 
    name: 'manage', 
    component: manage,
    children: [{
			path: '',
			component: home,
			meta: [],
		},{
      path: '/monitor',
      component: monitor,
      meta: ['监控平台']
    },{
			path: '/sellTicket',
			component: sellTicket,
			meta: ['门票管理', '售票'],
		},{
			path: '/ticketStatistics',
			component: ticketStatistics,
			meta: ['门票管理', '门票统计'],
		},{
			path: '/dataCheck',
			component: dataCheck,
			meta: ['数据管理', '游客数据查询'],
		},{
			path: '/posAnalysis',
			component: posAnalysis,
			meta: ['数据管理', '游客位置分析'],
		},{
			path: '/consumeAnalysis',
			component: consumeAnalysis,
			meta: ['数据管理', '游客消费分析'],
		},{
			path: '/adminSet',
			component: adminSet,
			meta: ['设置', '管理员设置'],
		},{
			path: '/explain',
			component: explain,
			meta: ['说明', '说明'],
		}]
  }
]

const router = new vuerouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router



