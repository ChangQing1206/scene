import Vue from 'vue'
import vuerouter from 'vue-router'
import login from '@/views/login.vue'
import manage from '@/views/manage.vue'
import home from '@/views/home.vue'
import sellTicket from '@/views/sellTicket.vue'
import ticketStatistics from '@/views/ticketStatistics.vue'
import dataCheck from '@/views/dataCheck.vue'
import consumeCheck from '@/views/consumeCheck.vue'
import depositCheck from '@/views/depositCheck.vue'
import posAnalysis from '@/views/posAnalysis.vue'
import consumeAnalysis from '@/views/consumeAnalysis.vue'
import adminSet from '@/views/adminSet.vue'
import explain from '@/views/explain.vue'
import monitor from '@/views/monitor.vue'
import deposit from '@/views/deposit.vue'
import consume from '@/views/consume.vue'
Vue.use(vuerouter)

const routes = [
  { path: '/login', name: 'login', component: login },
  { path: '/manage', 
    name: 'manage', 
    component: manage,
    children: [{
			path: '',
			component: home,
			meta: ['首页'],
			role: ["游客", "商家", "管理员"]
		},{
      path: '/monitor',
      component: monitor,
      meta: ['监控平台'],
			role: ["游客", "商家", "管理员"]
    },{
			path: '/sellTicket',
			component: sellTicket,
			meta: ['门票管理', '售票'],
			// meta: [{title: '门票管理', role:'manage'}, '售票'],
			role: ["管理员"]
		},{
			path: '/ticketStatistics',
			component: ticketStatistics,
			meta: ['门票管理', '门票统计'],
			role: ["管理员"]
		},{
			path: '/dataCheck',
			component: dataCheck,
			meta: ['数据管理', '游客数据查询'],
			role: ["管理员"]
		},{
			path: '/consumeCheck',
			component: consumeCheck,
			meta: ['数据管理', '游客消费查询'],
			role: ["管理员"]
		},{
			path: '/posAnalysis',
			component: posAnalysis,
			meta: ['数据管理', '游客位置分析'],
			role: ["管理员"]
		},{
			path: '/consumeAnalysis',
			component: consumeAnalysis,
			meta: ['数据管理', '游客消费分析'],
			role: ["商家", "管理员"]
		},{
			path: '/depositCheck',
			component: depositCheck,
			meta: ['数据管理', '游客充值查询'],
			role: ["管理员"]
		},{
			path: '/deposit',
			component: deposit,
			meta: ['充值', '游客充值'],
			role: ["商家","管理员"]
		},
		{
			path: '/consume',
			component: consume,
			meta: ['消费', '游客消费'],
			role: ["商家", "管理员"]
		},
		{
			path: '/adminSet',
			component: adminSet,
			meta: ['设置', '管理员设置'],
			role: ["管理员"]
		},{
			path: '/explain',
			component: explain,
			meta: ['说明', '说明'],
			role: ["游客", "商家", "管理员"]
		},]
  }
]



const router = new vuerouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

Vue.$router = router;

router.beforeEach((to, from, next) => {
	// to:目标路由
	// from:源路由
	// next:下一步的操作，就是用户当前需要进行的操作

	// 判断当前用户是否登陆，如果登陆了则可以跳转，否则重定向到登陆页
	// 获取用户登陆之后的token，进行token的判断
	if (to.path !== '/login') { // 非登录页面验证是否存在token

		let token = window.localStorage.getItem('user_token')
		if (token) {
			next()
		} else {
			// 说明没有登陆，则重定向到登陆页
			next({
				name: 'login'
			})
		}
	} else {
		next()
	}
})

export default router



