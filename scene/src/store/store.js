import Vue from 'vue'
import Vuex from 'vuex'
import {getAdminInfo} from '@/api/api'

Vue.use(Vuex)

const state = {
	adminInfo: {
		// avatar: 'default.jpg'
		user: '',
		role: ''
	},
	// 景区电子围栏 在平台数据更新时,同时更新数据库
	// sceneFence: []
}

const mutations = {
	saveAdminInfo(state, adminInfo){
		state.adminInfo = adminInfo;
	}
}

const actions = {
	async getAdminData({commit}){
		try{
			const res = await getAdminInfo();
			console.log("getAdminInfo:", res);
			if (res.status == 1) {
				commit('saveAdminInfo', res.message);
			}else{
				throw new Error(res.type)
			}
		}catch(err){
			// console.log(err.message)
		}
	}
}

export default new Vuex.Store({
	state,
	actions,
	mutations,
})
