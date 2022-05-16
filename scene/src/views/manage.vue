<template>
	<div class="manage_page fillcontain">
		<el-row style="height: 100%;">
      <el-col :span="4" style="min-height: 100%; background-color: #324057;">
				<el-menu :default-active="defaultActive" style="max-width:100%;" background-color="#324057" text-color="#ffffff" router>
					<el-menu-item v-show="powerArr[0]" index="manage"><i class="el-icon-menu"></i>首页</el-menu-item>
					<el-menu-item v-show="powerArr[1]" index="monitor"><i class="el-icon-location-outline"></i>监控平台</el-menu-item>

					<el-submenu v-show="powerArr[2]" index="3" style="overflow-x:hidden;/*解决子菜单宽度超出父级元素宽度*/">
						<template slot="title"><i class="el-icon-tickets"></i>门票管理</template>
						<el-menu-item v-show="powerArr[2]" index="sellTicket">售票</el-menu-item>
						<el-menu-item v-show="powerArr[3]" index="ticketStatistics">门票统计</el-menu-item>
					</el-submenu>
					<el-submenu v-show="powerArr[4]" index="2" style="overflow-x:hidden;/*解决子菜单宽度超出父级元素宽度*/">
						<template slot="title"><i class="el-icon-data-analysis"></i>数据管理</template>
						<el-menu-item v-show="powerArr[4]" index="dataCheck">游客数据查询</el-menu-item>
						<el-menu-item v-show="powerArr[5]" index="consumeCheck">游客消费查询</el-menu-item>
						<el-menu-item v-show="powerArr[5]" index="posAnalysis">游客位置分析</el-menu-item>
            <el-menu-item v-show="powerArr[7]" index="consumeAnalysis">游客消费分析</el-menu-item>
						<el-menu-item v-show="powerArr[8]" index="depositCheck">充值记录查询</el-menu-item>
					</el-submenu>
					<el-submenu v-show="powerArr[9]" index="4" style="overflow-x:hidden;/*解决子菜单宽度超出父级元素宽度*/">
						<template slot="title"><i class="el-icon-coin"></i>充值</template>
						<el-menu-item v-show="powerArr[9]" index="deposit">游客充值</el-menu-item>
					</el-submenu>
					<el-submenu v-show="powerArr[10]" index="5" style="overflow-x:hidden;/*解决子菜单宽度超出父级元素宽度*/">
						<template slot="title"><i class="el-icon-shopping-cart-full"></i>消费</template>
						<el-menu-item v-show="powerArr[10]" index="consume">游客消费</el-menu-item>
					</el-submenu>
					<el-submenu v-show="powerArr[11]"  index="6" style="overflow-x:hidden;/*解决子菜单宽度超出父级元素宽度*/">
						<template slot="title"><i class="el-icon-setting"></i>设置</template>
						<el-menu-item v-show="powerArr[11]" index="adminSet">管理员设置</el-menu-item>
					</el-submenu>
					<el-submenu v-show="powerArr[12]" index="7" style="overflow-x:hidden;/*解决子菜单宽度超出父级元素宽度*/">
						<template  slot="title"><i class="el-icon-warning"></i>说明</template>
						<el-menu-item v-show="powerArr[12]" index="explain">说明</el-menu-item>
					</el-submenu>
				</el-menu>
			</el-col>
			
			<el-col :span="20" style="height: 100%;overflow: auto;">
				<keep-alive>
          <router-view></router-view>
				</keep-alive>
			</el-col>
		</el-row>

  </div>
</template>

<script>
  export default {

		data() {
			return {
				powerArr: [],
				roleArr: []
			}
		},

		// 拿到登录上的角色和权限
    // 1.监控平台对所有人开放  2.数据管理对管理员开放
    computed: {
      defaultActive: function(){
        return this.$route.path.replace('/', '');
      },

    },
		created() {
			var role = localStorage.getItem("role")
			// var role = "管理员"
			this.routes();
			this.powerArr.length = 0;
			this.roleArr.forEach(item => {
				if(item.includes(role)) {
					this.powerArr.push(true)
				}else {
					this.powerArr.push(false)
				}
			})
		},
		methods: {
			routes() {
				this.roleArr.length = 0;
				var that = this
				this.$router.options.routes[1].children.forEach(item => {that.roleArr.push(item.role)})
			}
		}
  }
</script>


<style lang="less" scoped>
	@import '@/assets/css/mixin';
	.manage_page{
		
	}

</style>
